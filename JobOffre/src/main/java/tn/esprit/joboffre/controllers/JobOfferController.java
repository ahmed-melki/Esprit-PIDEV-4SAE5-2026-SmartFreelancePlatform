package tn.esprit.joboffre.controllers;

import org.springframework.web.bind.annotation.*;
import tn.esprit.joboffre.entities.*;
import tn.esprit.joboffre.services.JobOfferService;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin("*")
public class JobOfferController {

    private final JobOfferService jobOfferService;

    public JobOfferController(JobOfferService jobOfferService) {
        this.jobOfferService = jobOfferService;
    }

    // ========== CRUD DE BASE ==========

    @PostMapping
    public JobOffer create(@RequestBody JobOffer jobOffer) {
        return jobOfferService.create(jobOffer);
    }

    @GetMapping
    public List<JobOffer> getAll() {
        return jobOfferService.getAll();
    }

    @GetMapping("/{id}")
    public JobOffer getById(@PathVariable Long id) {
        return jobOfferService.getById(id);
    }

    @PutMapping("/{id}")
    public JobOffer update(@PathVariable Long id, @RequestBody JobOffer jobOffer) {
        return jobOfferService.update(id, jobOffer);
    }

    @PatchMapping("/{id}")
    public JobOffer updatePartial(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return jobOfferService.updatePartial(id, updates);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        jobOfferService.delete(id);
    }

    // ========== FONCTIONNALITÉS AVANCÉES ==========

    @GetMapping("/contract/{type}")
    public List<JobOffer> getByContractType(@PathVariable ContractType type) {
        return jobOfferService.getByContractType(type);
    }

    @GetMapping("/status/{status}")
    public List<JobOffer> getByStatus(@PathVariable JobStatus status) {
        return jobOfferService.getByStatus(status);
    }

    @GetMapping("/company/{company}")
    public List<JobOffer> getByCompany(@PathVariable String company) {
        return jobOfferService.getByCompany(company);
    }

    @GetMapping("/search")
    public List<JobOffer> search(@RequestParam String keyword) {
        return jobOfferService.search(keyword);
    }

    @GetMapping("/salary")
    public List<JobOffer> getBySalaryRange(@RequestParam Double min, @RequestParam Double max) {
        return jobOfferService.getBySalaryRange(min, max);
    }

    @GetMapping("/open")
    public List<JobOffer> getOpenJobs() {
        return jobOfferService.getOpenJobs();
    }
    @PatchMapping("/{id}/close")
    public JobOffer close(@PathVariable Long id) {
        return jobOfferService.close(id);
    }
}