package tn.esprit.joboffre.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.joboffre.entities.*;
import java.time.LocalDate;
import java.util.List;

public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {

    // Filtres par attributs
    List<JobOffer> findByContractType(ContractType contractType);
    List<JobOffer> findByStatus(JobStatus status);
    List<JobOffer> findByCompanyContainingIgnoreCase(String company);
    List<JobOffer> findByEmployerId(Long employerId);
    List<JobOffer> findByApplicantIdsContains(Long freelancerId);

    // Recherche textuelle
    List<JobOffer> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description);

    // Filtre par salaire
    List<JobOffer> findBySalaryMinGreaterThanEqualAndSalaryMaxLessThanEqual(Double min, Double max);

    // Offres ouvertes avec deadline future
    List<JobOffer> findByStatusAndDeadlineAfter(JobStatus status, LocalDate date);

    // Recherche avancée par compétences
    @Query("SELECT j FROM JobOffer j WHERE :skill MEMBER OF j.requiredSkills")
    List<JobOffer> findByRequiredSkill(@Param("skill") String skill);

    // Offres par plage de salaire et type de contrat
    List<JobOffer> findByContractTypeAndSalaryMinGreaterThanEqualAndSalaryMaxLessThanEqual(
            ContractType contractType, Double min, Double max);

    // Offres expirées (deadline dépassée)
    List<JobOffer> findByDeadlineBefore(LocalDate date);
}