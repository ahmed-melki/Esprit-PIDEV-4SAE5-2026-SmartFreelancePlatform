package tn.esprit.templateexamen.repository;

import tn.esprit.templateexamen.entite.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ReactionRepository extends JpaRepository<Reaction, Long> {

    // Récupérer toutes les réactions d'un message
    List<Reaction> findByMessageId(Long messageId);

    // Vérifier si une réaction spécifique existe déjà
    boolean existsByMessageIdAndUserIdAndEmoji(Long messageId, Long userId, String emoji);

    // Supprimer une réaction spécifique
    void deleteByMessageIdAndUserIdAndEmoji(Long messageId, Long userId, String emoji);

    // Optionnel : trouver une réaction exacte (pour vérification)
    Optional<Reaction> findByMessageIdAndUserIdAndEmoji(Long messageId, Long userId, String emoji);
}