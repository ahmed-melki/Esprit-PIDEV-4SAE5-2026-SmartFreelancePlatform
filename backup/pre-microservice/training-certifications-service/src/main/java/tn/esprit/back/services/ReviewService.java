package tn.esprit.back.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.back.entities.Review;
import tn.esprit.back.entities.Training;
import tn.esprit.back.repositories.ReviewRepository;
import tn.esprit.back.repositories.TrainingRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final TrainingRepository trainingRepository;

    public Review createReview(Review review, Long trainingId) {
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new EntityNotFoundException("Training not found with id: " + trainingId));

        if (review.getRating() < 1 || review.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        review.setTraining(training);
        review.setCreatedAt(LocalDateTime.now());
        if (review.getStatus() == null) {
            review.setStatus(Review.ReviewStatus.PENDING);
        }

        return reviewRepository.save(review);
    }

    public Review updateReview(Long id, Review updatedReview) {
        Review existing = reviewRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Review not found with id: " + id));

        existing.setRating(updatedReview.getRating());
        existing.setComment(updatedReview.getComment());
        existing.setReviewerName(updatedReview.getReviewerName());
        existing.setReviewerEmail(updatedReview.getReviewerEmail());
        existing.setStatus(updatedReview.getStatus());
        existing.setUpdatedAt(LocalDateTime.now());

        return reviewRepository.save(existing);
    }

    public void deleteReview(Long id) {
        Review existing = reviewRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Review not found with id: " + id));
        reviewRepository.delete(existing);
    }

    public Review getReviewById(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Review not found with id: " + id));
    }

    public List<Review> getReviewsByTrainingId(Long trainingId) {
        return reviewRepository.findByTrainingIdAndStatusOrderByCreatedAtDesc(
                trainingId, Review.ReviewStatus.APPROVED);
    }

    public List<Review> getAllPendingReviews() {
        return reviewRepository.findByStatusOrderByCreatedAtDesc(Review.ReviewStatus.PENDING);
    }

    public Review approveReview(Long id) {
        Review review = getReviewById(id);
        review.setStatus(Review.ReviewStatus.APPROVED);
        review.setUpdatedAt(LocalDateTime.now());
        return reviewRepository.save(review);
    }

    public Review rejectReview(Long id) {
        Review review = getReviewById(id);
        review.setStatus(Review.ReviewStatus.REJECTED);
        review.setUpdatedAt(LocalDateTime.now());
        return reviewRepository.save(review);
    }

    public Map<String, Object> getTrainingReviewStats(Long trainingId) {
        Map<String, Object> stats = new HashMap<>();
        
        List<Review> approvedReviews = reviewRepository.findByTrainingIdAndStatus(
                trainingId, Review.ReviewStatus.APPROVED);
        
        Long totalReviews = reviewRepository.countByTrainingIdAndStatus(
                trainingId, Review.ReviewStatus.APPROVED);
        
        Double averageRating = reviewRepository.getAverageRatingByTrainingIdAndStatus(
                trainingId, Review.ReviewStatus.APPROVED);
        
        Map<Integer, Long> ratingDistribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            final int rating = i;
            Long count = approvedReviews.stream()
                    .filter(r -> r.getRating().equals(rating))
                    .count();
            ratingDistribution.put(rating, count);
        }
        
        stats.put("totalReviews", totalReviews != null ? totalReviews : 0);
        stats.put("averageRating", averageRating != null ? averageRating : 0.0);
        stats.put("ratingDistribution", ratingDistribution);
        stats.put("recentReviews", approvedReviews.stream().limit(5).toList());
        
        return stats;
    }

    public List<Review> getReviewsByStatus(Review.ReviewStatus status) {
        return reviewRepository.findByStatusOrderByCreatedAtDesc(status);
    }
}
