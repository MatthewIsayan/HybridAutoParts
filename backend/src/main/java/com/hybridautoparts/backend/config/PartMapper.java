package com.hybridautoparts.backend.config;

import com.hybridautoparts.backend.dto.PartDto;
import com.hybridautoparts.backend.model.Part;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = PartImageMapper.class)
public interface PartMapper {

    PartDto toDto(Part entity);
}
