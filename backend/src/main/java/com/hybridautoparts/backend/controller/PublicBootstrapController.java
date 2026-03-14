package com.hybridautoparts.backend.controller;

import com.hybridautoparts.backend.dto.BootstrapResponseDto;
import com.hybridautoparts.backend.service.BootstrapService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
public class PublicBootstrapController {

    private final BootstrapService bootstrapService;

    public PublicBootstrapController(BootstrapService bootstrapService) {
        this.bootstrapService = bootstrapService;
    }

    @GetMapping("/bootstrap")
    public BootstrapResponseDto bootstrap() {
        return bootstrapService.getBootstrapData();
    }
}
