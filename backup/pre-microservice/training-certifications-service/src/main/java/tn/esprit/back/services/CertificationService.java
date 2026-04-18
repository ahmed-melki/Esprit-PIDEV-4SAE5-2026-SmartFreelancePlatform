package tn.esprit.back.services;


import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.back.entities.Certification;
import tn.esprit.back.entities.Training;
import tn.esprit.back.repositories.CertificationRepository;
import tn.esprit.back.repositories.TrainingRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CertificationService {

    private final CertificationRepository certificateRepository;
    private final TrainingRepository trainingRepository;
    private final TitleService titleService;
    private final ClientValidationService clientValidationService;

    public List<Certification> findAll() {
        return certificateRepository.findAll();
    }

    public Certification findById(Long id) {
        return certificateRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Certificate not found with id: " + id));
    }

    public List<Certification> findByClient(Long clientId) {
        return certificateRepository.findByClientId(clientId);
    }

    public List<Certification> findByTraining(Long trainingId) {
        return certificateRepository.findByTrainingId(trainingId);
    }

    public Certification create(Certification certificate, Long clientId, Long trainingId) {
        clientValidationService.validateClientExistsOrSkip(clientId);
        certificate.setCertificateNumber(trimToNull(certificate.getCertificateNumber()));
        if (certificate.getCertificateNumber() == null) {
            throw new IllegalArgumentException("Certificate number is required");
        }
        if (certificateRepository.existsByCertificateNumber(certificate.getCertificateNumber())) {
            throw new IllegalArgumentException(
                    "Certificate number already exists: " + certificate.getCertificateNumber());
        }

        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new EntityNotFoundException("Training not found with id: " + trainingId));

        certificate.setClientId(clientId);
        certificate.setTraining(training);
        certificate.setGrade(trimToNull(certificate.getGrade()));

        if (certificate.getStatus() == null) {
            certificate.setStatus(Certification.CertificateStatus.PENDING);
        }

        return certificateRepository.save(certificate);
    }

    public Certification update(Long id, Certification updated, Long clientId, Long trainingId) {
        clientValidationService.validateClientExistsOrSkip(clientId);
        Certification existing = findById(id);

        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new EntityNotFoundException("Training not found with id: " + trainingId));

        String certificateNumber = trimToNull(updated.getCertificateNumber());
        if (certificateNumber == null) {
            throw new IllegalArgumentException("Certificate number is required");
        }
        if (certificateRepository.existsByCertificateNumberAndIdNot(certificateNumber, id)) {
            throw new IllegalArgumentException("Certificate number already exists: " + certificateNumber);
        }

        existing.setCertificateNumber(certificateNumber);
        existing.setIssueDate(updated.getIssueDate());
        existing.setExpiryDate(updated.getExpiryDate());
        existing.setStatus(updated.getStatus() == null ? Certification.CertificateStatus.PENDING : updated.getStatus());
        existing.setGrade(trimToNull(updated.getGrade()));
        existing.setScore(updated.getScore());
        existing.setClientId(clientId);
        existing.setTraining(training);

        Certification savedCert = certificateRepository.save(existing);

        if (updated.getStatus() == Certification.CertificateStatus.ISSUED) {
            try {
                var unlockedTitles = titleService.checkAndUnlockTitles(clientId);
                if (!unlockedTitles.isEmpty()) {
                    log.info("Unlocked {} new titles for client {}", unlockedTitles.size(), clientId);
                }
            } catch (Exception e) {
                log.error("Error checking titles for client {}: {}", clientId, e.getMessage());
            }
        }

        return savedCert;
    }

    public void delete(Long id) {
        Certification existing = findById(id);
        certificateRepository.delete(existing);
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }
}
