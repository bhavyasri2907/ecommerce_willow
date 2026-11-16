package com.willow.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

/** Creates session tokens and the hashes they are stored under. */
public final class SessionTokens {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String BEARER = "Bearer ";

    private SessionTokens() {}

    /** A new 256-bit random token, safe to put in a header. */
    public static String generate() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public static String hash(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is not available", e);
        }
    }

    /** The token from an {@code Authorization: Bearer ...} header, or null when there isn't one. */
    public static String fromHeader(String authorization) {
        if (authorization == null || !authorization.startsWith(BEARER)) return null;
        String token = authorization.substring(BEARER.length()).trim();
        return token.isEmpty() ? null : token;
    }
}
