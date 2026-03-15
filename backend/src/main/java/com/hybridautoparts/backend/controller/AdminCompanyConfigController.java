package com.hybridautoparts.backend.controller;

import com.hybridautoparts.backend.dto.CompanyConfigDto;
import com.hybridautoparts.backend.dto.CompanyConfigUpdateRequest;
import com.hybridautoparts.backend.service.AdminCompanyConfigService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/company")
@SecurityRequirement(name = "bearerAuth")
public class AdminCompanyConfigController {

    private final AdminCompanyConfigService adminCompanyConfigService;

    public AdminCompanyConfigController(AdminCompanyConfigService adminCompanyConfigService) {
        this.adminCompanyConfigService = adminCompanyConfigService;
    }

    @GetMapping
    public CompanyConfigDto getCompanyConfig() {
        return adminCompanyConfigService.getCompanyConfig();
    }

    @PutMapping
    public CompanyConfigDto updateCompanyConfig(@Valid @RequestBody CompanyConfigUpdateRequest request) {
        return adminCompanyConfigService.updateCompanyConfig(request);
    }
}
