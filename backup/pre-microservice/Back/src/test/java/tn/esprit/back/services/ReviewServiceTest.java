package tn.esprit.back.services;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.back.entities.Review;
import tn.esprit.back.entities.Training;
import tn.esprit.back.repositories.ReviewRepository;
import tn.esprit.back.repositories.TrainingRepository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private TrainingRepository trainingRepository;

    @InjectMocks
    private ReviewService reviewService;

    @Test
    void createShouldRejectInvalidRating() {
        Review review = new Review();
        review.setRating(6);

        Training training = new Training();
        when(trainingRepository.findById(2L)).thenReturn(Optional.of(training));

        assertThatThrownBy(() -> reviewService.createReview(review, 2L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Rating must be between 1 and 5");
    }

    @Test
    void createShouldDefaultStatusAndAttachTraining() {
        Review review = new Review();
        review.setRating(5);

        Training training = new Training();
        when(trainingRepository.findById(2L)).thenReturn(Optional.of(training));
        when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Review saved = reviewService.createReview(review, 2L);

        assertThat(saved.getTraining()).isSameAs(training);
        assertThat(saved.getStatus()).isEqualTo(Review.ReviewStatus.PENDING);
        assertThat(saved.getCreatedAt()).isNotNull();
    }

    @Test
    void approveShouldUpdateStatus() {
        Review review = new Review();
        when(reviewRepository.findById(4L)).thenReturn(Optional.of(review));
        when(reviewRepository.save(review)).thenReturn(review);

        Review approved = reviewService.approveReview(4L);

        assertThat(approved.getStatus()).isEqualTo(Review.ReviewStatus.APPROVED);
        assertThat(approved.getUpdatedAt()).isNotNull();
    }

    @Test
    void getReviewByIdShouldThrowWhenMissing() {
        when(reviewRepository.findById(4L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.getReviewById(4L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Review not found");
    }
}
