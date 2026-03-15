package com.hybridautoparts.backend.controller;

import com.hybridautoparts.backend.dto.AdminPartImageOrderRequest;
import com.hybridautoparts.backend.dto.AdminPartRequest;
import com.hybridautoparts.backend.dto.AdminPartStatusRequest;
import com.hybridautoparts.backend.dto.PartDto;
import com.hybridautoparts.backend.dto.PartImageDto;
import com.hybridautoparts.backend.dto.PartPageDto;
import com.hybridautoparts.backend.service.AdminPartImageService;
import com.hybridautoparts.backend.service.AdminInventoryService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Validated
@RestController
@RequestMapping("/api/admin/parts")
@SecurityRequirement(name = "bearerAuth")
public class AdminPartController {

    private final AdminInventoryService adminInventoryService;
    private final AdminPartImageService adminPartImageService;

    public AdminPartController(
            AdminInventoryService adminInventoryService,
            AdminPartImageService adminPartImageService
    ) {
        this.adminInventoryService = adminInventoryService;
        this.adminPartImageService = adminPartImageService;
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

    @GetMapping("/{partId}/images")
    public List<PartImageDto> listImages(@PathVariable long partId) {
        return adminPartImageService.getImages(partId);
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

    @PostMapping(value = "/{partId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PartDto uploadImages(
            @PathVariable long partId,
            @RequestPart("files") List<MultipartFile> files,
            @RequestParam(required = false) List<String> altTexts
    ) {
        return adminPartImageService.uploadImages(partId, files, altTexts);
    }

    @PatchMapping("/{partId}/images/order")
    public PartDto reorderImages(@PathVariable long partId, @Valid @RequestBody AdminPartImageOrderRequest request) {
        return adminPartImageService.reorderImages(partId, request.imageIds());
    }

    @DeleteMapping("/{partId}/images/{imageId}")
    public PartDto deleteImage(@PathVariable long partId, @PathVariable long imageId) {
        return adminPartImageService.deleteImage(partId, imageId);
    }

    @DeleteMapping("/{partId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePart(@PathVariable long partId) {
        adminInventoryService.deletePart(partId);
    }
}
