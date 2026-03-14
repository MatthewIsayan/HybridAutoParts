package com.hybridautoparts.backend.config;

import com.hybridautoparts.backend.dto.AdminUserDto;
import com.hybridautoparts.backend.model.AdminUser;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AdminUserMapper {

    AdminUserDto toDto(AdminUser entity);
}
