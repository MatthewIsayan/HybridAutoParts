package com.hybridautoparts.backend;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminInventoryControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void supportsAuthorizedPartCrudAndPublicVisibilityChanges() throws Exception {
        String token = loginAsAdmin();

        MvcResult createResult = mockMvc.perform(post("/api/admin/parts")
                        .header("Authorization", bearerToken(token))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "sku": "PHASE2-CRUD-001",
                                  "title": "Phase 2 Integration Test Part",
                                  "description": "Created through the protected admin CRUD flow.",
                                  "manufacturer": "Hybrid Auto Parts",
                                  "vehicleMake": "Toyota",
                                  "vehicleModel": "Prius",
                                  "vehicleYear": "2015",
                                  "condition": "Tested",
                                  "status": "AVAILABLE",
                                  "locationCode": "T-100",
                                  "price": 199.99,
                                  "featured": false
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sku").value("PHASE2-CRUD-001"))
                .andReturn();

        long createdId = readJson(createResult).path("id").asLong();

        mockMvc.perform(get("/api/admin/parts")
                        .header("Authorization", bearerToken(token))
                        .param("search", "PHASE2-CRUD-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(createdId))
                .andExpect(jsonPath("$.content[0].title").value("Phase 2 Integration Test Part"));

        mockMvc.perform(put("/api/admin/parts/{partId}", createdId)
                        .header("Authorization", bearerToken(token))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "sku": "PHASE2-CRUD-001",
                                  "title": "Updated Phase 2 Integration Test Part",
                                  "description": "Updated through the protected admin CRUD flow.",
                                  "manufacturer": "Hybrid Auto Parts",
                                  "vehicleMake": "Toyota",
                                  "vehicleModel": "Prius Prime",
                                  "vehicleYear": "2018",
                                  "condition": "Refurbished",
                                  "status": "AVAILABLE",
                                  "locationCode": "T-200",
                                  "price": 249.99,
                                  "featured": true
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Phase 2 Integration Test Part"))
                .andExpect(jsonPath("$.featured").value(true));

        mockMvc.perform(get("/api/public/parts/{partId}", createdId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Phase 2 Integration Test Part"));

        mockMvc.perform(patch("/api/admin/parts/{partId}/status", createdId)
                        .header("Authorization", bearerToken(token))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "status": "SOLD"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SOLD"));

        mockMvc.perform(get("/api/public/parts/{partId}", createdId))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/admin/parts/{partId}", createdId)
                        .header("Authorization", bearerToken(token)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/admin/parts/{partId}", createdId)
                        .header("Authorization", bearerToken(token)))
                .andExpect(status().isNotFound());
    }

    @Test
    void updatesCompanyConfigAndReflectsItPublicly() throws Exception {
        String token = loginAsAdmin();

        mockMvc.perform(put("/api/admin/company")
                        .header("Authorization", bearerToken(token))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "companyName": "Hybrid Auto Parts Updated",
                                  "supportEmail": "updated@hybridautoparts.local",
                                  "phone": "818-000-0000",
                                  "addressLine": "123 Admin Way",
                                  "city": "Sun Valley",
                                  "state": "CA",
                                  "postalCode": "91352",
                                  "heroHeadline": "Updated by admin",
                                  "heroSubheadline": "Protected company settings are working.",
                                  "aboutText": "Phase 2 company config integration test update."
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName").value("Hybrid Auto Parts Updated"))
                .andExpect(jsonPath("$.supportEmail").value("updated@hybridautoparts.local"));

        mockMvc.perform(get("/api/public/company"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName").value("Hybrid Auto Parts Updated"))
                .andExpect(jsonPath("$.heroHeadline").value("Updated by admin"));
    }

    @Test
    void returnsPredictableValidationErrorsForInvalidPartSubmission() throws Exception {
        String token = loginAsAdmin();

        mockMvc.perform(post("/api/admin/parts")
                        .header("Authorization", bearerToken(token))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "sku": "",
                                  "title": "",
                                  "condition": "",
                                  "status": "",
                                  "locationCode": "",
                                  "price": 0
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("validation_error"))
                .andExpect(jsonPath("$.fieldErrors.sku").value("SKU is required."))
                .andExpect(jsonPath("$.fieldErrors.price").value("Price must be greater than zero."));
    }

    @Test
    void supportsMultiTermRankedSearchInAdminInventory() throws Exception {
        String token = loginAsAdmin();

        mockMvc.perform(get("/api/admin/parts")
                        .header("Authorization", bearerToken(token))
                        .param("search", "2019 camry camera")
                        .param("status", "AVAILABLE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(org.hamcrest.Matchers.greaterThan(0)))
                .andExpect(jsonPath("$.content[0].title").value(org.hamcrest.Matchers.containsStringIgnoringCase("Camera")))
                .andExpect(jsonPath("$.content[0].vehicleModel").value(org.hamcrest.Matchers.containsStringIgnoringCase("Camry")));
    }

    private String loginAsAdmin() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/admin/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "admin",
                                  "password": "password"
                                }
                                """))
                .andExpect(status().isOk())
                .andReturn();

        return readJson(result).path("accessToken").asText();
    }

    private JsonNode readJson(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    private String bearerToken(String token) {
        return "Bearer " + token;
    }
}
