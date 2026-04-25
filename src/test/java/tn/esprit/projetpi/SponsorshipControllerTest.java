package tn.esprit.projetpi;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tn.esprit.projetpi.controllers.SponsorshipController;
import tn.esprit.projetpi.entities.Event;
import tn.esprit.projetpi.entities.Sponsorship;
import tn.esprit.projetpi.repositories.EventRepository;
import tn.esprit.projetpi.repositories.SponsorshipRepository;
import tn.esprit.projetpi.service.PDFService;
import tn.esprit.projetpi.service.SponsorshipService;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SponsorshipController.class)
class SponsorshipControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private SponsorshipRepository repository;

    @MockitoBean
    private EventRepository eventRepository;

    @MockitoBean
    private PDFService pdfService;

    @MockitoBean
    private SponsorshipService sponsorshipService;

    // ---------------- CREATE ----------------
    @Test
    void createSponsorship_shouldReturnOk() throws Exception {

        SponsorshipDTO dto = new SponsorshipDTO();
        dto.setEventId(1L);
        dto.setSponsorId(10L);
        dto.setAmount(500.0);
        dto.setSponsorFirstName("John");
        dto.setSponsorLastName("Doe");
        dto.setSponsorEmail("john@test.com");

        Event event = new Event();
        event.setId(1L);

        Sponsorship sponsorship = new Sponsorship();
        sponsorship.setId(1L);

        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(repository.save(any())).thenReturn(sponsorship);
        when(pdfService.generatePDF(any())).thenReturn(new byte[]{1,2,3});
        when(sponsorshipService.convertToDTO(any())).thenReturn(dto);

        mockMvc.perform(post("/api/sponsorships")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    // ---------------- GET BY ID ----------------
    @Test
    void getById_shouldReturnSponsorship() throws Exception {

        Sponsorship sponsorship = new Sponsorship();
        sponsorship.setId(1L);

        SponsorshipDTO dto = new SponsorshipDTO();
        dto.setSponsorFirstName("John");

        when(repository.findById(1L)).thenReturn(Optional.of(sponsorship));
        when(sponsorshipService.convertToDTO(sponsorship)).thenReturn(dto);

        mockMvc.perform(get("/api/sponsorships/1"))
                .andExpect(status().isOk());
    }

    // ---------------- SIGN CONTRACT ----------------
    @Test
    void signContract_shouldReturnOk() throws Exception {

        Sponsorship sponsorship = new Sponsorship();
        sponsorship.setId(1L);

        when(repository.findById(1L)).thenReturn(Optional.of(sponsorship));
        when(repository.save(any())).thenReturn(sponsorship);
        when(sponsorshipService.convertToDTO(any())).thenReturn(new SponsorshipDTO());

        mockMvc.perform(post("/api/sponsorships/1/sign"))
                .andExpect(status().isOk());
    }

    // ---------------- GET ALL ----------------
    @Test
    void getAll_shouldReturnList() throws Exception {

        Sponsorship sponsorship = new Sponsorship();
        sponsorship.setId(1L);

        when(repository.findAll()).thenReturn(List.of(sponsorship));
        when(sponsorshipService.convertToDTO(any())).thenReturn(new SponsorshipDTO());

        mockMvc.perform(get("/api/sponsorships"))
                .andExpect(status().isOk());
    }

    // ---------------- DELETE ----------------
    @Test
    void delete_shouldReturnOk() throws Exception {

        when(repository.existsById(1L)).thenReturn(true);

        mockMvc.perform(delete("/api/sponsorships/1"))
                .andExpect(status().isOk());
    }
}