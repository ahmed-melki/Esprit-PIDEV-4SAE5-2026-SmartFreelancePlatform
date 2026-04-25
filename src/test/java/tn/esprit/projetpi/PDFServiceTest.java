package tn.esprit.projetpi;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.projetpi.entities.Event;
import tn.esprit.projetpi.entities.Sponsorship;
import tn.esprit.projetpi.service.PDFService;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PDFServiceTest {

    @InjectMocks
    private PDFService pdfService;

    @Mock
    private Sponsorship sponsorship;

    @Mock
    private Event event;

    @BeforeEach
    void setUp() {
        when(sponsorship.getSponsorFirstName()).thenReturn("Omayma");
        when(sponsorship.getSponsorLastName()).thenReturn("Oun");
        when(sponsorship.getSponsorEmail()).thenReturn("omayma@test.com");
        when(sponsorship.getAmount()).thenReturn(BigDecimal.valueOf(500));

        when(event.getTitle()).thenReturn("Tech Conference");

        when(sponsorship.getEvent()).thenReturn(event);

        when(sponsorship.getDateCreated())
                .thenReturn(LocalDateTime.of(2026, 4, 22, 10, 30));
    }

    @Test
    void generatePDF_shouldReturnByteArray() throws IOException {
        // WHEN
        byte[] pdfBytes = pdfService.generatePDF(sponsorship);

        // THEN
        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
    }

    @Test
    void generatePDF_shouldCallSponsorshipData() throws IOException {
        // WHEN
        pdfService.generatePDF(sponsorship);

        // THEN (verify interactions)
        verify(sponsorship, atLeastOnce()).getSponsorFirstName();
        verify(sponsorship, atLeastOnce()).getSponsorLastName();
        verify(sponsorship, atLeastOnce()).getSponsorEmail();
        verify(sponsorship, atLeastOnce()).getAmount();
        verify(sponsorship, atLeastOnce()).getDateCreated();
        verify(sponsorship, atLeastOnce()).getEvent();
        verify(event, atLeastOnce()).getTitle();
    }

    @Test
    void generatePDF_shouldNotThrowException() {
        assertDoesNotThrow(() -> pdfService.generatePDF(sponsorship));
    }
}