package tn.esprit.back.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tn.esprit.back.services.CertificationService;
import tn.esprit.back.services.ReviewService;
import tn.esprit.back.services.TitleService;
import tn.esprit.back.services.TrainingService;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TrainingService trainingService;

    @MockBean
    private CertificationService certificationService;

    @MockBean
    private ReviewService reviewService;

    @MockBean
    private TitleService titleService;

    @Test
    void shouldAllowLearningCrudWithoutToken() throws Exception {
        mockMvc.perform(post("/api/trainings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"Secure Training"}
                                """))
                .andExpect(status().isCreated());
    }

    @Test
    void shouldAllowLearningCrudForUserRole() throws Exception {
        mockMvc.perform(post("/api/trainings")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + TestJwtFactory.token("user-1", "USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"Secure Training"}
                                """))
                .andExpect(status().isCreated());
    }

    @Test
    void shouldAllowAdminEndpointForAdminRole() throws Exception {
        mockMvc.perform(post("/api/trainings")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + TestJwtFactory.token("admin-1", "ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"Secure Training"}
                                """))
                .andExpect(status().isCreated());
    }

    @Test
    void shouldAllowUserTitlesWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/titles/user/1"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldAllowUserRoleForUserTitles() throws Exception {
        mockMvc.perform(get("/api/titles/user/1")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + TestJwtFactory.token("user-1", "USER")))
                .andExpect(status().isOk());
    }
}
