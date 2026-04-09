package tn.esprit.joboffre.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.joboffre.entities.QuizResult;
import java.util.List;

public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {
    List<QuizResult> findByQuizId(Long quizId);
    List<QuizResult> findByUserId(Long userId);
    boolean existsByUserIdAndQuizId(Long userId, Long quizId);

    boolean existsByUserIdAndQuizIdAndPassedTrue(Long userId, Long quizId);
    java.util.Optional<QuizResult> findByQuizIdAndUserId(Long quizId, Long userId);
}