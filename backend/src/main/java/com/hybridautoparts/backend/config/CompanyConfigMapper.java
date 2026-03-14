package com.hybridautoparts.backend.config;

import com.hybridautoparts.backend.dto.CompanyConfigDto;
import com.hybridautoparts.backend.model.CompanyConfig;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CompanyConfigMapper {

    CompanyConfigDto toDto(CompanyConfig entity);
}
