package tn.esprit.back.services;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.back.entities.Certification;
import tn.esprit.back.entities.Training;
import tn.esprit.back.repositories.CertificationRepository;
import tn.esprit.back.repositories.TrainingRepository;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CertificationServiceTest {

    @Mock
    private CertificationRepository certificationRepository;

    @Mock
    private TrainingRepository trainingRepository;

    @Mock
    private TitleService titleService;

    @Mock
    private ClientValidationService clientValidationService;

    @InjectMocks
    private CertificationService certificationService;

    @Test
    void createShouldRejectBlankCertificateNumber() {
        Certification certification = new Certification();
        certification.setCertificateNumber("   ");

        assertThatThrownBy(() -> certificationService.create(certification, 1L, 2L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Certificate number is required");
    }

    @Test
    void createShouldDefaultStatusAndTrimGrade() {
        Certification certification = new Certification();
        certification.setCertificateNumber("  CERT-001 ");
        certification.setGrade("  A+  ");

        Training training = new Training();
        when(trainingRepository.findById(2L)).thenReturn(Optional.of(training));
        when(certificationRepository.existsByCertificateNumber("CERT-001")).thenReturn(false);
        when(certificationRepository.save(any(Certification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Certification saved = certificationService.create(certification, 10L, 2L);

        assertThat(saved.getCertificateNumber()).isEqualTo("CERT-001");
        assertThat(saved.getGrade()).isEqualTo("A+");
        assertThat(saved.getClientId()).isEqualTo(10L);
        assertThat(saved.getStatus()).isEqualTo(Certification.CertificateStatus.PENDING);
        assertThat(saved.getTraining()).isSameAs(training);
    }

    @Test
    void updateShouldUnlockTitlesWhenCertificateIssued() {
        Certification existing = new Certification();
        existing.setId(3L);

        Training training = new Training();
        Certification updated = new Certification();
        updated.setCertificateNumber(" CERT-NEW ");
        updated.setGrade("  Great ");
        updated.setStatus(Certification.CertificateStatus.ISSUED);

        when(certificationRepository.findById(3L)).thenReturn(Optional.of(existing));
        when(trainingRepository.findById(4L)).thenReturn(Optional.of(training));
        when(certificationRepository.existsByCertificateNumberAndIdNot("CERT-NEW", 3L)).thenReturn(false);
        when(certificationRepository.save(existing)).thenReturn(existing);
        when(titleService.checkAndUnlockTitles(7L)).thenReturn(List.of());

        Certification result = certificationService.update(3L, updated, 7L, 4L);

        assertThat(result.getCertificateNumber()).isEqualTo("CERT-NEW");
        assertThat(result.getGrade()).isEqualTo("Great");
        assertThat(result.getStatus()).isEqualTo(Certification.CertificateStatus.ISSUED);
        verify(titleService).checkAndUnlockTitles(7L);
    }

    @Test
    void updateShouldThrowWhenTrainingDoesNotExist() {
        Certification existing = new Certification();
        when(certificationRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(trainingRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> certificationService.update(1L, new Certification(), 1L, 999L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Training not found");
    }
}
