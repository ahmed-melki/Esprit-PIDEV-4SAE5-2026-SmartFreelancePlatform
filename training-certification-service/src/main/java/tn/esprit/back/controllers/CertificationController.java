package tn.esprit.back.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import tn.esprit.back.entities.Certification;
import tn.esprit.back.services.CertificationService;

import java.util.List;

@RestController
@RequestMapping("/api/certifications")
@RequiredArgsConstructor
public class CertificationController {

    private final CertificationService certificateService;

    @GetMapping
    public List<Certification> getAll() {
        return certificateService.findAll();
    }

    @GetMapping("/{id}")
    public Certification getById(@PathVariable Long id) {
        return certificateService.findById(id);
    }

    @GetMapping("/client/{clientId}")
    public List<Certification> getByClient(@PathVariable Long clientId) {
        return certificateService.findByClient(clientId);
    }

    @GetMapping("/training/{trainingId}")
    public List<Certification> getByTraining(@PathVariable Long trainingId) {
        return certificateService.findByTraining(trainingId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Certification create(
            @RequestBody Certification certificate,
            @RequestParam Long clientId,
            @RequestParam Long trainingId) {
        return certificateService.create(certificate, clientId, trainingId);
    }

    @PutMapping("/{id}")
    public Certification update(
            @PathVariable Long id,
            @RequestBody Certification certificate,
            @RequestParam Long clientId,
            @RequestParam Long trainingId) {
        return certificateService.update(id, certificate, clientId, trainingId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        certificateService.delete(id);
    }
}
