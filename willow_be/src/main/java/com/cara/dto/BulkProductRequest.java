package com.cara.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record BulkProductRequest(
        @NotEmpty(message = "Select at least one product") List<Long> ids,
        @NotNull(message = "Action is required") Action action
) {
    public enum Action { PUBLISH, DRAFT, ARCHIVE, DELETE }
}
