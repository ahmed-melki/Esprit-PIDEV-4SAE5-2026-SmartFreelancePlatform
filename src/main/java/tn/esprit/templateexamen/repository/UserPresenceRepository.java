package tn.esprit.templateexamen.repository;

import tn.esprit.templateexamen.entite.UserPresence;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserPresenceRepository extends JpaRepository<UserPresence, Long> {
    Optional<UserPresence> findByUserId(Long userId);
}