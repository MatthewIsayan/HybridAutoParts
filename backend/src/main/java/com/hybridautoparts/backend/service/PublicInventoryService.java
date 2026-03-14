package com.hybridautoparts.backend.service;

import com.hybridautoparts.backend.config.CompanyConfigMapper;
import com.hybridautoparts.backend.config.PartMapper;
import com.hybridautoparts.backend.dto.CompanyConfigDto;
import com.hybridautoparts.backend.dto.PartDto;
import com.hybridautoparts.backend.dto.PartPageDto;
import com.hybridautoparts.backend.model.CompanyConfig;
import com.hybridautoparts.backend.model.Part;
import com.hybridautoparts.backend.repository.CompanyConfigRepository;
import com.hybridautoparts.backend.repository.PartRepository;
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
@Transactional(readOnly = true)
public class PublicInventoryService {

    private static final String AVAILABLE_STATUS = "AVAILABLE";

    private final PartRepository partRepository;
    private final CompanyConfigRepository companyConfigRepository;
    private final PartMapper partMapper;
    private final CompanyConfigMapper companyConfigMapper;

    public PublicInventoryService(
            PartRepository partRepository,
            CompanyConfigRepository companyConfigRepository,
            PartMapper partMapper,
            CompanyConfigMapper companyConfigMapper
    ) {
        this.partRepository = partRepository;
        this.companyConfigRepository = companyConfigRepository;
        this.partMapper = partMapper;
        this.companyConfigMapper = companyConfigMapper;
    }

    public PartPageDto getInventoryPage(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"));
        Page<Part> results = partRepository.findAll(buildInventorySpecification(search), pageable);
        List<Long> ids = results.getContent().stream().map(Part::getId).toList();
        List<PartDto> content = mapPartsInPageOrder(ids);

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

    public PartDto getPart(long partId) {
        Part part = partRepository.findByIdAndStatusIgnoreCase(partId, AVAILABLE_STATUS)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Part was not found."));

        return partMapper.toDto(part);
    }

    public CompanyConfigDto getCompanyConfig() {
        CompanyConfig companyConfig = companyConfigRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Company configuration was not found."
                ));

        return companyConfigMapper.toDto(companyConfig);
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

    private Specification<Part> buildInventorySpecification(String search) {
        return availableOnly().and(matchesSearch(search));
    }

    private Specification<Part> availableOnly() {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(criteriaBuilder.upper(root.get("status")), AVAILABLE_STATUS);
    }

    private Specification<Part> matchesSearch(String rawSearch) {
        String normalizedSearch = normalizeSearch(rawSearch);
        if (normalizedSearch == null) {
            return (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();
        }

        String likeValue = "%" + normalizedSearch + "%";
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

    private String normalizeSearch(String rawSearch) {
        if (rawSearch == null) {
            return null;
        }

        String normalized = rawSearch.trim().toLowerCase(Locale.ROOT);
        return normalized.isEmpty() ? null : normalized;
    }
}
