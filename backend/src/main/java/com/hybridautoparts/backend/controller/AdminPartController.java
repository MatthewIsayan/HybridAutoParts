package com.hybridautoparts.backend.controller;

import com.hybridautoparts.backend.dto.AdminPartRequest;
import com.hybridautoparts.backend.dto.AdminPartStatusRequest;
import com.hybridautoparts.backend.dto.PartDto;
import com.hybridautoparts.backend.dto.PartPageDto;
import com.hybridautoparts.backend.service.AdminInventoryService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/admin/parts")
@SecurityRequirement(name = "bearerAuth")
public class AdminPartController {

    private final AdminInventoryService adminInventoryService;

    public AdminPartController(AdminInventoryService adminInventoryService) {
        this.adminInventoryService = adminInventoryService;
    }

    @GetMapping
    public PartPageDto listParts(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status
    ) {
        return adminInventoryService.getInventoryPage(page, size, search, status);
    }

    @GetMapping("/{partId}")
    public PartDto getPart(@PathVariable long partId) {
        return adminInventoryService.getPart(partId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PartDto createPart(@Valid @RequestBody AdminPartRequest request) {
        return adminInventoryService.createPart(request);
    }

    @PutMapping("/{partId}")
    public PartDto updatePart(@PathVariable long partId, @Valid @RequestBody AdminPartRequest request) {
        return adminInventoryService.updatePart(partId, request);
    }

    @PatchMapping("/{partId}/status")
    public PartDto updateStatus(@PathVariable long partId, @Valid @RequestBody AdminPartStatusRequest request) {
        return adminInventoryService.updateStatus(partId, request.status());
    }

    @DeleteMapping("/{partId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePart(@PathVariable long partId) {
        adminInventoryService.deletePart(partId);
    }
}
