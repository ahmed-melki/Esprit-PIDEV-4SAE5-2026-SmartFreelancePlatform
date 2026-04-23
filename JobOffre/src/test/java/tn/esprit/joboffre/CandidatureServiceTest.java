package tn.esprit.joboffre;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.joboffre.entities.*;
import tn.esprit.joboffre.repositories.*;
import tn.esprit.joboffre.services.CandidatureService;
import java.time.LocalDateTime;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CandidatureServiceTest {

    @Mock
    private CandidatureRepository candidatureRepository;

    @Mock
    private EntretienRepository entretienRepository;

    @Mock
    private JobOfferRepository jobOfferRepository;

    @Mock
    private QuizResultRepository quizResultRepository;

    @Mock
    private QuizRepository quizRepository;

    @InjectMocks
    private CandidatureService candidatureService;

    private JobOffer job;
    private Candidature candidature;
    private Quiz quiz;
    private Entretien entretien;

    @BeforeEach
    void setUp() {
        job = new JobOffer();
        job.setId(1L);
        job.setTitle("Développeur Java");
        job.setStatus(JobStatus.OPEN);

        quiz = new Quiz();
        quiz.setId(10L);
        quiz.setJobOffer(job);

        candidature = new Candidature();
        candidature.setId(100L);
        candidature.setJobOffer(job);
        candidature.setCandidatId(5L);
        candidature.setStatut(StatutCandidature.EN_ATTENTE);
        candidature.setLettreMotivation("Je suis motivé.");
        candidature.setCvUrl("https://cv.example.com/cv.pdf");
        candidature.setDatePostulation(LocalDateTime.now());

        entretien = new Entretien();
        entretien.setId(200L);
        entretien.setCandidature(candidature);
        entretien.setStatut(StatutEntretien.PLANIFIE);
        entretien.setDateHeure(LocalDateTime.now().plusDays(3));
        entretien.setLienVisio("https://meet.example.com/room");
    }

    // ========== POSTULER ==========

    @Test
    void postuler_shouldCreateCandidatureWhenEligible() {
        when(candidatureRepository.existsByJobOfferIdAndCandidatId(1L, 5L)).thenReturn(false);
        when(quizRepository.findByJobOfferId(1L)).thenReturn(List.of(quiz));
        when(quizResultRepository.existsByUserIdAndQuizIdAndPassedTrue(5L, 10L)).thenReturn(true);
        when(jobOfferRepository.findById(1L)).thenReturn(Optional.of(job));
        when(candidatureRepository.save(any(Candidature.class))).thenAnswer(inv -> inv.getArgument(0));

        Candidature result = candidatureService.postuler(1L, 5L, "Ma lettre", "http://cv.com/cv.pdf");

        assertThat(result).isNotNull();
        assertThat(result.getStatut()).isEqualTo(StatutCandidature.EN_ATTENTE);
        assertThat(result.getCandidatId()).isEqualTo(5L);
        assertThat(result.getLettreMotivation()).isEqualTo("Ma lettre");
        assertThat(result.getCvUrl()).isEqualTo("http://cv.com/cv.pdf");
        assertThat(result.getDatePostulation()).isNotNull();
        verify(candidatureRepository).save(any(Candidature.class));
    }

    @Test
    void postuler_shouldThrowWhenAlreadyApplied() {
        when(candidatureRepository.existsByJobOfferIdAndCandidatId(1L, 5L)).thenReturn(true);

        assertThatThrownBy(() -> candidatureService.postuler(1L, 5L, "Lettre", "cv.pdf"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Vous avez déjà postulé à cette offre");

        verify(candidatureRepository, never()).save(any());
    }

    @Test
    void postuler_shouldThrowWhenNoQuizAssociated() {
        when(candidatureRepository.existsByJobOfferIdAndCandidatId(1L, 5L)).thenReturn(false);
        when(quizRepository.findByJobOfferId(1L)).thenReturn(Collections.emptyList());

        assertThatThrownBy(() -> candidatureService.postuler(1L, 5L, "Lettre", "cv.pdf"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Aucun quiz associé à cette offre. Veuillez contacter le recruteur.");

        verify(candidatureRepository, never()).save(any());
    }

    @Test
    void postuler_shouldThrowWhenQuizNotPassed() {
        when(candidatureRepository.existsByJobOfferIdAndCandidatId(1L, 5L)).thenReturn(false);
        when(quizRepository.findByJobOfferId(1L)).thenReturn(List.of(quiz));
        when(quizResultRepository.existsByUserIdAndQuizIdAndPassedTrue(5L, 10L)).thenReturn(false);

        assertThatThrownBy(() -> candidatureService.postuler(1L, 5L, "Lettre", "cv.pdf"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Vous devez réussir le quiz de qualification avant de postuler");

        verify(candidatureRepository, never()).save(any());
    }

    @Test
    void postuler_shouldThrowWhenJobNotFound() {
        when(candidatureRepository.existsByJobOfferIdAndCandidatId(1L, 5L)).thenReturn(false);
        when(quizRepository.findByJobOfferId(1L)).thenReturn(List.of(quiz));
        when(quizResultRepository.existsByUserIdAndQuizIdAndPassedTrue(5L, 10L)).thenReturn(true);
        when(jobOfferRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> candidatureService.postuler(1L, 5L, "Lettre", "cv.pdf"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Offre non trouvée");
    }

    // ========== UPDATE STATUT ==========

    @Test
    void updateStatut_shouldUpdateStatusAndComment() {
        when(candidatureRepository.findById(100L)).thenReturn(Optional.of(candidature));
        when(candidatureRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Candidature result = candidatureService.updateStatut(100L, StatutCandidature.EN_COURS_EXAMEN, "Profil intéressant");

        assertThat(result.getStatut()).isEqualTo(StatutCandidature.EN_COURS_EXAMEN);
        assertThat(result.getCommentaireRecruteur()).isEqualTo("Profil intéressant");
        assertThat(result.getDateDerniereModification()).isNotNull();
    }

    @Test
    void updateStatut_shouldThrowWhenCandidatureNotFound() {
        when(candidatureRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> candidatureService.updateStatut(999L, StatutCandidature.ACCEPTEE, "OK"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Candidature non trouvée");
    }

    @Test
    void updateStatut_shouldAllowAcceptCandidature() {
        when(candidatureRepository.findById(100L)).thenReturn(Optional.of(candidature));
        when(candidatureRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Candidature result = candidatureService.updateStatut(100L, StatutCandidature.ACCEPTEE, "Bienvenue !");

        assertThat(result.getStatut()).isEqualTo(StatutCandidature.ACCEPTEE);
    }

    @Test
    void updateStatut_shouldAllowRefuseCandidature() {
        when(candidatureRepository.findById(100L)).thenReturn(Optional.of(candidature));
        when(candidatureRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Candidature result = candidatureService.updateStatut(100L, StatutCandidature.REFUSEE, "Profil insuffisant");

        assertThat(result.getStatut()).isEqualTo(StatutCandidature.REFUSEE);
    }

    // ========== GET CANDIDATURES ==========

    @Test
    void getCandidaturesByJob_shouldReturnCandidaturesForJob() {
        when(candidatureRepository.findByJobOfferId(1L)).thenReturn(List.of(candidature));

        List<Candidature> result = candidatureService.getCandidaturesByJob(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getJobOffer().getId()).isEqualTo(1L);
    }

    @Test
    void getCandidaturesByCandidat_shouldReturnCandidaturesForCandidat() {
        when(candidatureRepository.findByCandidatId(5L)).thenReturn(List.of(candidature));

        List<Candidature> result = candidatureService.getCandidaturesByCandidat(5L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCandidatId()).isEqualTo(5L);
    }

    @Test
    void getCandidatureById_shouldReturnCandidature() {
        when(candidatureRepository.findById(100L)).thenReturn(Optional.of(candidature));

        Candidature result = candidatureService.getCandidatureById(100L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(100L);
    }

    @Test
    void getCandidatureById_shouldThrowWhenNotFound() {
        when(candidatureRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> candidatureService.getCandidatureById(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Candidature non trouvée");
    }

    // ========== STATS ==========

    @Test
    void getStatsByJob_shouldReturnCorrectStats() {
        when(candidatureRepository.countByJobId(1L)).thenReturn(10L);
        when(candidatureRepository.findByJobOfferIdAndStatut(1L, StatutCandidature.EN_ATTENTE))
                .thenReturn(List.of(candidature, candidature, candidature));
        when(candidatureRepository.findByJobOfferIdAndStatut(1L, StatutCandidature.EN_COURS_EXAMEN))
                .thenReturn(List.of(candidature, candidature));
        when(candidatureRepository.findByJobOfferIdAndStatut(1L, StatutCandidature.ENTRETIEN_PLANIFIE))
                .thenReturn(List.of(candidature));
        when(candidatureRepository.findByJobOfferIdAndStatut(1L, StatutCandidature.ACCEPTEE))
                .thenReturn(List.of(candidature, candidature));
        when(candidatureRepository.findByJobOfferIdAndStatut(1L, StatutCandidature.REFUSEE))
                .thenReturn(List.of(candidature, candidature));

        Map<String, Object> stats = candidatureService.getStatsByJob(1L);

        assertThat(stats.get("total")).isEqualTo(10L);
        assertThat(stats.get("enAttente")).isEqualTo(3);
        assertThat(stats.get("enCoursExamen")).isEqualTo(2);
        assertThat(stats.get("entretienPlanifie")).isEqualTo(1);
        assertThat(stats.get("acceptees")).isEqualTo(2);
        assertThat(stats.get("refusees")).isEqualTo(2);
    }

    // ========== ENTRETIEN ==========

    @Test
    void planifierEntretien_shouldCreateEntretienAndUpdateCandidatureStatus() {
        when(candidatureRepository.findById(100L)).thenReturn(Optional.of(candidature));
        when(candidatureRepository.save(any())).thenReturn(candidature);
        when(entretienRepository.save(any(Entretien.class))).thenAnswer(inv -> inv.getArgument(0));

        LocalDateTime dateHeure = LocalDateTime.now().plusDays(5);
        Entretien result = candidatureService.planifierEntretien(100L, dateHeure, "https://meet.example.com");

        assertThat(result).isNotNull();
        assertThat(result.getStatut()).isEqualTo(StatutEntretien.PLANIFIE);
        assertThat(result.getLienVisio()).isEqualTo("https://meet.example.com");
        assertThat(result.getDureeMinutes()).isEqualTo("60");
        assertThat(candidature.getStatut()).isEqualTo(StatutCandidature.ENTRETIEN_PLANIFIE);
        verify(entretienRepository).save(any(Entretien.class));
    }

    @Test
    void terminerEntretien_shouldMarkEntretienTermineAndUpdateCandidature() {
        when(entretienRepository.findById(200L)).thenReturn(Optional.of(entretien));
        when(candidatureRepository.save(any())).thenReturn(candidature);
        when(entretienRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Entretien result = candidatureService.terminerEntretien(200L, "Très bon profil");

        assertThat(result.getStatut()).isEqualTo(StatutEntretien.TERMINE);
        assertThat(result.getNotes()).isEqualTo("Très bon profil");
        assertThat(entretien.getCandidature().getStatut()).isEqualTo(StatutCandidature.ENTRETIEN_REALISE);
    }

    @Test
    void terminerEntretien_shouldThrowWhenNotFound() {
        when(entretienRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> candidatureService.terminerEntretien(999L, "notes"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Entretien non trouvé");
    }

    @Test
    void annulerEntretien_shouldMarkAsAnnule() {
        when(entretienRepository.findById(200L)).thenReturn(Optional.of(entretien));
        when(entretienRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        candidatureService.annulerEntretien(200L);

        assertThat(entretien.getStatut()).isEqualTo(StatutEntretien.ANNULE);
        verify(entretienRepository).save(entretien);
    }

    @Test
    void annulerEntretien_shouldThrowWhenNotFound() {
        when(entretienRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> candidatureService.annulerEntretien(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Entretien non trouvé");
    }

    @Test
    void getEntretiensByCandidature_shouldReturnEntretiens() {
        when(entretienRepository.findByCandidatureId(100L)).thenReturn(List.of(entretien));

        List<Entretien> result = candidatureService.getEntretiensByCandidature(100L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(200L);
    }

    @Test
    void getEntretiensByDate_shouldReturnEntretiensInRange() {
        LocalDateTime debut = LocalDateTime.now();
        LocalDateTime fin = LocalDateTime.now().plusDays(7);
        when(entretienRepository.findByDateHeureBetween(debut, fin)).thenReturn(List.of(entretien));

        List<Entretien> result = candidatureService.getEntretiensByDate(debut, fin);

        assertThat(result).hasSize(1);
    }
}
