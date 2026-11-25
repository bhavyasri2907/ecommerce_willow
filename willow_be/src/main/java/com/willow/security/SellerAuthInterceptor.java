package com.willow.security;

import com.willow.entity.Seller;
import com.willow.service.SellerAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Requires a signed-in seller for everything under /api/seller, except /api/seller/auth,
 * and records which store that seller manages (read back through {@link SellerContext}).
 * The token normally arrives as {@code Authorization: Bearer <token>}; the live-events
 * stream also accepts {@code ?token=} because browsers' EventSource cannot send headers.
 */
@Configuration
public class SellerAuthInterceptor implements HandlerInterceptor, WebMvcConfigurer {

    private static final String EVENTS_PATH = "/api/seller/events";

    private final SellerAuthService authService;

    public SellerAuthInterceptor(SellerAuthService authService) {
        this.authService = authService;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(this)
                .addPathPatterns("/api/seller/**")
                .excludePathPatterns("/api/seller/auth/**");
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // CORS preflight carries no credentials; the real request that follows is checked.
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;

        String token = SessionTokens.fromHeader(request.getHeader(HttpHeaders.AUTHORIZATION));
        if (token == null && EVENTS_PATH.equals(request.getRequestURI())) {
            String param = request.getParameter("token");
            token = param == null || param.isBlank() ? null : param;
        }
        Seller seller = authService.requireSeller(token); // throws UnauthorizedException -> 401
        request.setAttribute(SellerContext.STORE_ID, seller.getStore().getId());
        return true;
    }
}
