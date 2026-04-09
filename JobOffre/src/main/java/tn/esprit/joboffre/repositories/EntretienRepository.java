package tn.esprit.joboffre.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.joboffre.entities.Entretien;
import java.time.LocalDateTime;
import java.util.List;

public interface EntretienRepository extends JpaRepository<Entretien, Long> {

    List<Entretien> findByCandidatureId(Long candidatureId);

    List<Entretien> findByDateHeureBetween(LocalDateTime debut, LocalDateTime fin);
}