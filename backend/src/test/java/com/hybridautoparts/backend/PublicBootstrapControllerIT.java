package com.hybridautoparts.backend;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
class PublicBootstrapControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void returnsSeededBootstrapPayload() throws Exception {
        mockMvc.perform(get("/api/public/bootstrap"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.company.companyName").value("Hybrid Auto Parts"))
                .andExpect(jsonPath("$.company.phone").value("818-767-5656 / 818-293-9630"))
                .andExpect(jsonPath("$.company.city").value("Sun Valley"))
                .andExpect(jsonPath("$.featuredParts.length()").value(6))
                .andExpect(jsonPath("$.featuredParts[0].images[0].placeholder").value(false))
                .andExpect(content().string(Matchers.containsString("EBAY-")));
    }
}
