package tn.esprit.templateexamen.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.templateexamen.entite.Reaction;
import tn.esprit.templateexamen.repository.ReactionRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReactionService implements IReactionService {

    private final ReactionRepository reactionRepository;

    @Override
    public Reaction addReaction(Long messageId, Long userId, String emoji) {
        // Vérifier si la réaction existe déjà
        if (reactionRepository.existsByMessageIdAndUserIdAndEmoji(messageId, userId, emoji)) {
            throw new RuntimeException("Reaction already exists");
        }
        Reaction reaction = Reaction.builder()
                .messageId(messageId)
                .userId(userId)
                .emoji(emoji)
                .build();
        return reactionRepository.save(reaction);
    }

    @Override
    public void removeReaction(Long messageId, Long userId, String emoji) {
        reactionRepository.deleteByMessageIdAndUserIdAndEmoji(messageId, userId, emoji);
    }

    @Override
    public List<Reaction> getReactionsByMessage(Long messageId) {
        return reactionRepository.findByMessageId(messageId);
    }
}