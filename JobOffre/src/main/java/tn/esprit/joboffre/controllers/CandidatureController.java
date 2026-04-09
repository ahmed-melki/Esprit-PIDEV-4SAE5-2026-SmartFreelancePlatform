package tn.esprit.joboffre.controllers;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.joboffre.entities.*;
import tn.esprit.joboffre.services.CandidatureService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/candidatures")
@CrossOrigin("*")
public class CandidatureController {

    private final CandidatureService candidatureService;

    public CandidatureController(CandidatureService candidatureService) {
        this.candidatureService = candidatureService;
    }

    // ========== CANDIDATURE ==========

    @PostMapping("/postuler")
    public ResponseEntity<Candidature> postuler(
            @RequestParam Long jobId,
            @RequestParam Long candidatId,
            @RequestBody Map<String, String> body) {
        String lettreMotivation = body.get("lettreMotivation");
        String cvUrl = body.get("cvUrl");
        return ResponseEntity.ok(candidatureService.postuler(jobId, candidatId, lettreMotivation, cvUrl));
    }

    @PutMapping("/{candidatureId}/statut")
    public ResponseEntity<Candidature> updateStatut(
            @PathVariable Long candidatureId,
            @RequestBody Map<String, String> body) {
        StatutCandidature statut = StatutCandidature.valueOf(body.get("statut"));
        String commentaire = body.get("commentaire");
        return ResponseEntity.ok(candidatureService.updateStatut(candidatureId, statut, commentaire));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<Candidature>> getByJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(candidatureService.getCandidaturesByJob(jobId));
    }

    @GetMapping("/candidat/{candidatId}")
    public ResponseEntity<List<Candidature>> getByCandidat(@PathVariable Long candidatId) {
        return ResponseEntity.ok(candidatureService.getCandidaturesByCandidat(candidatId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Candidature> getById(@PathVariable Long id) {
        return ResponseEntity.ok(candidatureService.getCandidatureById(id));
    }

    @GetMapping("/job/{jobId}/stats")
    public ResponseEntity<Map<String, Object>> getStats(@PathVariable Long jobId) {
        return ResponseEntity.ok(candidatureService.getStatsByJob(jobId));
    }

    // ========== ENTRETIEN ==========

    @PostMapping("/{candidatureId}/entretien")
    public ResponseEntity<Entretien> planifierEntretien(
            @PathVariable Long candidatureId,
            @RequestBody Map<String, String> body) {
        LocalDateTime dateHeure = LocalDateTime.parse(body.get("dateHeure"));
        String lienVisio = body.get("lienVisio");
        return ResponseEntity.ok(candidatureService.planifierEntretien(candidatureId, dateHeure, lienVisio));
    }

    @GetMapping("/entretien/candidature/{candidatureId}")
    public ResponseEntity<List<Entretien>> getEntretiens(@PathVariable Long candidatureId) {
        return ResponseEntity.ok(candidatureService.getEntretiensByCandidature(candidatureId));
    }
}