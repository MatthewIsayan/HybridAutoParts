package com.hybridautoparts.backend.service;

import com.hybridautoparts.backend.config.CompanyConfigMapper;
import com.hybridautoparts.backend.config.PartMapper;
import com.hybridautoparts.backend.dto.BootstrapResponseDto;
import com.hybridautoparts.backend.model.CompanyConfig;
import com.hybridautoparts.backend.repository.CompanyConfigRepository;
import com.hybridautoparts.backend.repository.PartRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class BootstrapService {

    private final CompanyConfigRepository companyConfigRepository;
    private final PartRepository partRepository;
    private final CompanyConfigMapper companyConfigMapper;
    private final PartMapper partMapper;

    public BootstrapService(
            CompanyConfigRepository companyConfigRepository,
            PartRepository partRepository,
            CompanyConfigMapper companyConfigMapper,
            PartMapper partMapper
    ) {
        this.companyConfigRepository = companyConfigRepository;
        this.partRepository = partRepository;
        this.companyConfigMapper = companyConfigMapper;
        this.partMapper = partMapper;
    }

    public BootstrapResponseDto getBootstrapData() {
        CompanyConfig company = companyConfigRepository.findById(1L)
                .orElseThrow(() -> new EntityNotFoundException("Seeded company configuration was not found."));

        return new BootstrapResponseDto(
                companyConfigMapper.toDto(company),
                partRepository.findTop6ByFeaturedTrueOrderByIdAsc().stream().map(partMapper::toDto).toList()
        );
    }
}
