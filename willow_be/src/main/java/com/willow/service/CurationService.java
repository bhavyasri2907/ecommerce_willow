package com.willow.service;

import com.willow.dto.request.AddPickRequest;
import com.willow.dto.response.CurationBoardDto;
import com.willow.dto.response.ProductDto;
import com.willow.entity.CuratedPick;
import com.willow.entity.Product;
import com.willow.entity.ProductStatus;
import com.willow.event.LiveEvent;
import com.willow.event.LiveEventPublisher;
import com.willow.exception.NotFoundException;
import com.willow.repository.CuratedPickRepository;
import com.willow.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Curated Fit: a seller picks other products on Willow to suggest alongside one of their own.
 * The product being styled must be the seller's; a pick can come from any store, and is
 * usually added by pasting its link from the Willow website.
 */
@Service
public class CurationService {

    /** How many picks one product's fit can hold. */
    public static final int MAX_PICKS = 12;

    private static final Pattern PRODUCT_PATH = Pattern.compile("^/product/(\\d+)/?$");

    private final CuratedPickRepository pickRepository;
    private final ProductRepository productRepository;
    private final LiveEventPublisher events;
    /** host[:port] of each address the Willow website is served from. */
    private final Set<String> storefrontAuthorities;
    private final String exampleLink;

    public CurationService(CuratedPickRepository pickRepository,
                           ProductRepository productRepository,
                           LiveEventPublisher events,
                           @Value("${willow.storefront.urls}") String[] storefrontUrls) {
        this.pickRepository = pickRepository;
        this.productRepository = productRepository;
        this.events = events;
        this.storefrontAuthorities = Arrays.stream(storefrontUrls)
                .map(url -> URI.create(url.trim()).getAuthority().toLowerCase(Locale.ROOT))
                .collect(Collectors.toSet());
        this.exampleLink = storefrontUrls[0].trim().replaceAll("/+$", "") + "/product/1001";
    }

    // ---- seller dashboard --------------------------------------------------------

    /** Each of the store's non-archived products, newest first, with its fit. */
    @Transactional(readOnly = true)
    public CurationBoardDto board(Long storeId) {
        Map<Long, List<ProductDto>> picksByProduct = new HashMap<>();
        for (CuratedPick c : pickRepository.findByProductStoreIdOrderByPositionAscIdAsc(storeId)) {
            picksByProduct.computeIfAbsent(c.getProduct().getId(), id -> new ArrayList<>()).add(ProductDto.from(c.getPick()));
        }
        List<CurationBoardDto.Entry> entries = productRepository.findByStoreIdAndStatusNot(storeId, ProductStatus.ARCHIVED).stream()
                .sorted(Comparator.comparing(Product::getCreatedAt).reversed())
                .map(p -> new CurationBoardDto.Entry(ProductDto.from(p), picksByProduct.getOrDefault(p.getId(), List.of())))
                .toList();
        return new CurationBoardDto(entries);
    }

    /** The fit of one of the store's products, including picks that are no longer on sale. */
    @Transactional(readOnly = true)
    public List<ProductDto> picksOf(Long storeId, Long productId) {
        own(storeId, productId);
        return pickRepository.findByProductIdOrderByPositionAscIdAsc(productId).stream()
                .map(c -> ProductDto.from(c.getPick()))
                .toList();
    }

    /**
     * Turns a link copied from the Willow website into the product it points to, so the
     * dashboard can show what is about to be added. Only products currently on sale qualify.
     */
    @Transactional(readOnly = true)
    public ProductDto resolveLink(String link) {
        return ProductDto.from(liveProduct(productIdFrom(link)));
    }

    @Transactional
    public ProductDto addPick(Long storeId, Long productId, AddPickRequest req) {
        Product product = own(storeId, productId);
        Long pickId = req.pickId() != null ? req.pickId() : productIdFrom(req.link());
        Product pick = liveProduct(pickId);
        checkPairing(product, pick);
        if (pickRepository.findByProductIdAndPickId(productId, pickId).isPresent()) {
            throw new IllegalStateException("\"" + pick.getName() + "\" is already in this fit");
        }
        long count = pickRepository.countByProductId(productId);
        if (count >= MAX_PICKS) {
            throw new IllegalStateException("A fit can have at most " + MAX_PICKS + " pieces. Remove one first.");
        }
        pickRepository.save(new CuratedPick(product, pick, (int) count));
        events.publish(storeId, LiveEvent.CURATION_CHANGED, Map.of("productId", productId, "pickId", pickId, "added", true));
        return ProductDto.from(pick);
    }

