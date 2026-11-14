package com.willow.dto.response;

public record BulkResult(int updated, int skipped, String message) {}
