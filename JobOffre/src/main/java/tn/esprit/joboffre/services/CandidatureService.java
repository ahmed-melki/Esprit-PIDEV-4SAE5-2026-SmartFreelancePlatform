package tn.esprit.joboffre.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.joboffre.entities.*;
import tn.esprit.joboffre.repositories.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class CandidatureService {

    private final CandidatureRepository candidatureRepository;
    private final EntretienRepository entretienRepository;
    private final JobOfferRepository jobOfferRepository;
    private final QuizResultRepository quizResultRepository;
    private final QuizRepository quizRepository;

    public CandidatureService(CandidatureRepository candidatureRepository,
                              EntretienRepository entretienRepository,
                              JobOfferRepository jobOfferRepository,
                              QuizResultRepository quizResultRepository,
                              QuizRepository quizRepository) {
        this.candidatureRepository = candidatureRepository;
        this.entretienRepository = entretienRepository;
        this.jobOfferRepository = jobOfferRepository;
        this.quizResultRepository = quizResultRepository;
        this.quizRepository = quizRepository;
    }

    // ========== CANDIDATURE ==========

    @Transactional
    public Candidature postuler(Long jobId, Long candidatId, String lettreMotivation, String cvUrl) {
        // Vérifier si le candidat a déjà postulé
        if (candidatureRepository.existsByJobOfferIdAndCandidatId(jobId, candidatId)) {
            throw new RuntimeException("Vous avez déjà postulé à cette offre");
        }

        // Récupérer le quiz associé au job
        List<Quiz> quizzes = quizRepository.findByJobOfferId(jobId);
        if (quizzes.isEmpty()) {
            throw new RuntimeException("Aucun quiz associé à cette offre. Veuillez contacter le recruteur.");
        }

        Long quizId = quizzes.get(0).getId();

        // Vérifier si le candidat a réussi le quiz
        boolean aReussiQuiz = quizResultRepository.existsByUserIdAndQuizIdAndPassedTrue(candidatId, quizId);
        if (!aReussiQuiz) {
            throw new RuntimeException("Vous devez réussir le quiz de qualification avant de postuler");
        }

        JobOffer job = jobOfferRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Offre non trouvée"));

        Candidature candidature = new Candidature();
        candidature.setJobOffer(job);
        candidature.setCandidatId(candidatId);
        candidature.setLettreMotivation(lettreMotivation);
        candidature.setCvUrl(cvUrl);
        candidature.setStatut(StatutCandidature.EN_ATTENTE);
        candidature.setDatePostulation(LocalDateTime.now());
        candidature.setDateDerniereModification(LocalDateTime.now());

        return candidatureRepository.save(candidature);
    }

    @Transactional
    public Candidature updateStatut(Long candidatureId, StatutCandidature nouveauStatut, String commentaire) {
        Candidature candidature = candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new RuntimeException("Candidature non trouvée"));

        candidature.setStatut(nouveauStatut);
        candidature.setCommentaireRecruteur(commentaire);
        candidature.setDateDerniereModification(LocalDateTime.now());

        return candidatureRepository.save(candidature);
    }

    public List<Candidature> getCandidaturesByJob(Long jobId) {
        return candidatureRepository.findByJobOfferId(jobId);
    }

    public List<Candidature> getCandidaturesByCandidat(Long candidatId) {
        return candidatureRepository.findByCandidatId(candidatId);
    }

    public Candidature getCandidatureById(Long id) {
        return candidatureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidature non trouvée"));
    }

    public Map<String, Object> getStatsByJob(Long jobId) {
        return Map.of(
                "total", candidatureRepository.countByJobId(jobId),
                "enAttente", candidatureRepository.findByJobOfferIdAndStatut(jobId, StatutCandidature.EN_ATTENTE).size(),
                "enCoursExamen", candidatureRepository.findByJobOfferIdAndStatut(jobId, StatutCandidature.EN_COURS_EXAMEN).size(),
                "entretienPlanifie", candidatureRepository.findByJobOfferIdAndStatut(jobId, StatutCandidature.ENTRETIEN_PLANIFIE).size(),
                "acceptees", candidatureRepository.findByJobOfferIdAndStatut(jobId, StatutCandidature.ACCEPTEE).size(),
                "refusees", candidatureRepository.findByJobOfferIdAndStatut(jobId, StatutCandidature.REFUSEE).size()
        );
    }

    // ========== ENTRETIEN ==========

    @Transactional
    public Entretien planifierEntretien(Long candidatureId, LocalDateTime dateHeure, String lienVisio) {
        Candidature candidature = getCandidatureById(candidatureId);
        candidature.setStatut(StatutCandidature.ENTRETIEN_PLANIFIE);
        candidature.setDateDerniereModification(LocalDateTime.now());
        candidatureRepository.save(candidature);

        Entretien entretien = new Entretien();
        entretien.setCandidature(candidature);
        entretien.setDateHeure(dateHeure);
        entretien.setLienVisio(lienVisio);
        entretien.setDureeMinutes("60");
        entretien.setStatut(StatutEntretien.PLANIFIE);

        return entretienRepository.save(entretien);
    }

    @Transactional
    public Entretien terminerEntretien(Long entretienId, String notes) {
        Entretien entretien = entretienRepository.findById(entretienId)
                .orElseThrow(() -> new RuntimeException("Entretien non trouvé"));

        entretien.setStatut(StatutEntretien.TERMINE);
        entretien.setNotes(notes);

        Candidature candidature = entretien.getCandidature();
        candidature.setStatut(StatutCandidature.ENTRETIEN_REALISE);
        candidature.setDateDerniereModification(LocalDateTime.now());
        candidatureRepository.save(candidature);

        return entretienRepository.save(entretien);
    }

    @Transactional
    public void annulerEntretien(Long entretienId) {
        Entretien entretien = entretienRepository.findById(entretienId)
                .orElseThrow(() -> new RuntimeException("Entretien non trouvé"));

        entretien.setStatut(StatutEntretien.ANNULE);
        entretienRepository.save(entretien);
    }

    public List<Entretien> getEntretiensByCandidature(Long candidatureId) {
        return entretienRepository.findByCandidatureId(candidatureId);
    }

    public List<Entretien> getEntretiensByDate(LocalDateTime debut, LocalDateTime fin) {
        return entretienRepository.findByDateHeureBetween(debut, fin);
    }
}