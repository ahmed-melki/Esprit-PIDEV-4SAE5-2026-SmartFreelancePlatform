package tn.esprit.projetpi.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.projetpi.SponsorshipDTO;
import tn.esprit.projetpi.entities.Event;
import tn.esprit.projetpi.entities.Sponsorship;
import tn.esprit.projetpi.repositories.EventRepository;
import tn.esprit.projetpi.repositories.SponsorshipRepository;
import tn.esprit.projetpi.service.PDFService;
import tn.esprit.projetpi.service.SponsorshipService;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sponsorships")
@CrossOrigin(origins = "http://localhost:4200")
public class SponsorshipController {

    @Autowired
    private SponsorshipRepository repository;

    @Autowired
    private EventRepository eventRepository; // Ajouté

    @Autowired
    private PDFService pdfService;

    @Autowired
    private SponsorshipService sponsorshipService;

    // Créer un sponsorship à partir d'un DTO
    @PostMapping
    public SponsorshipDTO createSponsorship(@RequestBody SponsorshipDTO dto) throws IOException {
        Sponsorship sponsorship = new Sponsorship();

        // Charger l'événement de la base de données
        Event event = eventRepository.findById(dto.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + dto.getEventId()));
        sponsorship.setEvent(event);

        // Gérer sponsorId avec valeur par défaut
        sponsorship.setSponsorId(dto.getSponsorId() != null ? dto.getSponsorId() : 0L);

        // Gérer le montant
        sponsorship.setAmount(BigDecimal.valueOf(dto.getAmount()));

        // Gérer le statut du contrat avec valeur par défaut
        if (dto.getContractStatus() != null && !dto.getContractStatus().isEmpty()) {
            sponsorship.setContractStatus(dto.getContractStatus());
        } else {
            sponsorship.setContractStatus("PENDING"); // Statut par défaut
        }

        // Gérer l'URL du PDF
        sponsorship.setPdfUrl(dto.getPdfUrl() != null ? dto.getPdfUrl() : "");

        // Informations du sponsor
        sponsorship.setSponsorFirstName(dto.getSponsorFirstName());
        sponsorship.setSponsorLastName(dto.getSponsorLastName());
        sponsorship.setSponsorEmail(dto.getSponsorEmail());

        // Définir la date de création
        sponsorship.setDateCreated(LocalDateTime.now());

        Sponsorship saved = repository.save(sponsorship);

        // Générer PDF initial
        byte[] pdfBytes = pdfService.generatePDF(saved);
        String pdfFileName = "contrat_sponsorship_" + saved.getId() + ".pdf";
        Path pdfPath = Paths.get("pdfs/" + pdfFileName);
        Files.createDirectories(pdfPath.getParent());
        Files.write(pdfPath, pdfBytes);

        saved.setPdfUrl("/pdfs/" + pdfFileName);
        repository.save(saved);


        return sponsorshipService.convertToDTO(saved);
    }

    // Récupérer un sponsorship par ID (DTO)
    @GetMapping("/{id}")
    public SponsorshipDTO getSponsorship(@PathVariable Long id) {
        Sponsorship sponsorship = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sponsorship not found with id: " + id));
        return sponsorshipService.convertToDTO(sponsorship);
    }

    // Signer le contrat
    @PostMapping("/{id}/sign")
    public SponsorshipDTO signContract(@PathVariable Long id) {
        Sponsorship sponsorship = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sponsorship not found with id: " + id));
        sponsorship.setContractStatus("SIGNED");
        Sponsorship saved = repository.save(sponsorship);
        return sponsorshipService.convertToDTO(saved);
    }

    // Générer le PDF
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> getPDF(@PathVariable Long id) throws IOException {
        Sponsorship sponsorship = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sponsorship not found with id: " + id));
        byte[] pdf = pdfService.generatePDF(sponsorship);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=contrat_sponsorship_" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    // Récupérer tous les sponsorships
    @GetMapping
    public List<SponsorshipDTO> getAllSponsorships() {
        return repository.findAll().stream()
                .map(sponsorshipService::convertToDTO)
                .collect(Collectors.toList());
    }

    // Supprimer un sponsorship
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSponsorship(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}