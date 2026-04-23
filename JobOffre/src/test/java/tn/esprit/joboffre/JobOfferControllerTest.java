package tn.esprit.joboffre;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tn.esprit.joboffre.controllers.JobOfferController;
import tn.esprit.joboffre.entities.*;
import tn.esprit.joboffre.services.JobOfferService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(JobOfferController.class)
class JobOfferControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JobOfferService jobOfferService;

    @Autowired
    private ObjectMapper objectMapper;

    private JobOffer sampleJob;

    @BeforeEach
    void setUp() {
        sampleJob = new JobOffer();
        sampleJob.setId(1L);
        sampleJob.setTitle("Développeur Java");
        sampleJob.setDescription("Poste Spring Boot");
        sampleJob.setCompany("TechCorp");
        sampleJob.setLocation("Paris");
        sampleJob.setContractType(ContractType.CDI);
        sampleJob.setSalaryMin(40000.0);
        sampleJob.setSalaryMax(60000.0);
        sampleJob.setStatus(JobStatus.OPEN);
        sampleJob.setDeadline(LocalDate.now().plusMonths(1));
        sampleJob.setCreatedAt(LocalDateTime.now());
        sampleJob.setUpdatedAt(LocalDateTime.now());
    }

    // ========== POST /api/jobs ==========

    @Test
    void create_shouldReturn200WithCreatedJob() throws Exception {
        when(jobOfferService.create(any(JobOffer.class))).thenReturn(sampleJob);

        mockMvc.perform(post("/api/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleJob)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Développeur Java"))
                .andExpect(jsonPath("$.company").value("TechCorp"))
                .andExpect(jsonPath("$.status").value("OPEN"));
    }

    // ========== GET /api/jobs ==========

    @Test
    void getAll_shouldReturnListOfJobs() throws Exception {
        JobOffer second = new JobOffer();
        second.setId(2L);
        second.setTitle("Data Scientist");

        when(jobOfferService.getAll()).thenReturn(List.of(sampleJob, second));

        mockMvc.perform(get("/api/jobs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[1].id").value(2L));
    }

    @Test
    void getAll_shouldReturnEmptyListWhenNoJobs() throws Exception {
        when(jobOfferService.getAll()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/jobs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // ========== GET /api/jobs/{id} ==========

    @Test
    void getById_shouldReturnJobWhenFound() throws Exception {
        when(jobOfferService.getById(1L)).thenReturn(sampleJob);

        mockMvc.perform(get("/api/jobs/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Développeur Java"));
    }



    // ========== PUT /api/jobs/{id} ==========

    @Test
    void update_shouldReturnUpdatedJob() throws Exception {
        sampleJob.setTitle("Senior Java Developer");
        when(jobOfferService.update(eq(1L), any(JobOffer.class))).thenReturn(sampleJob);

        mockMvc.perform(put("/api/jobs/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleJob)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Senior Java Developer"));
    }

    // ========== PATCH /api/jobs/{id} ==========

    @Test
    void updatePartial_shouldReturnPartiallyUpdatedJob() throws Exception {
        sampleJob.setTitle("Lead Dev");
        when(jobOfferService.updatePartial(eq(1L), anyMap())).thenReturn(sampleJob);

        Map<String, Object> patch = Map.of("title", "Lead Dev");

        mockMvc.perform(patch("/api/jobs/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(patch)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Lead Dev"));
    }

    // ========== DELETE /api/jobs/{id} ==========

    @Test
    void delete_shouldReturn200AndCallService() throws Exception {
        doNothing().when(jobOfferService).delete(1L);

        mockMvc.perform(delete("/api/jobs/1"))
                .andExpect(status().isOk());

        verify(jobOfferService).delete(1L);
    }

    // ========== GET /api/jobs/contract/{type} ==========

    @Test
    void getByContractType_shouldReturnMatchingJobs() throws Exception {
        when(jobOfferService.getByContractType(ContractType.CDI)).thenReturn(List.of(sampleJob));

        mockMvc.perform(get("/api/jobs/contract/CDI"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].contractType").value("CDI"));
    }

    // ========== GET /api/jobs/status/{status} ==========

    @Test
    void getByStatus_shouldReturnOpenJobs() throws Exception {
        when(jobOfferService.getByStatus(JobStatus.OPEN)).thenReturn(List.of(sampleJob));

        mockMvc.perform(get("/api/jobs/status/OPEN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].status").value("OPEN"));
    }

    // ========== GET /api/jobs/company/{company} ==========

    @Test
    void getByCompany_shouldReturnMatchingJobs() throws Exception {
        when(jobOfferService.getByCompany("TechCorp")).thenReturn(List.of(sampleJob));

        mockMvc.perform(get("/api/jobs/company/TechCorp"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].company").value("TechCorp"));
    }

    // ========== GET /api/jobs/search?keyword= ==========

    @Test
    void search_shouldReturnJobsMatchingKeyword() throws Exception {
        when(jobOfferService.search("java")).thenReturn(List.of(sampleJob));

        mockMvc.perform(get("/api/jobs/search").param("keyword", "java"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void search_shouldReturnEmptyListWhenNoMatch() throws Exception {
        when(jobOfferService.search("blockchain")).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/jobs/search").param("keyword", "blockchain"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // ========== GET /api/jobs/salary?min=&max= ==========

    @Test
    void getBySalaryRange_shouldReturnJobsInRange() throws Exception {
        when(jobOfferService.getBySalaryRange(30000.0, 70000.0)).thenReturn(List.of(sampleJob));

        mockMvc.perform(get("/api/jobs/salary")
                        .param("min", "30000")
                        .param("max", "70000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // ========== GET /api/jobs/open ==========

    @Test
    void getOpenJobs_shouldReturnOpenJobs() throws Exception {
        when(jobOfferService.getOpenJobs()).thenReturn(List.of(sampleJob));

        mockMvc.perform(get("/api/jobs/open"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].status").value("OPEN"));
    }
}
