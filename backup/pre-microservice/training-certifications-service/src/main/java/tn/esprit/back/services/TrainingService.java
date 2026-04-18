package tn.esprit.back.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.back.entities.Training;
import tn.esprit.back.repositories.TrainingRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TrainingService {

    private final TrainingRepository trainingRepository;

    public List<Training> findAll() {
        return trainingRepository.findAll();
    }

    public Training findById(Long id) {
        return trainingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Training not found with id: " + id));
    }

    public Training create(Training training) {
        training.setTitle(trimToNull(training.getTitle()));
        training.setDescription(trimToNull(training.getDescription()));
        training.setCategory(trimToNull(training.getCategory()));
        training.setDurationHours(training.getDurationHours() == null ? 0 : training.getDurationHours());
        if (training.getStatus() == null) {
            training.setStatus(Training.TrainingStatus.UPCOMING);
        }
        return trainingRepository.save(training);
    }

    public Training update(Long id, Training updated) {
        Training existing = findById(id);
        existing.setTitle(trimToNull(updated.getTitle()));
        existing.setDescription(trimToNull(updated.getDescription()));
        existing.setCategory(trimToNull(updated.getCategory()));
        existing.setDurationHours(updated.getDurationHours() == null ? 0 : updated.getDurationHours());
        existing.setStartDate(updated.getStartDate());
        existing.setEndDate(updated.getEndDate());
        existing.setStatus(updated.getStatus() == null ? Training.TrainingStatus.UPCOMING : updated.getStatus());
        return trainingRepository.save(existing);
    }

    public void delete(Long id) {
        Training existing = findById(id);
        trainingRepository.delete(existing);
    }

    public List<Training> findByStatus(Training.TrainingStatus status) {
        return trainingRepository.findByStatus(status);
    }

    public List<Training> search(String keyword) {
        return trainingRepository.searchByTitle(keyword);
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }
}
