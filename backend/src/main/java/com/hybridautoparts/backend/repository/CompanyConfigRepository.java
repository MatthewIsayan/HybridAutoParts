package com.hybridautoparts.backend.repository;

import com.hybridautoparts.backend.model.CompanyConfig;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyConfigRepository extends JpaRepository<CompanyConfig, Long> {
}
