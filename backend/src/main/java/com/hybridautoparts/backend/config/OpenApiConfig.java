package com.hybridautoparts.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private final String appVersion;

    public OpenApiConfig(@Value("${info.app.version:0.1.0}") String appVersion) {
        this.appVersion = appVersion;
    }

    @Bean
    OpenAPI hybridAutoPartsOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Hybrid Auto Parts API")
                .version(appVersion)
                .description("Foundation API for the Hybrid Auto Parts phased delivery plan.")
                .license(new License().name("Internal development only")))
                .schemaRequirement("bearerAuth", new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT"));
    }
}
