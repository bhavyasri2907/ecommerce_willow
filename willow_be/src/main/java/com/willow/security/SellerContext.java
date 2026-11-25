package com.willow.security;

import com.willow.exception.UnauthorizedException;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

/**
 * Tells seller controllers which store the current request is for. The store always comes
 * from the signed-in seller's session (set by SellerAuthInterceptor), never from anything
 * the browser sends, so one seller can never ask for another store's data.
 */
@Component
public class SellerContext {

    static final String STORE_ID = SellerContext.class.getName() + ".storeId";

    /** The signed-in seller's store. 401 if the request did not come through the seller guard. */
    public Long storeId() {
        RequestAttributes request = RequestContextHolder.getRequestAttributes();
        Object storeId = request == null ? null : request.getAttribute(STORE_ID, RequestAttributes.SCOPE_REQUEST);
        if (storeId == null) throw new UnauthorizedException("Please sign in to the seller panel");
        return (Long) storeId;
    }
}