    @Transactional
    public void removePick(Long storeId, Long productId, Long pickId) {
        own(storeId, productId);
        pickRepository.findByProductIdAndPickId(productId, pickId).ifPresent(pickRepository::delete);
        events.publish(storeId, LiveEvent.CURATION_CHANGED, Map.of("productId", productId, "pickId", pickId, "added", false));
    }

    /**
     * Makes the product's fit exactly these picks, in this order. Used when the product form
     * is saved. Picks already in the fit are kept even if they have since gone off sale.
     */
    @Transactional
    public void setPicks(Product product, List<Long> pickIds) {
        List<Long> wanted = pickIds.stream().distinct().toList();
        if (wanted.size() > MAX_PICKS) {
            throw new IllegalArgumentException("A fit can have at most " + MAX_PICKS + " pieces");
        }
        Map<Long, CuratedPick> existing = pickRepository.findByProductIdOrderByPositionAscIdAsc(product.getId()).stream()
                .collect(Collectors.toMap(c -> c.getPick().getId(), c -> c));

        existing.values().stream().filter(c -> !wanted.contains(c.getPick().getId())).forEach(pickRepository::delete);
        for (int position = 0; position < wanted.size(); position++) {
            Long pickId = wanted.get(position);
            CuratedPick kept = existing.get(pickId);
            if (kept != null) {
                kept.setPosition(position);
            } else {
                Product pick = liveProduct(pickId);
                checkPairing(product, pick);
                pickRepository.save(new CuratedPick(product, pick, position));
            }
        }
        events.publish(product.getStore().getId(), LiveEvent.CURATION_CHANGED, Map.of("productId", product.getId()));
    }

    // ---- storefront ----------------------------------------------------------------

    /** What shoppers see on a product page: the seller's picks that are on sale right now. */
    @Transactional(readOnly = true)
    public List<ProductDto> curatedFit(Long productId) {
        return pickRepository.findByProductIdOrderByPositionAscIdAsc(productId).stream()
                .map(CuratedPick::getPick)
                .filter(pick -> pick.getStatus() == ProductStatus.LIVE)
                .map(ProductDto::from)
                .toList();
    }

    // ---- helpers ---------------------------------------------------------------------

    private Product own(Long storeId, Long productId) {
        return productRepository.findByIdAndStoreId(productId, storeId)
                .orElseThrow(() -> new NotFoundException("product", productId));
    }

    private Product liveProduct(Long id) {
        return productRepository.findById(id)
                .filter(p -> p.getStatus() == ProductStatus.LIVE)
                .orElseThrow(() -> new IllegalArgumentException("That product isn't on sale on Willow right now"));
    }

    private static void checkPairing(Product product, Product pick) {
        if (product.getId() != null && product.getId().equals(pick.getId())) {
            throw new IllegalArgumentException("A product can't be part of its own fit");
        }
    }

    /** The product id in a Willow product page link, e.g. http://localhost:5173/product/1001. */
    private Long productIdFrom(String link) {
        String problem = "Paste a product link copied from the Willow website, like " + exampleLink;
        if (link == null || link.isBlank()) throw new IllegalArgumentException(problem);
        URI uri;
        try {
            uri = URI.create(link.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(problem);
        }
        String authority = uri.getAuthority();
        if (authority == null || !storefrontAuthorities.contains(authority.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException("That link isn't from Willow. " + problem);
        }
        Matcher path = PRODUCT_PATH.matcher(uri.getPath() == null ? "" : uri.getPath());
        if (!path.matches()) {
            throw new IllegalArgumentException("That isn't a product page. " + problem);
        }
        return Long.valueOf(path.group(1));
    }
}
