package com.willow.service;

import com.willow.dto.response.SellerSettingsDto;
import com.willow.dto.response.StoreInfoDto;
import com.willow.dto.response.StorePoliciesDto;
import com.willow.dto.response.StoreProfileDto;
import com.willow.entity.SellerSettings;
import com.willow.entity.Store;
import com.willow.event.LiveEvent;
import com.willow.event.LiveEventPublisher;
import com.willow.exception.NotFoundException;
import com.willow.repository.SellerSettingsRepository;
import com.willow.repository.StoreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Stores and their settings. Every method works on one store, named by its id. */
@Service
public class StoreService {

    private static final int DEFAULT_LOW_STOCK_THRESHOLD = 10;

    private final StoreRepository storeRepository;
    private final SellerSettingsRepository settingsRepository;
    private final LiveEventPublisher events;

    public StoreService(StoreRepository storeRepository,
                        SellerSettingsRepository settingsRepository,
                        LiveEventPublisher events) {
        this.storeRepository = storeRepository;
        this.settingsRepository = settingsRepository;
        this.events = events;
    }

    /** Opens a new store with default settings. Called when a seller signs up. */
    @Transactional
    public Store createStore(String storeName, String ownerName, String email, String phone) {
        String name = storeName.trim();
        if (storeRepository.existsByStoreNameIgnoreCase(name)) {
            throw new IllegalStateException("A store called \"" + name + "\" already exists. Choose another name.");
        }
        Store store = new Store();
        store.setStoreName(name);
        store.setOwnerName(ownerName);
        store.setContactEmail(email);
        store.setContactPhone(phone);
        storeRepository.saveAndFlush(store);
        settingsRepository.save(new SellerSettings(store.getId()));
        return store;
    }

    public Store store(Long storeId) {
        return storeRepository.findById(storeId).orElseThrow(() -> new NotFoundException("store", storeId));
    }

    @Transactional(readOnly = true)
    public StoreProfileDto getProfile(Long storeId) {
        return StoreProfileDto.from(store(storeId));
    }

    @Transactional
    public StoreProfileDto updateProfile(Long storeId, StoreProfileDto req) {
        Store s = store(storeId);
        String name = req.storeName().trim();
        if (storeRepository.existsByStoreNameIgnoreCaseAndIdNot(name, storeId)) {
            throw new IllegalStateException("A store called \"" + name + "\" already exists. Choose another name.");
        }
        s.setStoreName(name);
        s.setTagline(blankToNull(req.tagline()));
        s.setDescription(blankToNull(req.description()));
        s.setOwnerName(blankToNull(req.ownerName()));
        s.setContactEmail(blankToNull(req.contactEmail()));
        s.setContactPhone(blankToNull(req.contactPhone()));
        s.setAddressLine(blankToNull(req.addressLine()));
        s.setCity(blankToNull(req.city()));
        s.setState(blankToNull(req.state()));
        s.setPincode(blankToNull(req.pincode()));
        s.setGstin(blankToNull(req.gstin()));
        s.setLogoUrl(blankToNull(req.logoUrl()));
        s.setWebsite(blankToNull(req.website()));
        s.setInstagram(blankToNull(req.instagram()));
        StoreProfileDto dto = StoreProfileDto.from(storeRepository.saveAndFlush(s));
        events.publish(storeId, LiveEvent.STORE_UPDATED, dto);
        return dto;
    }

    @Transactional
    public SellerSettingsDto getSettings(Long storeId) {
        return SellerSettingsDto.from(settings(storeId));
    }

    @Transactional
    public SellerSettingsDto updateSettings(Long storeId, SellerSettingsDto req) {
        SellerSettings s = settings(storeId);
        s.setLowStockThreshold(req.lowStockThreshold());
        s.setAutoConfirmOrders(req.autoConfirmOrders());
        s.setOrderNotifications(req.orderNotifications());
        s.setLowStockAlerts(req.lowStockAlerts());
        s.setReturnWindowDays(req.returnWindowDays());
        s.setShippingFee(req.shippingFee());
        s.setFreeShippingThreshold(req.freeShippingThreshold());
        s.setSimulateLiveOrders(req.simulateLiveOrders());
        SellerSettingsDto dto = SellerSettingsDto.from(settingsRepository.saveAndFlush(s));
        events.publish(storeId, LiveEvent.SETTINGS_UPDATED, dto);
        return dto;
    }

    /** A store's settings entity, for other services. Created with defaults if the row is missing. */
    @Transactional
    public SellerSettings settings(Long storeId) {
        return settingsRepository.findById(storeId)
                .orElseGet(() -> settingsRepository.save(new SellerSettings(storeId)));
    }

    @Transactional(readOnly = true)
    public int lowStockThreshold(Long storeId) {
        return settingsRepository.findById(storeId)
                .map(SellerSettings::getLowStockThreshold)
                .orElse(DEFAULT_LOW_STOCK_THRESHOLD);
    }

    /** Low-stock thresholds for several stores at once; stores without settings get the default. */
    @Transactional(readOnly = true)
    public Map<Long, Integer> lowStockThresholds(Collection<Long> storeIds) {
        Map<Long, Integer> thresholds = new HashMap<>();
        storeIds.forEach(id -> thresholds.put(id, DEFAULT_LOW_STOCK_THRESHOLD));
        settingsRepository.findAllById(storeIds)
                .forEach(s -> thresholds.put(s.getStoreId(), s.getLowStockThreshold()));
        return thresholds;
    }

    /** Stores that have the developer order simulator switched on. */
    @Transactional(readOnly = true)
    public List<Long> storesSimulatingOrders() {
        return settingsRepository.findBySimulateLiveOrdersTrue().stream().map(SellerSettings::getStoreId).toList();
    }

    /** A store's name, tagline and logo, as shown to shoppers. */
    @Transactional(readOnly = true)
    public StoreInfoDto getPublicInfo(Long storeId) {
        return StoreInfoDto.from(store(storeId));
    }

    /** Shipping charges and return windows of the given stores, as shown to shoppers. Unknown ids are skipped. */
    @Transactional
    public List<StorePoliciesDto> getPolicies(Collection<Long> storeIds) {
        return storeRepository.findAllById(storeIds).stream()
                .map(store -> StorePoliciesDto.from(store, settings(store.getId())))
                .toList();
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
