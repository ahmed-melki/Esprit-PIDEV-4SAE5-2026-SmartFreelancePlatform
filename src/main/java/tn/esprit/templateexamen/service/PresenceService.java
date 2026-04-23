package tn.esprit.templateexamen.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.templateexamen.entite.UserPresence;
import tn.esprit.templateexamen.repository.UserPresenceRepository;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class PresenceService {

    private final UserPresenceRepository presenceRepository;
    private static final long ONLINE_THRESHOLD_SECONDS = 120; // 2 minutes

    /**
     * Met à jour la dernière activité d'un utilisateur.
     */
    public void updatePresence(Long userId) {
        UserPresence presence = presenceRepository.findByUserId(userId)
                .orElse(UserPresence.builder().userId(userId).build());
        presence.setLastSeen(LocalDateTime.now());
        presenceRepository.save(presence);
    }

    /**
     * Vérifie si l'utilisateur est considéré comme en ligne.
     */
    public boolean isOnline(Long userId) {
        return presenceRepository.findByUserId(userId)
                .map(p -> p.getLastSeen().isAfter(LocalDateTime.now().minusSeconds(ONLINE_THRESHOLD_SECONDS)))
                .orElse(false);
    }

    /**
     * Retourne la date de dernière activité (peut être null).
     */
    public LocalDateTime getLastSeen(Long userId) {
        return presenceRepository.findByUserId(userId)
                .map(UserPresence::getLastSeen)
                .orElse(null);
    }
}