package tn.esprit.blogservice.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.blogservice.entities.Reaction;

import java.util.Optional;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {

    Optional<Reaction> findByArticleIdAndSessionId(Long articleId, String sessionId);

    @Modifying
    @Transactional
    void deleteByArticleIdAndSessionId(Long articleId, String sessionId);

    @Query("SELECT COUNT(r) FROM Reaction r WHERE r.articleId = :articleId AND r.reactionType = 'LIKE'")
    int countLikesByArticleId(@Param("articleId") Long articleId);

    @Query("SELECT COUNT(r) FROM Reaction r WHERE r.articleId = :articleId AND r.reactionType = 'DISLIKE'")
    int countDislikesByArticleId(@Param("articleId") Long articleId);
}