package com.hybridautoparts.backend.service;

import com.hybridautoparts.backend.config.PartMapper;
import com.hybridautoparts.backend.dto.AdminPartRequest;
import com.hybridautoparts.backend.dto.PartDto;
import com.hybridautoparts.backend.dto.PartPageDto;
import com.hybridautoparts.backend.model.Part;
import com.hybridautoparts.backend.repository.PartRepository;
import java.util.List;
import java.util.Locale;
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
    private final PartMapper partMapper;

    public AdminInventoryService(PartRepository partRepository, PartMapper partMapper) {
        this.partRepository = partRepository;
        this.partMapper = partMapper;
    }

    @Transactional(readOnly = true)
    public PartPageDto getInventoryPage(int page, int size, String search, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"));
        Page<Part> results = partRepository.findAll(buildInventorySpecification(search, status), pageable);
        List<PartDto> content = results.getContent().stream()
                .map(partMapper::toDto)
                .toList();

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
        return partMapper.toDto(partRepository.save(part));
    }

    @Transactional
    public PartDto updatePart(long partId, AdminPartRequest request) {
        Part part = partRepository.findDetailedById(partId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Part was not found."));

        validateSkuUniqueness(request.sku(), partId);
        applyRequest(part, request);
        return partMapper.toDto(partRepository.save(part));
    }

    @Transactional
    public PartDto updateStatus(long partId, String status) {
        Part part = partRepository.findDetailedById(partId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Part was not found."));

        part.setStatus(normalizeRequired(status));
        return partMapper.toDto(partRepository.save(part));
    }

    @Transactional
    public void deletePart(long partId) {
        if (!partRepository.existsById(partId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Part was not found.");
        }

        partRepository.deleteById(partId);
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

    private Specification<Part> buildInventorySpecification(String search, String status) {
        return matchesSearch(search).and(matchesStatus(status));
    }

    private Specification<Part> matchesSearch(String rawSearch) {
        String normalizedSearch = normalizeOptional(rawSearch);
        if (normalizedSearch == null) {
            return (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();
        }

        String likeValue = "%" + normalizedSearch.toLowerCase(Locale.ROOT) + "%";
        return (root, query, criteriaBuilder) -> criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(root.get("sku")), likeValue),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), likeValue),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), likeValue),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("manufacturer")), likeValue),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("vehicleMake")), likeValue),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("vehicleModel")), likeValue),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("vehicleYear")), likeValue)
        );
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
