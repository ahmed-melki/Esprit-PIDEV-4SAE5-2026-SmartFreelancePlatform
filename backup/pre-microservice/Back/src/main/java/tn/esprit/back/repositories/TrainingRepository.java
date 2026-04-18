package tn.esprit.back.repositories;


import tn.esprit.back.entities.Training;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TrainingRepository extends JpaRepository<Training, Long> {

    List<Training> findByStatus(Training.TrainingStatus status);

    List<Training> findByCategoryIgnoreCase(String category);

    @Query("SELECT t FROM Training t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Training> searchByTitle(String keyword);
}