package com.willow.dto.request;

import jakarta.validation.constraints.NotNull;

public record RecommendationRequest(
        @NotNull Long topId,
        @NotNull Long pantsId
) {}
