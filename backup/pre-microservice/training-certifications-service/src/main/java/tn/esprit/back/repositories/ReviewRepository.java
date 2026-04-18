package tn.esprit.back.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.back.entities.Review;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    List<Review> findByTrainingId(Long trainingId);
    
    List<Review> findByTrainingIdAndStatus(Long trainingId, Review.ReviewStatus status);
    
    @Query("SELECT r FROM Review r WHERE r.training.id = :trainingId AND r.status = :status ORDER BY r.createdAt DESC")
    List<Review> findByTrainingIdAndStatusOrderByCreatedAtDesc(@Param("trainingId") Long trainingId, @Param("status") Review.ReviewStatus status);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.training.id = :trainingId AND r.status = :status")
    Long countByTrainingIdAndStatus(@Param("trainingId") Long trainingId, @Param("status") Review.ReviewStatus status);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.training.id = :trainingId AND r.status = :status")
    Double getAverageRatingByTrainingIdAndStatus(@Param("trainingId") Long trainingId, @Param("status") Review.ReviewStatus status);
    
    @Query("SELECT r FROM Review r WHERE r.status = :status ORDER BY r.createdAt DESC")
    List<Review> findByStatusOrderByCreatedAtDesc(@Param("status") Review.ReviewStatus status);
}
