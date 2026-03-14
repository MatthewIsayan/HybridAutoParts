package com.hybridautoparts.backend.repository;

import com.hybridautoparts.backend.model.CompanyConfig;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyConfigRepository extends JpaRepository<CompanyConfig, Long> {

    Optional<CompanyConfig> findFirstByOrderByIdAsc();
}
