package com.cara.exception;

/** Thrown when a requested resource does not exist; mapped to HTTP 404. */
public class NotFoundException extends RuntimeException {

    public NotFoundException(String resource, Object id) {
        super("No " + resource + " with id " + id);
    }
}
