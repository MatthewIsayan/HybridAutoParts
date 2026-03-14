package com.hybridautoparts.backend.repository;

import com.hybridautoparts.backend.model.Part;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PartRepository extends JpaRepository<Part, Long> {

    @EntityGraph(attributePaths = "images")
    List<Part> findTop6ByFeaturedTrueOrderByIdAsc();
}
