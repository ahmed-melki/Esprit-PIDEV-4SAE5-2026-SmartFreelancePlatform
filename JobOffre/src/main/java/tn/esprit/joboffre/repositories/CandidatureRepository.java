package tn.esprit.joboffre.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import tn.esprit.joboffre.entities.Candidature;
import tn.esprit.joboffre.entities.StatutCandidature;
import java.util.List;

public interface CandidatureRepository extends JpaRepository<Candidature, Long> {

    List<Candidature> findByJobOfferId(Long jobId);

    List<Candidature> findByCandidatId(Long candidatId);

    List<Candidature> findByJobOfferIdAndStatut(Long jobId, StatutCandidature statut);

    boolean existsByJobOfferIdAndCandidatId(Long jobId, Long candidatId);

    @Query("SELECT COUNT(c) FROM Candidature c WHERE c.jobOffer.id = :jobId")
    long countByJobId(Long jobId);
}