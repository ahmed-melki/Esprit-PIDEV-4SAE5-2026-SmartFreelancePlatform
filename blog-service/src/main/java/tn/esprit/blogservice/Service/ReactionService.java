package tn.esprit.blogservice.Service;// ReactionService.java



import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.blogservice.Repositories.ReactionRepository;
import tn.esprit.blogservice.entities.Reaction;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReactionService {

    private final ReactionRepository reactionRepository;
    private final ArticleService articleService;

    @Transactional
    public Map<String, Object> toggleReaction(Long articleId, String sessionId, String reactionType) {
        Map<String, Object> response = new HashMap<>();

        Optional<Reaction> existingReaction = reactionRepository.findByArticleIdAndSessionId(articleId, sessionId);

        if (existingReaction.isPresent()) {
            Reaction reaction = existingReaction.get();

            // Si même type de réaction -> on supprime
            if (reaction.getReactionType().equals(reactionType)) {
                reactionRepository.deleteByArticleIdAndSessionId(articleId, sessionId);
                response.put("action", "removed");
                response.put("currentUserReaction", null);
            }
            // Si type différent -> on change
            else {
                reaction.setReactionType(reactionType);
                reactionRepository.save(reaction);
                response.put("action", "changed");
                response.put("currentUserReaction", reactionType);
            }
        }
        // Nouvelle réaction
        else {
            Reaction newReaction = new Reaction();
            newReaction.setArticleId(articleId);
            newReaction.setSessionId(sessionId);
            newReaction.setReactionType(reactionType);
            reactionRepository.save(newReaction);
            response.put("action", "added");
            response.put("currentUserReaction", reactionType);
        }

        // Mettre à jour les compteurs
        articleService.updateArticleCounts(articleId);

        // Récupérer l'article mis à jour
        var article = articleService.getById(articleId);
        response.put("likeCount", article.getLikeCount());
        response.put("dislikeCount", article.getDislikeCount());
        response.put("badge", articleService.getBadgeForArticle(article));
        response.put("badgeColor", articleService.getBadgeColorForArticle(article));

        return response;
    }

    public Map<String, Object> getUserReaction(Long articleId, String sessionId) {
        Map<String, Object> response = new HashMap<>();

        Optional<Reaction> reaction = reactionRepository.findByArticleIdAndSessionId(articleId, sessionId);

        if (reaction.isPresent()) {
            response.put("hasReacted", true);
            response.put("reactionType", reaction.get().getReactionType());
        } else {
            response.put("hasReacted", false);
            response.put("reactionType", null);
        }

        var article = articleService.getById(articleId);
        response.put("likeCount", article.getLikeCount());
        response.put("dislikeCount", article.getDislikeCount());
        response.put("badge", articleService.getBadgeForArticle(article));
        response.put("badgeColor", articleService.getBadgeColorForArticle(article));

        return response;
    }
}