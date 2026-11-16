package com.willow.exception;

/** Thrown when a request has no valid sign-in; mapped to HTTP 401. */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}
