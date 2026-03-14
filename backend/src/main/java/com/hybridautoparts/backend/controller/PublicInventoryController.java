package com.hybridautoparts.backend.controller;

import com.hybridautoparts.backend.dto.CompanyConfigDto;
import com.hybridautoparts.backend.dto.PartDto;
import com.hybridautoparts.backend.dto.PartPageDto;
import com.hybridautoparts.backend.service.PublicInventoryService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/public")
public class PublicInventoryController {

    private final PublicInventoryService publicInventoryService;

    public PublicInventoryController(PublicInventoryService publicInventoryService) {
        this.publicInventoryService = publicInventoryService;
    }

    @GetMapping("/company")
    public CompanyConfigDto company() {
        return publicInventoryService.getCompanyConfig();
    }

    @GetMapping("/parts")
    public PartPageDto listParts(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "12") @Min(1) @Max(50) int size,
            @RequestParam(required = false) String search
    ) {
        return publicInventoryService.getInventoryPage(page, size, search);
    }

    @GetMapping("/parts/{partId}")
    public PartDto getPart(@PathVariable long partId) {
        return publicInventoryService.getPart(partId);
    }
}
