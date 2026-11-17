package com.willow.config;

import com.willow.service.UploadService;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.Duration;

/** Serves uploaded product photos at /uploads/<file>. File names are random, so they can be cached for long. */
@Configuration
public class UploadConfig implements WebMvcConfigurer {

    private final UploadService uploadService;

    public UploadConfig(UploadService uploadService) {
        this.uploadService = uploadService;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadService.directory().toUri().toString())
                .setCacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic());
    }
}
