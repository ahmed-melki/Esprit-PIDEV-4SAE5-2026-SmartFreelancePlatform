package tn.esprit.projetpi;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import tn.esprit.projetpi.SponsorshipDTO;
import tn.esprit.projetpi.entities.Event;
import tn.esprit.projetpi.entities.Sponsorship;
import tn.esprit.projetpi.service.SponsorshipService;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class SponsorshipServiceTest {

    private SponsorshipService sponsorshipService;

    @BeforeEach
    void setUp() {
        sponsorshipService = new SponsorshipService();
    }

    @Test
    void testConvertToDTO() {
        // Arrange
        Event event = new Event();
        event.setId(10L);

        Sponsorship sponsorship = new Sponsorship();
        sponsorship.setId(1L);
        sponsorship.setEvent(event);
        sponsorship.setSponsorId(100L);
        sponsorship.setSponsorFirstName("Omayma");
        sponsorship.setSponsorLastName("Oun");
        sponsorship.setSponsorEmail("omayma@test.com");
        sponsorship.setAmount(BigDecimal.valueOf(500.75));
        sponsorship.setDateCreated(LocalDateTime.now());
        sponsorship.setContractStatus("SIGNED");
        sponsorship.setPdfUrl("http://test.com/contract.pdf");

        // Act
        SponsorshipDTO dto = sponsorshipService.convertToDTO(sponsorship);

        // Assert
        assertNotNull(dto);
        assertEquals(1L, dto.getId());
        assertEquals(10L, dto.getEventId());
        assertEquals(100L, dto.getSponsorId());
        assertEquals("Omayma", dto.getSponsorFirstName());
        assertEquals("Oun", dto.getSponsorLastName());
        assertEquals("omayma@test.com", dto.getSponsorEmail());
        assertEquals(500.75, dto.getAmount());
        assertEquals("SIGNED", dto.getContractStatus());
        assertEquals("http://test.com/contract.pdf", dto.getPdfUrl());
    }
}