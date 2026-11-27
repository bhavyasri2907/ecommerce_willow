package com.willow.security;

import com.willow.exception.UnauthorizedException;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

/**
 * Tells storefront controllers which shopper the current request is for. The id always comes
 * from the session token (checked by CustomerAuthInterceptor), never from the request body, so
 * a shopper can only ever reach their own orders and addresses.
 */
@Component
public class CustomerContext {

    static final String CUSTOMER_ID = CustomerContext.class.getName() + ".customerId";

    public Long customerId() {
        RequestAttributes request = RequestContextHolder.getRequestAttributes();
        Object id = request == null ? null : request.getAttribute(CUSTOMER_ID, RequestAttributes.SCOPE_REQUEST);
        if (id == null) throw new UnauthorizedException("Please sign in");
        return (Long) id;
    }
}
