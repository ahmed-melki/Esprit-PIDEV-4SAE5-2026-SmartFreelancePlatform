package tn.esprit.back.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.back.entities.Review;
import tn.esprit.back.services.ReviewService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/training/{trainingId}")
    public ResponseEntity<Review> createReview(@RequestBody Review review, @PathVariable Long trainingId) {
        return ResponseEntity.ok(reviewService.createReview(review, trainingId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Review> getReviewById(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviewById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Review> updateReview(@PathVariable Long id, @RequestBody Review review) {
        return ResponseEntity.ok(reviewService.updateReview(id, review));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/training/{trainingId}")
    public ResponseEntity<List<Review>> getReviewsByTrainingId(@PathVariable Long trainingId) {
        return ResponseEntity.ok(reviewService.getReviewsByTrainingId(trainingId));
    }

    @GetMapping("/training/{trainingId}/stats")
    public ResponseEntity<Map<String, Object>> getTrainingReviewStats(@PathVariable Long trainingId) {
        return ResponseEntity.ok(reviewService.getTrainingReviewStats(trainingId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Review>> getPendingReviews() {
        return ResponseEntity.ok(reviewService.getAllPendingReviews());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Review> approveReview(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.approveReview(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Review> rejectReview(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.rejectReview(id));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Review>> getReviewsByStatus(@PathVariable Review.ReviewStatus status) {
        return ResponseEntity.ok(reviewService.getReviewsByStatus(status));
    }
}
