package tn.esprit.templateexamen.service;

import tn.esprit.templateexamen.entite.Reaction;
import java.util.List;

public interface IReactionService {
    Reaction addReaction(Long messageId, Long userId, String emoji);
    void removeReaction(Long messageId, Long userId, String emoji);
    List<Reaction> getReactionsByMessage(Long messageId);
}