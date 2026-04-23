package tn.esprit.joboffre;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.joboffre.entities.*;
import tn.esprit.joboffre.repositories.JobOfferRepository;
import tn.esprit.joboffre.services.JobOfferService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobOfferServiceTest {

    @Mock
    private JobOfferRepository jobOfferRepository;

    @InjectMocks
    private JobOfferService jobOfferService;

    private JobOffer sampleJob;

    @BeforeEach
    void setUp() {
        sampleJob = new JobOffer();
        sampleJob.setId(1L);
        sampleJob.setTitle("Développeur Java");
        sampleJob.setDescription("Poste de développeur Java Spring Boot");
        sampleJob.setCompany("TechCorp");
        sampleJob.setLocation("Paris");
        sampleJob.setContractType(ContractType.CDI);
        sampleJob.setSalaryMin(40000.0);
        sampleJob.setSalaryMax(60000.0);
        sampleJob.setStatus(JobStatus.OPEN);
        sampleJob.setDeadline(LocalDate.now().plusMonths(1));
        sampleJob.setNumberOfPositions(2);
        sampleJob.setRemotePossible(true);
    }

    // ========== CREATE ==========

    @Test
    void create_shouldSetTimestampsAndStatusOpen() {
        when(jobOfferRepository.save(any(JobOffer.class))).thenAnswer(inv -> inv.getArgument(0));

        JobOffer input = new JobOffer();
        input.setTitle("Dev Backend");

        JobOffer result = jobOfferService.create(input);

        assertThat(result.getStatus()).isEqualTo(JobStatus.OPEN);
        assertThat(result.getCreatedAt()).isNotNull();
        assertThat(result.getUpdatedAt()).isNotNull();
        verify(jobOfferRepository).save(input);
    }

    // ========== GET ALL ==========

    @Test
    void getAll_shouldReturnAllJobs() {
        List<JobOffer> jobs = List.of(sampleJob, new JobOffer());
        when(jobOfferRepository.findAll()).thenReturn(jobs);

        List<JobOffer> result = jobOfferService.getAll();

        assertThat(result).hasSize(2);
        verify(jobOfferRepository).findAll();
    }

    @Test
    void getAll_shouldReturnEmptyListWhenNoJobs() {
        when(jobOfferRepository.findAll()).thenReturn(Collections.emptyList());

        List<JobOffer> result = jobOfferService.getAll();

        assertThat(result).isEmpty();
    }

    // ========== GET BY ID ==========

    @Test
    void getById_shouldReturnJobWhenFound() {
        when(jobOfferRepository.findById(1L)).thenReturn(Optional.of(sampleJob));

        JobOffer result = jobOfferService.getById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTitle()).isEqualTo("Développeur Java");
    }

    @Test
    void getById_shouldThrowWhenNotFound() {
        when(jobOfferRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> jobOfferService.getById(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Job offer not found");
    }

    // ========== UPDATE ==========

    @Test
    void update_shouldUpdateAllFields() {
        when(jobOfferRepository.findById(1L)).thenReturn(Optional.of(sampleJob));
        when(jobOfferRepository.save(any(JobOffer.class))).thenAnswer(inv -> inv.getArgument(0));

        JobOffer updated = new JobOffer();
        updated.setTitle("Senior Java Dev");
        updated.setDescription("Poste senior");
        updated.setCompany("NewCorp");
        updated.setLocation("Lyon");
        updated.setContractType(ContractType.CDD);
        updated.setSalaryMin(50000.0);
        updated.setSalaryMax(70000.0);
        updated.setStatus(JobStatus.CLOSED);
        updated.setRemotePossible(false);

        JobOffer result = jobOfferService.update(1L, updated);

        assertThat(result.getTitle()).isEqualTo("Senior Java Dev");
        assertThat(result.getCompany()).isEqualTo("NewCorp");
        assertThat(result.getContractType()).isEqualTo(ContractType.CDD);
        assertThat(result.getSalaryMin()).isEqualTo(50000.0);
        assertThat(result.getUpdatedAt()).isNotNull();
    }

    @Test
    void update_shouldThrowWhenJobNotFound() {
        when(jobOfferRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> jobOfferService.update(99L, new JobOffer()))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Job offer not found");
    }

    // ========== PARTIAL UPDATE ==========

    @Test
    void updatePartial_shouldUpdateOnlyProvidedFields() {
        when(jobOfferRepository.findById(1L)).thenReturn(Optional.of(sampleJob));
        when(jobOfferRepository.save(any(JobOffer.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> updates = new HashMap<>();
        updates.put("title", "Lead Developer");
        updates.put("salaryMin", 55000.0);

        JobOffer result = jobOfferService.updatePartial(1L, updates);

        assertThat(result.getTitle()).isEqualTo("Lead Developer");
        assertThat(result.getSalaryMin()).isEqualTo(55000.0);
        // Champs non modifiés restent inchangés
        assertThat(result.getCompany()).isEqualTo("TechCorp");
        assertThat(result.getLocation()).isEqualTo("Paris");
    }

    @Test
    void updatePartial_shouldUpdateStatusField() {
        when(jobOfferRepository.findById(1L)).thenReturn(Optional.of(sampleJob));
        when(jobOfferRepository.save(any(JobOffer.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> updates = Map.of("status", "CLOSED");

        JobOffer result = jobOfferService.updatePartial(1L, updates);

        assertThat(result.getStatus()).isEqualTo(JobStatus.CLOSED);
    }

    @Test
    void updatePartial_shouldUpdateContractType() {
        when(jobOfferRepository.findById(1L)).thenReturn(Optional.of(sampleJob));
        when(jobOfferRepository.save(any(JobOffer.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> updates = Map.of("contractType", "FREELANCE");

        JobOffer result = jobOfferService.updatePartial(1L, updates);

        assertThat(result.getContractType()).isEqualTo(ContractType.FREELANCE);
    }

    // ========== DELETE ==========

    @Test
    void delete_shouldCallRepositoryDeleteById() {
        doNothing().when(jobOfferRepository).deleteById(1L);

        jobOfferService.delete(1L);

        verify(jobOfferRepository).deleteById(1L);
    }

    // ========== RECHERCHE / FILTRES ==========

    @Test
    void getByContractType_shouldReturnMatchingJobs() {
        List<JobOffer> cdiJobs = List.of(sampleJob);
        when(jobOfferRepository.findByContractType(ContractType.CDI)).thenReturn(cdiJobs);

        List<JobOffer> result = jobOfferService.getByContractType(ContractType.CDI);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getContractType()).isEqualTo(ContractType.CDI);
    }

    @Test
    void getByStatus_shouldReturnOpenJobs() {
        when(jobOfferRepository.findByStatus(JobStatus.OPEN)).thenReturn(List.of(sampleJob));

        List<JobOffer> result = jobOfferService.getByStatus(JobStatus.OPEN);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(JobStatus.OPEN);
    }

    @Test
    void getByCompany_shouldReturnJobsForCompany() {
        when(jobOfferRepository.findByCompanyContainingIgnoreCase("techcorp")).thenReturn(List.of(sampleJob));

        List<JobOffer> result = jobOfferService.getByCompany("techcorp");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCompany()).isEqualTo("TechCorp");
    }

    @Test
    void search_shouldReturnJobsMatchingKeyword() {
        when(jobOfferRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase("java", "java"))
                .thenReturn(List.of(sampleJob));

        List<JobOffer> result = jobOfferService.search("java");

        assertThat(result).hasSize(1);
    }

    @Test
    void getBySalaryRange_shouldReturnJobsInRange() {
        when(jobOfferRepository.findBySalaryMinGreaterThanEqualAndSalaryMaxLessThanEqual(30000.0, 70000.0))
                .thenReturn(List.of(sampleJob));

        List<JobOffer> result = jobOfferService.getBySalaryRange(30000.0, 70000.0);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getSalaryMin()).isGreaterThanOrEqualTo(30000.0);
        assertThat(result.get(0).getSalaryMax()).isLessThanOrEqualTo(70000.0);
    }

    @Test
    void getOpenJobs_shouldReturnOnlyOpenJobsBeforeDeadline() {
        when(jobOfferRepository.findByStatusAndDeadlineAfter(eq(JobStatus.OPEN), any(LocalDate.class)))
                .thenReturn(List.of(sampleJob));

        List<JobOffer> result = jobOfferService.getOpenJobs();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(JobStatus.OPEN);
    }

    @Test
    void getOpenJobs_shouldReturnEmptyWhenNoOpenJobs() {
        when(jobOfferRepository.findByStatusAndDeadlineAfter(eq(JobStatus.OPEN), any(LocalDate.class)))
                .thenReturn(Collections.emptyList());

        List<JobOffer> result = jobOfferService.getOpenJobs();

        assertThat(result).isEmpty();
    }
}
