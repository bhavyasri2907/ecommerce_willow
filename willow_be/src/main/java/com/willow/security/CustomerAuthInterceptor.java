package com.willow.security;

import com.willow.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Requires a signed-in shopper for checkout, My Orders and the address book
 * (/api/orders/** and /api/account/**), and records who they are for {@link CustomerContext}.
 */
@Configuration
public class CustomerAuthInterceptor implements HandlerInterceptor, WebMvcConfigurer {

    private final AuthService authService;

    public CustomerAuthInterceptor(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(this).addPathPatterns("/api/orders", "/api/orders/**", "/api/account/**");
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;
        String token = SessionTokens.fromHeader(request.getHeader(HttpHeaders.AUTHORIZATION));
        request.setAttribute(CustomerContext.CUSTOMER_ID, authService.requireCustomerId(token)); // 401 if not signed in
        return true;
    }
}
