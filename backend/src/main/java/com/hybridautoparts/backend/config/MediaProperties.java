package com.hybridautoparts.backend.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.nio.file.Path;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.media")
public record MediaProperties(
        @NotNull(message = "Media uploads path is required.")
        Path uploadsPath,
        @NotBlank(message = "Media URL prefix is required.")
        @Pattern(regexp = "^/.*$", message = "Media URL prefix must start with '/'.")
        String urlPrefix
) {
}
