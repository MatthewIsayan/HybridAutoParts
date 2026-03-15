package com.hybridautoparts.backend.service;

import com.hybridautoparts.backend.config.CompanyConfigMapper;
import com.hybridautoparts.backend.dto.CompanyConfigDto;
import com.hybridautoparts.backend.dto.CompanyConfigUpdateRequest;
import com.hybridautoparts.backend.model.CompanyConfig;
import com.hybridautoparts.backend.repository.CompanyConfigRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminCompanyConfigService {

    private final CompanyConfigRepository companyConfigRepository;
    private final CompanyConfigMapper companyConfigMapper;

    public AdminCompanyConfigService(
            CompanyConfigRepository companyConfigRepository,
            CompanyConfigMapper companyConfigMapper
    ) {
        this.companyConfigRepository = companyConfigRepository;
        this.companyConfigMapper = companyConfigMapper;
    }

    @Transactional(readOnly = true)
    public CompanyConfigDto getCompanyConfig() {
        return companyConfigMapper.toDto(loadCompanyConfig());
    }

    @Transactional
    public CompanyConfigDto updateCompanyConfig(CompanyConfigUpdateRequest request) {
        CompanyConfig companyConfig = loadCompanyConfig();
        companyConfig.setCompanyName(request.companyName().trim());
        companyConfig.setSupportEmail(request.supportEmail().trim());
        companyConfig.setPhone(request.phone().trim());
        companyConfig.setAddressLine(request.addressLine().trim());
        companyConfig.setCity(request.city().trim());
        companyConfig.setState(request.state().trim());
        companyConfig.setPostalCode(request.postalCode().trim());
        companyConfig.setHeroHeadline(request.heroHeadline().trim());
        companyConfig.setHeroSubheadline(request.heroSubheadline().trim());
        companyConfig.setAboutText(request.aboutText().trim());

        return companyConfigMapper.toDto(companyConfigRepository.save(companyConfig));
    }

    private CompanyConfig loadCompanyConfig() {
        return companyConfigRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Company configuration was not found."
                ));
    }
}
