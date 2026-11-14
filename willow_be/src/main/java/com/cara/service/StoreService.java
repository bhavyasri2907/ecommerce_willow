package com.cara.service;

import com.cara.dto.SellerSettingsDto;
import com.cara.dto.StoreProfileDto;
import com.cara.event.LiveEvent;
import com.cara.event.LiveEventPublisher;
import com.cara.model.SellerSettings;
import com.cara.model.StoreProfile;
import com.cara.repository.SellerSettingsRepository;
import com.cara.repository.StoreProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Store profile and seller settings. Both are single-row tables created on first access. */
@Service
public class StoreService {

    private final StoreProfileRepository profileRepository;
    private final SellerSettingsRepository settingsRepository;
    private final LiveEventPublisher events;

    public StoreService(StoreProfileRepository profileRepository,
                        SellerSettingsRepository settingsRepository,
                        LiveEventPublisher events) {
        this.profileRepository = profileRepository;
        this.settingsRepository = settingsRepository;
        this.events = events;
    }

    @Transactional
    public StoreProfileDto getProfile() {
        return StoreProfileDto.from(profileEntity());
    }

    @Transactional
    public StoreProfileDto updateProfile(StoreProfileDto req) {
        StoreProfile s = profileEntity();
        s.setStoreName(req.storeName().trim());
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
        StoreProfileDto dto = StoreProfileDto.from(profileRepository.saveAndFlush(s));
        events.publish(LiveEvent.STORE_UPDATED, dto);
        return dto;
    }

    @Transactional
    public SellerSettingsDto getSettings() {
        return SellerSettingsDto.from(settings());
    }

    @Transactional
    public SellerSettingsDto updateSettings(SellerSettingsDto req) {
        SellerSettings s = settings();
        s.setLowStockThreshold(req.lowStockThreshold());
        s.setAutoConfirmOrders(req.autoConfirmOrders());
        s.setOrderNotifications(req.orderNotifications());
        s.setLowStockAlerts(req.lowStockAlerts());
        s.setReturnWindowDays(req.returnWindowDays());
        s.setShippingFee(req.shippingFee());
        s.setFreeShippingThreshold(req.freeShippingThreshold());
        s.setSimulateLiveOrders(req.simulateLiveOrders());
        SellerSettingsDto dto = SellerSettingsDto.from(settingsRepository.saveAndFlush(s));
        events.publish(LiveEvent.SETTINGS_UPDATED, dto);
        return dto;
    }

    /** Settings entity for internal use by other services. */
    @Transactional
    public SellerSettings settings() {
        return settingsRepository.findById(SellerSettings.SINGLETON_ID)
                .orElseGet(() -> settingsRepository.save(new SellerSettings()));
    }

    @Transactional(readOnly = true)
    public int lowStockThreshold() {
        return settingsRepository.findById(SellerSettings.SINGLETON_ID)
                .map(SellerSettings::getLowStockThreshold)
                .orElse(10);
    }

    private StoreProfile profileEntity() {
        return profileRepository.findById(StoreProfile.SINGLETON_ID).orElseGet(() -> {
            StoreProfile s = new StoreProfile();
            s.setStoreName("Willow");
            return profileRepository.save(s);
        });
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
