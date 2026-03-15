package com.hybridautoparts.backend.config;

import java.nio.file.Path;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.media")
public record MediaProperties(
        Path uploadsPath,
        String urlPrefix
) {
}
