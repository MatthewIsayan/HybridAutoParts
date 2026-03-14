package com.hybridautoparts.backend.repository;

import com.hybridautoparts.backend.model.Part;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface PartRepository extends JpaRepository<Part, Long>, JpaSpecificationExecutor<Part> {

    @EntityGraph(attributePaths = "images")
    List<Part> findTop6ByFeaturedTrueOrderByIdAsc();

    @EntityGraph(attributePaths = "images")
    List<Part> findByIdIn(List<Long> ids);

    @EntityGraph(attributePaths = "images")
    Optional<Part> findByIdAndStatusIgnoreCase(Long id, String status);
}
