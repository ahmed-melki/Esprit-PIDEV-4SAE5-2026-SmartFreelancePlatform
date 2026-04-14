package Test;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.blogservice.Repositories.ReactionRepository;
import tn.esprit.blogservice.Service.ArticleService;
import tn.esprit.blogservice.Service.ReactionService;
import tn.esprit.blogservice.entities.Article;
import tn.esprit.blogservice.entities.Reaction;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReactionServiceTest {

    @Mock
    private ReactionRepository reactionRepository;

    @Mock
    private ArticleService articleService;

    @InjectMocks
    private ReactionService reactionService;

    private final Long articleId = 1L;
    private final String sessionId = "session123";
    private Article article;
    private Reaction existingReaction;

    @BeforeEach
    void setUp() {
        article = new Article();
        article.setId(articleId);
        article.setLikeCount(10);
        article.setDislikeCount(2);
        article.setTitle("Article Test");

        existingReaction = new Reaction();
        existingReaction.setId(1L);
        existingReaction.setArticleId(articleId);
        existingReaction.setSessionId(sessionId);
        existingReaction.setReactionType("LIKE");
    }

    @Test
    void toggleReaction_WhenNoExistingReaction_ShouldAddNewReaction() {
        when(reactionRepository.findByArticleIdAndSessionId(articleId, sessionId))
                .thenReturn(Optional.empty());
        when(reactionRepository.save(any(Reaction.class))).thenAnswer(inv -> inv.getArgument(0));
        when(articleService.getById(articleId)).thenReturn(article);
        doNothing().when(articleService).updateArticleCounts(articleId);

        Map<String, Object> result = reactionService.toggleReaction(articleId, sessionId, "LIKE");

        assertThat(result.get("action")).isEqualTo("added");
        assertThat(result.get("currentUserReaction")).isEqualTo("LIKE");
        assertThat(result.get("likeCount")).isEqualTo(10);
        assertThat(result.get("dislikeCount")).isEqualTo(2);

        verify(reactionRepository, times(1)).save(any(Reaction.class));
        verify(reactionRepository, never()).deleteByArticleIdAndSessionId(anyLong(), anyString());
        verify(articleService, times(1)).updateArticleCounts(articleId);
        verify(articleService, times(1)).getById(articleId);
    }

    @Test
    void toggleReaction_WhenSameReactionType_ShouldRemoveReaction() {
        when(reactionRepository.findByArticleIdAndSessionId(articleId, sessionId))
                .thenReturn(Optional.of(existingReaction));
        doNothing().when(reactionRepository).deleteByArticleIdAndSessionId(articleId, sessionId);
        when(articleService.getById(articleId)).thenReturn(article);
        doNothing().when(articleService).updateArticleCounts(articleId);

        Map<String, Object> result = reactionService.toggleReaction(articleId, sessionId, "LIKE");

        assertThat(result.get("action")).isEqualTo("removed");
        assertThat(result.get("currentUserReaction")).isNull();

        verify(reactionRepository, never()).save(any(Reaction.class));
        verify(reactionRepository, times(1)).deleteByArticleIdAndSessionId(articleId, sessionId);
        verify(articleService, times(1)).updateArticleCounts(articleId);
        verify(articleService, times(1)).getById(articleId);
    }

    @Test
    void toggleReaction_WhenDifferentReactionType_ShouldChangeReaction() {
        existingReaction.setReactionType("LIKE");
        when(reactionRepository.findByArticleIdAndSessionId(articleId, sessionId))
                .thenReturn(Optional.of(existingReaction));
        when(reactionRepository.save(existingReaction)).thenReturn(existingReaction);
        when(articleService.getById(articleId)).thenReturn(article);
        doNothing().when(articleService).updateArticleCounts(articleId);

        Map<String, Object> result = reactionService.toggleReaction(articleId, sessionId, "DISLIKE");

        assertThat(result.get("action")).isEqualTo("changed");
        assertThat(result.get("currentUserReaction")).isEqualTo("DISLIKE");
        assertThat(existingReaction.getReactionType()).isEqualTo("DISLIKE");

        verify(reactionRepository, times(1)).save(existingReaction);
        verify(reactionRepository, never()).deleteByArticleIdAndSessionId(anyLong(), anyString());
        verify(articleService, times(1)).updateArticleCounts(articleId);
    }

    @Test
    void getUserReaction_WhenUserHasReacted_ShouldReturnReactionType() {
        when(reactionRepository.findByArticleIdAndSessionId(articleId, sessionId))
                .thenReturn(Optional.of(existingReaction));
        when(articleService.getById(articleId)).thenReturn(article);

        Map<String, Object> result = reactionService.getUserReaction(articleId, sessionId);

        assertThat(result.get("hasReacted")).isEqualTo(true);
        assertThat(result.get("reactionType")).isEqualTo("LIKE");
        assertThat(result.get("likeCount")).isEqualTo(10);
        assertThat(result.get("dislikeCount")).isEqualTo(2);

        verify(reactionRepository, times(1)).findByArticleIdAndSessionId(articleId, sessionId);
        verify(articleService, times(1)).getById(articleId);
    }

    @Test
    void getUserReaction_WhenUserHasNotReacted_ShouldReturnNullReactionType() {
        when(reactionRepository.findByArticleIdAndSessionId(articleId, sessionId))
                .thenReturn(Optional.empty());
        when(articleService.getById(articleId)).thenReturn(article);

        Map<String, Object> result = reactionService.getUserReaction(articleId, sessionId);

        assertThat(result.get("hasReacted")).isEqualTo(false);
        assertThat(result.get("reactionType")).isNull();
        assertThat(result.get("likeCount")).isEqualTo(10);
        assertThat(result.get("dislikeCount")).isEqualTo(2);

        verify(reactionRepository, times(1)).findByArticleIdAndSessionId(articleId, sessionId);
    }
}