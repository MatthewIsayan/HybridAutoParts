package com.hybridautoparts.backend;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.hybridautoparts.backend.model.Part;
import com.hybridautoparts.backend.repository.PartRepository;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.web.servlet.MockMvc;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
class PublicInventoryControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PartRepository partRepository;

    @Test
    void returnsCompanyConfiguration() throws Exception {
        mockMvc.perform(get("/api/public/company"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName").value("Hybrid Auto Parts"))
                .andExpect(jsonPath("$.phone").value("818-767-5656 / 818-293-9630"))
                .andExpect(jsonPath("$.addressLine").value("9787 Glenoaks Blvd"))
                .andExpect(jsonPath("$.city").value("Sun Valley"))
                .andExpect(jsonPath("$.state").value("CA"));
    }

    @Test
    void returnsPaginatedInventoryResults() throws Exception {
        long totalParts = partRepository.count();

        mockMvc.perform(get("/api/public/parts")
                        .param("page", "0")
                        .param("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(2))
                .andExpect(jsonPath("$.totalElements").value(totalParts))
                .andExpect(jsonPath("$.totalPages").value((int) Math.ceil(totalParts / 2.0)))
                .andExpect(jsonPath("$.first").value(true))
                .andExpect(jsonPath("$.last").value(false))
                .andExpect(jsonPath("$.content[0].sku", Matchers.startsWith("EBAY-")))
                .andExpect(jsonPath("$.content[0].images[0].placeholder").value(false));
    }

    @Test
    void filtersInventoryResultsWithBaselineSearch() throws Exception {
        mockMvc.perform(get("/api/public/parts")
                        .param("search", "prius"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()", Matchers.greaterThan(0)))
                .andExpect(jsonPath("$.totalElements", Matchers.greaterThan(0)))
                .andExpect(jsonPath("$.content[0].title", Matchers.containsStringIgnoringCase("Prius")));
    }

    @Test
    void handlesMultiTermQueriesWithRankedSearch() throws Exception {
        mockMvc.perform(get("/api/public/parts")
                        .param("search", "2019 camry camera"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()", Matchers.greaterThan(0)))
                .andExpect(jsonPath("$.content[0].title", Matchers.containsStringIgnoringCase("Camera")))
                .andExpect(jsonPath("$.content[0].vehicleModel", Matchers.containsStringIgnoringCase("Camry")));
    }

    @Test
    void returnsPublicPartDetail() throws Exception {
        Part seededPart = partRepository.findAll(PageRequest.of(0, 1)).getContent().getFirst();

        mockMvc.perform(get("/api/public/parts/{partId}", seededPart.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sku").value(seededPart.getSku()))
                .andExpect(jsonPath("$.title").value(seededPart.getTitle()))
                .andExpect(jsonPath("$.images[0].placeholder").value(false));
    }

    @Test
    void returnsNotFoundForMissingPartDetail() throws Exception {
        mockMvc.perform(get("/api/public/parts/999"))
                .andExpect(status().isNotFound());
    }
}
