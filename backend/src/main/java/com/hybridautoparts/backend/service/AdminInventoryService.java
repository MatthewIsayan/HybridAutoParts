package com.hybridautoparts.backend.service;

import com.hybridautoparts.backend.config.PartMapper;
import com.hybridautoparts.backend.dto.AdminPartRequest;
import com.hybridautoparts.backend.dto.PartDto;
import com.hybridautoparts.backend.dto.PartPageDto;
import com.hybridautoparts.backend.model.Part;
import com.hybridautoparts.backend.repository.PartRepository;
import com.hybridautoparts.backend.repository.PartSearchRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminInventoryService {

    private final PartRepository partRepository;
    private final PartSearchRepository partSearchRepository;
    private final PartMapper partMapper;
    private final AdminAuditLogger adminAuditLogger;

    public AdminInventoryService(
            PartRepository partRepository,
            PartSearchRepository partSearchRepository,
            PartMapper partMapper,
            AdminAuditLogger adminAuditLogger
    ) {
        this.partRepository = partRepository;
        this.partSearchRepository = partSearchRepository;
        this.partMapper = partMapper;
        this.adminAuditLogger = adminAuditLogger;
    }

    @Transactional(readOnly = true)
    public PartPageDto getInventoryPage(int page, int size, String search, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"));
        String normalizedSearch = normalizeOptional(search);
        Page<Long> results = normalizedSearch == null
                ? partRepository.findAll(matchesStatus(status), pageable).map(Part::getId)
                : partSearchRepository.searchAdminPartIds(normalizedSearch, normalizeOptional(status), pageable);
        List<PartDto> content = mapPartsInPageOrder(results.getContent());

        return new PartPageDto(
                content,
                results.getNumber(),
                results.getSize(),
                results.getTotalElements(),
                results.getTotalPages(),
                results.isFirst(),
                results.isLast(),
                results.isEmpty()
        );
    }

    @Transactional(readOnly = true)
    public PartDto getPart(long partId) {
        Part part = partRepository.findDetailedById(partId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Part was not found."));

        return partMapper.toDto(part);
    }

    @Transactional
    public PartDto createPart(AdminPartRequest request) {
        validateSkuUniqueness(request.sku(), null);

        Part part = new Part();
        applyRequest(part, request);
        Part savedPart = partRepository.save(part);
        adminAuditLogger.logPartCreated(savedPart.getId(), savedPart.getSku(), savedPart.getStatus());
        return partMapper.toDto(savedPart);
    }

    @Transactional
    public PartDto updatePart(long partId, AdminPartRequest request) {
        Part part = partRepository.findDetailedById(partId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Part was not found."));

        validateSkuUniqueness(request.sku(), partId);
        applyRequest(part, request);
        Part savedPart = partRepository.save(part);
        adminAuditLogger.logPartUpdated(savedPart.getId(), savedPart.getSku(), savedPart.getStatus());
        return partMapper.toDto(savedPart);
    }

    @Transactional
    public PartDto updateStatus(long partId, String status) {
        Part part = partRepository.findDetailedById(partId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Part was not found."));

        String previousStatus = part.getStatus();
        part.setStatus(normalizeRequired(status));
        Part savedPart = partRepository.save(part);
        adminAuditLogger.logPartStatusChanged(savedPart.getId(), savedPart.getSku(), previousStatus, savedPart.getStatus());
        return partMapper.toDto(savedPart);
    }

    @Transactional
    public void deletePart(long partId) {
        Part part = partRepository.findById(partId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Part was not found."));
        partRepository.delete(part);
        adminAuditLogger.logPartDeleted(partId, part.getSku());
    }

    private void applyRequest(Part part, AdminPartRequest request) {
        part.setSku(normalizeRequired(request.sku()));
        part.setTitle(normalizeRequired(request.title()));
        part.setDescription(normalizeOptional(request.description()));
        part.setManufacturer(normalizeOptional(request.manufacturer()));
        part.setVehicleMake(normalizeOptional(request.vehicleMake()));
        part.setVehicleModel(normalizeOptional(request.vehicleModel()));
        part.setVehicleYear(normalizeOptional(request.vehicleYear()));
        part.setCondition(normalizeRequired(request.condition()));
        part.setStatus(normalizeRequired(request.status()));
        part.setLocationCode(normalizeRequired(request.locationCode()));
        part.setPrice(request.price());
        part.setFeatured(request.featured());
    }

    private void validateSkuUniqueness(String sku, Long partId) {
        String normalizedSku = normalizeRequired(sku);
        boolean exists = partId == null
                ? partRepository.existsBySkuIgnoreCase(normalizedSku)
                : partRepository.existsBySkuIgnoreCaseAndIdNot(normalizedSku, partId);

        if (exists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "SKU must be unique.");
        }
    }

    private List<PartDto> mapPartsInPageOrder(List<Long> ids) {
        if (ids.isEmpty()) {
            return List.of();
        }

        Map<Long, PartDto> byId = new HashMap<>();
        for (Part part : partRepository.findByIdIn(ids)) {
            byId.put(part.getId(), partMapper.toDto(part));
        }

        return ids.stream().map(byId::get).toList();
    }

    private Specification<Part> matchesStatus(String rawStatus) {
        String normalizedStatus = normalizeOptional(rawStatus);
        if (normalizedStatus == null) {
            return (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();
        }

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(criteriaBuilder.upper(root.get("status")), normalizedStatus.toUpperCase(Locale.ROOT));
    }

    private String normalizeRequired(String value) {
        return value.trim();
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
