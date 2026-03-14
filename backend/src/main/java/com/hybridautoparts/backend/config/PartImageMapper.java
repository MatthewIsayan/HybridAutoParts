package com.hybridautoparts.backend.config;

import com.hybridautoparts.backend.dto.PartImageDto;
import com.hybridautoparts.backend.model.PartImage;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PartImageMapper {

    PartImageDto toDto(PartImage entity);
}
