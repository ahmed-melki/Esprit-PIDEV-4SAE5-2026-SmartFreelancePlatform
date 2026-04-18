package tn.esprit.back.services;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.back.entities.Training;
import tn.esprit.back.repositories.TrainingRepository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TrainingServiceTest {

    @Mock
    private TrainingRepository trainingRepository;

    @InjectMocks
    private TrainingService trainingService;

    @Test
    void createShouldTrimFieldsAndDefaultStatus() {
        Training training = new Training();
        training.setTitle("  DevOps Bootcamp  ");
        training.setDescription("  Hands-on course  ");
        training.setCategory("  Cloud ");

        when(trainingRepository.save(any(Training.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Training saved = trainingService.create(training);

        assertThat(saved.getTitle()).isEqualTo("DevOps Bootcamp");
        assertThat(saved.getDescription()).isEqualTo("Hands-on course");
        assertThat(saved.getCategory()).isEqualTo("Cloud");
        assertThat(saved.getDurationHours()).isZero();
        assertThat(saved.getStatus()).isEqualTo(Training.TrainingStatus.UPCOMING);
    }

    @Test
    void updateShouldThrowWhenTrainingDoesNotExist() {
        when(trainingRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> trainingService.update(99L, new Training()))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Training not found");
    }

    @Test
    void deleteShouldRemoveExistingTraining() {
        Training training = new Training();
        when(trainingRepository.findById(5L)).thenReturn(Optional.of(training));

        trainingService.delete(5L);

        verify(trainingRepository).delete(training);
    }
}
