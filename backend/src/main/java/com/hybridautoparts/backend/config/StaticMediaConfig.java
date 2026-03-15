package com.hybridautoparts.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticMediaConfig implements WebMvcConfigurer {

    private final MediaProperties mediaProperties;

    public StaticMediaConfig(MediaProperties mediaProperties) {
        this.mediaProperties = mediaProperties;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String normalizedPrefix = normalizeUrlPrefix();
        String uploadsLocation = mediaProperties.uploadsPath().toAbsolutePath().normalize().toUri().toString();
        if (!uploadsLocation.endsWith("/")) {
            uploadsLocation = uploadsLocation + "/";
        }

        registry.addResourceHandler(normalizedPrefix + "/**")
                .addResourceLocations(uploadsLocation);
    }

    private String normalizeUrlPrefix() {
        String prefix = mediaProperties.urlPrefix();
        if (prefix == null || prefix.isBlank()) {
            return "/uploads";
        }

        return prefix.startsWith("/") ? prefix : "/" + prefix;
    }
}
