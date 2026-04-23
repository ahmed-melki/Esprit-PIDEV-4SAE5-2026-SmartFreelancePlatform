package tn.esprit.joboffre;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tn.esprit.joboffre.controllers.CandidatureController;
import tn.esprit.joboffre.entities.*;
import tn.esprit.joboffre.services.CandidatureService;

import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CandidatureController.class)
class CandidatureControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CandidatureService candidatureService;

    @Autowired
    private ObjectMapper objectMapper;

    private Candidature candidature;
    private Entretien entretien;
    private JobOffer job;

    @BeforeEach
    void setUp() {
        job = new JobOffer();
        job.setId(1L);
        job.setTitle("Développeur Java");

        candidature = new Candidature();
        candidature.setId(100L);
        candidature.setJobOffer(job);
        candidature.setCandidatId(5L);
        candidature.setStatut(StatutCandidature.EN_ATTENTE);
        candidature.setLettreMotivation("Je suis motivé");
        candidature.setCvUrl("https://cv.example.com/cv.pdf");
        candidature.setDatePostulation(LocalDateTime.now());

        entretien = new Entretien();
        entretien.setId(200L);
        entretien.setCandidature(candidature);
        entretien.setStatut(StatutEntretien.PLANIFIE);
        entretien.setDateHeure(LocalDateTime.now().plusDays(3));
        entretien.setLienVisio("https://meet.example.com/room");
        entretien.setDureeMinutes("60");
    }

    // ========== POST /api/candidatures/postuler ==========

    @Test
    void postuler_shouldReturn200WhenEligible() throws Exception {
        when(candidatureService.postuler(eq(1L), eq(5L), anyString(), anyString()))
                .thenReturn(candidature);

        Map<String, String> body = Map.of(
                "lettreMotivation", "Je suis motivé",
                "cvUrl", "https://cv.example.com/cv.pdf"
        );

        mockMvc.perform(post("/api/candidatures/postuler")
                        .param("jobId", "1")
                        .param("candidatId", "5")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100L))
                .andExpect(jsonPath("$.statut").value("EN_ATTENTE"))
                .andExpect(jsonPath("$.candidatId").value(5L));
    }





    // ========== PUT /api/candidatures/{id}/statut ==========

    @Test
    void updateStatut_shouldReturn200WithUpdatedCandidature() throws Exception {
        candidature.setStatut(StatutCandidature.ACCEPTEE);
        candidature.setCommentaireRecruteur("Excellent profil");

        when(candidatureService.updateStatut(eq(100L), eq(StatutCandidature.ACCEPTEE), anyString()))
                .thenReturn(candidature);

        Map<String, String> body = Map.of(
                "statut", "ACCEPTEE",
                "commentaire", "Excellent profil"
        );

        mockMvc.perform(put("/api/candidatures/100/statut")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("ACCEPTEE"))
                .andExpect(jsonPath("$.commentaireRecruteur").value("Excellent profil"));
    }

    @Test
    void updateStatut_toRefusee_shouldReturn200() throws Exception {
        candidature.setStatut(StatutCandidature.REFUSEE);
        when(candidatureService.updateStatut(eq(100L), eq(StatutCandidature.REFUSEE), anyString()))
                .thenReturn(candidature);

        Map<String, String> body = Map.of("statut", "REFUSEE", "commentaire", "Profil insuffisant");

        mockMvc.perform(put("/api/candidatures/100/statut")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("REFUSEE"));
    }

    // ========== GET /api/candidatures/job/{jobId} ==========

    @Test
    void getByJob_shouldReturnCandidaturesForJob() throws Exception {
        when(candidatureService.getCandidaturesByJob(1L)).thenReturn(List.of(candidature));

        mockMvc.perform(get("/api/candidatures/job/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(100L));
    }

    @Test
    void getByJob_shouldReturnEmptyListWhenNoCandidatures() throws Exception {
        when(candidatureService.getCandidaturesByJob(99L)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/candidatures/job/99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // ========== GET /api/candidatures/candidat/{candidatId} ==========

    @Test
    void getByCandidat_shouldReturnCandidaturesForCandidat() throws Exception {
        when(candidatureService.getCandidaturesByCandidat(5L)).thenReturn(List.of(candidature));

        mockMvc.perform(get("/api/candidatures/candidat/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].candidatId").value(5L));
    }

    // ========== GET /api/candidatures/{id} ==========

    @Test
    void getById_shouldReturnCandidatureWhenFound() throws Exception {
        when(candidatureService.getCandidatureById(100L)).thenReturn(candidature);

        mockMvc.perform(get("/api/candidatures/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100L))
                .andExpect(jsonPath("$.statut").value("EN_ATTENTE"));
    }



    // ========== GET /api/candidatures/job/{jobId}/stats ==========

    @Test
    void getStats_shouldReturnStatsMap() throws Exception {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", 10L);
        stats.put("enAttente", 3);
        stats.put("acceptees", 2);
        stats.put("refusees", 2);

        when(candidatureService.getStatsByJob(1L)).thenReturn(stats);

        mockMvc.perform(get("/api/candidatures/job/1/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(10))
                .andExpect(jsonPath("$.enAttente").value(3))
                .andExpect(jsonPath("$.acceptees").value(2));
    }

    // ========== POST /api/candidatures/{id}/entretien ==========

    @Test
    void planifierEntretien_shouldReturn200WithEntretien() throws Exception {
        when(candidatureService.planifierEntretien(eq(100L), any(LocalDateTime.class), anyString()))
                .thenReturn(entretien);

        Map<String, String> body = Map.of(
                "dateHeure", LocalDateTime.now().plusDays(5).toString(),
                "lienVisio", "https://meet.example.com/room"
        );

        mockMvc.perform(post("/api/candidatures/100/entretien")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(200L))
                .andExpect(jsonPath("$.statut").value("PLANIFIE"))
                .andExpect(jsonPath("$.lienVisio").value("https://meet.example.com/room"));
    }

    // ========== GET /api/candidatures/entretien/candidature/{id} ==========

    @Test
    void getEntretiens_shouldReturnEntretiensForCandidature() throws Exception {
        when(candidatureService.getEntretiensByCandidature(100L)).thenReturn(List.of(entretien));

        mockMvc.perform(get("/api/candidatures/entretien/candidature/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(200L))
                .andExpect(jsonPath("$[0].statut").value("PLANIFIE"));
    }

    @Test
    void getEntretiens_shouldReturnEmptyListWhenNone() throws Exception {
        when(candidatureService.getEntretiensByCandidature(100L)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/candidatures/entretien/candidature/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
