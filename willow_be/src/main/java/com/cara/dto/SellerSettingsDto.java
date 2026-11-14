package com.cara.dto;

import com.cara.model.SellerSettings;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.Instant;

public record SellerSettingsDto(
        @NotNull @Min(value = 0, message = "Threshold cannot be negative") @Max(1000) Integer lowStockThreshold,
        @NotNull Boolean autoConfirmOrders,
        @NotNull Boolean orderNotifications,
        @NotNull Boolean lowStockAlerts,
        @NotNull @Min(value = 0, message = "Return window cannot be negative") @Max(90) Integer returnWindowDays,
        @NotNull @DecimalMin(value = "0", message = "Shipping fee cannot be negative") BigDecimal shippingFee,
        @NotNull @DecimalMin(value = "0", message = "Threshold cannot be negative") BigDecimal freeShippingThreshold,
        @NotNull Boolean simulateLiveOrders,
        Instant updatedAt
) {
    public static SellerSettingsDto from(SellerSettings s) {
        return new SellerSettingsDto(s.getLowStockThreshold(), s.isAutoConfirmOrders(), s.isOrderNotifications(),
                s.isLowStockAlerts(), s.getReturnWindowDays(), s.getShippingFee(), s.getFreeShippingThreshold(),
                s.isSimulateLiveOrders(), s.getUpdatedAt());
    }
}
