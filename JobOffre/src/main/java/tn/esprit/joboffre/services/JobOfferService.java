package tn.esprit.joboffre.services;


import org.springframework.stereotype.Service;
import tn.esprit.joboffre.entities.*;
import tn.esprit.joboffre.repositories.JobOfferRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class JobOfferService {

    private final JobOfferRepository jobOfferRepository;

    public JobOfferService(JobOfferRepository jobOfferRepository) {
        this.jobOfferRepository = jobOfferRepository;
    }

    // ========== CRUD ==========

    public JobOffer create(JobOffer jobOffer) {
        jobOffer.setCreatedAt(LocalDateTime.now());
        jobOffer.setUpdatedAt(LocalDateTime.now());
        jobOffer.setStatus(JobStatus.OPEN);
        return jobOfferRepository.save(jobOffer);
    }

    public List<JobOffer> getAll() {
        return jobOfferRepository.findAll();
    }

    public JobOffer getById(Long id) {
        return jobOfferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job offer not found"));
    }

    public JobOffer update(Long id, JobOffer updated) {
        JobOffer existing = getById(id);

        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setCompany(updated.getCompany());
        existing.setLocation(updated.getLocation());
        existing.setContractType(updated.getContractType());
        existing.setSalaryMin(updated.getSalaryMin());
        existing.setSalaryMax(updated.getSalaryMax());
        existing.setRequiredSkills(updated.getRequiredSkills());
        existing.setExperienceLevel(updated.getExperienceLevel());
        existing.setEducationLevel(updated.getEducationLevel());
        existing.setDeadline(updated.getDeadline());
        existing.setNumberOfPositions(updated.getNumberOfPositions());
        existing.setStatus(updated.getStatus());
        existing.setRemotePossible(updated.isRemotePossible());
        existing.setBenefits(updated.getBenefits());
        existing.setUpdatedAt(LocalDateTime.now());

        return jobOfferRepository.save(existing);
    }

    public JobOffer updatePartial(Long id, Map<String, Object> updates) {
        JobOffer existing = getById(id);

        if (updates.containsKey("title")) {
            existing.setTitle((String) updates.get("title"));
        }
        if (updates.containsKey("description")) {
            existing.setDescription((String) updates.get("description"));
        }
        if (updates.containsKey("company")) {
            existing.setCompany((String) updates.get("company"));
        }
        if (updates.containsKey("location")) {
            existing.setLocation((String) updates.get("location"));
        }
        if (updates.containsKey("contractType")) {
            existing.setContractType(ContractType.valueOf((String) updates.get("contractType")));
        }
        if (updates.containsKey("salaryMin")) {
            existing.setSalaryMin(Double.valueOf(updates.get("salaryMin").toString()));
        }
        if (updates.containsKey("salaryMax")) {
            existing.setSalaryMax(Double.valueOf(updates.get("salaryMax").toString()));
        }
        if (updates.containsKey("requiredSkills")) {
            existing.setRequiredSkills((List<String>) updates.get("requiredSkills"));
        }
        if (updates.containsKey("experienceLevel")) {
            existing.setExperienceLevel((String) updates.get("experienceLevel"));
        }
        if (updates.containsKey("educationLevel")) {
            existing.setEducationLevel((String) updates.get("educationLevel"));
        }
        if (updates.containsKey("deadline")) {
            existing.setDeadline(java.time.LocalDate.parse((String) updates.get("deadline")));
        }
        if (updates.containsKey("numberOfPositions")) {
            existing.setNumberOfPositions(Integer.parseInt(updates.get("numberOfPositions").toString()));
        }
        if (updates.containsKey("status")) {
            existing.setStatus(JobStatus.valueOf((String) updates.get("status")));
        }
        if (updates.containsKey("remotePossible")) {
            existing.setRemotePossible(Boolean.parseBoolean(updates.get("remotePossible").toString()));
        }
        if (updates.containsKey("benefits")) {
            existing.setBenefits((String) updates.get("benefits"));
        }

        existing.setUpdatedAt(LocalDateTime.now());
        return jobOfferRepository.save(existing);
    }

    public void delete(Long id) {
        jobOfferRepository.deleteById(id);
    }

    // ========== FONCTIONNALITÉS AVANCÉES ==========

    public List<JobOffer> getByContractType(ContractType type) {
        return jobOfferRepository.findByContractType(type);
    }

    public List<JobOffer> getByStatus(JobStatus status) {
        return jobOfferRepository.findByStatus(status);
    }

    public List<JobOffer> getByCompany(String company) {
        return jobOfferRepository.findByCompanyContainingIgnoreCase(company);
    }

    public List<JobOffer> search(String keyword) {
        return jobOfferRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword);
    }

    public List<JobOffer> getBySalaryRange(Double min, Double max) {
        return jobOfferRepository.findBySalaryMinGreaterThanEqualAndSalaryMaxLessThanEqual(min, max);
    }

    public List<JobOffer> getOpenJobs() {
        return jobOfferRepository.findByStatusAndDeadlineAfter(JobStatus.OPEN, java.time.LocalDate.now());
    }
}