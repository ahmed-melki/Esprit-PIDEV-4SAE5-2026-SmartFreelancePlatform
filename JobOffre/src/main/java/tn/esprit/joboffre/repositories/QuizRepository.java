package tn.esprit.joboffre.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.joboffre.entities.Quiz;
import java.util.List;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByJobOfferId(Long jobId);
    List<Quiz> findByIsActiveTrue();
    boolean existsById(Long id);

}