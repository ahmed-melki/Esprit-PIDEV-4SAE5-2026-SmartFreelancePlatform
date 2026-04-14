package Test;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.blogservice.Repositories.ArticleRepository;
import tn.esprit.blogservice.Repositories.ReactionRepository;
import tn.esprit.blogservice.Service.ArticleService;
import tn.esprit.blogservice.entities.Article;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ArticleServiceTest {

    @Mock
    private ArticleRepository articleRepository;

    @Mock
    private ReactionRepository reactionRepository;

    @InjectMocks
    private ArticleService articleService;

    private Article article1;
    private Article article2;
    private Article article3;

    @BeforeEach
    void setUp() {
        // Initialisation des articles de test
        article1 = new Article();
        article1.setId(1L);
        article1.setTitle("Article Populaire");
        article1.setLikeCount(15);
        article1.setDislikeCount(2);

        article2 = new Article();
        article2.setId(2L);
        article2.setTitle("Article Trending");
        article2.setLikeCount(25);
        article2.setDislikeCount(1);

        article3 = new Article();
        article3.setId(3L);
        article3.setTitle("Article Viral");
        article3.setLikeCount(50);
        article3.setDislikeCount(5);
    }

    @Test
    void getAll_ShouldReturnAllArticles() {
        // Arrange
        List<Article> expectedArticles = Arrays.asList(article1, article2, article3);
        when(articleRepository.findAll()).thenReturn(expectedArticles);

        // Act
        List<Article> result = articleService.getAll();

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(article1, article2, article3);
        verify(articleRepository, times(1)).findAll();
    }

    @Test
    void getById_WhenArticleExists_ShouldReturnArticle() {
        // Arrange
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article1));

        // Act
        Article result = articleService.getById(1L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTitle()).isEqualTo("Article Populaire");
        verify(articleRepository, times(1)).findById(1L);
    }

    @Test
    void getById_WhenArticleDoesNotExist_ShouldReturnNull() {
        // Arrange
        when(articleRepository.findById(999L)).thenReturn(Optional.empty());

        // Act
        Article result = articleService.getById(999L);

        // Assert
        assertThat(result).isNull();
        verify(articleRepository, times(1)).findById(999L);
    }

    @Test
    void save_ShouldReturnSavedArticle() {
        // Arrange
        Article newArticle = new Article();
        newArticle.setTitle("Nouvel Article");
        newArticle.setContent("Contenu du nouvel article");

        Article savedArticle = new Article();
        savedArticle.setId(10L);
        savedArticle.setTitle("Nouvel Article");
        savedArticle.setContent("Contenu du nouvel article");

        when(articleRepository.save(any(Article.class))).thenReturn(savedArticle);

        // Act
        Article result = articleService.save(newArticle);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(10L);
        assertThat(result.getTitle()).isEqualTo("Nouvel Article");
        verify(articleRepository, times(1)).save(newArticle);
    }

    @Test
    void delete_ShouldCallRepositoryDeleteById() {
        // Act
        articleService.delete(1L);

        // Assert
        verify(articleRepository, times(1)).deleteById(1L);
    }

    @Test
    void getTopArticles_ShouldReturnTop10ArticlesByLikes() {
        // Arrange
        List<Article> topArticles = Arrays.asList(article3, article2, article1);
        when(articleRepository.findTop10ByOrderByLikeCountDesc()).thenReturn(topArticles);

        // Act
        List<Article> result = articleService.getTopArticles();

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getLikeCount()).isEqualTo(50);
        assertThat(result.get(1).getLikeCount()).isEqualTo(25);
        assertThat(result.get(2).getLikeCount()).isEqualTo(15);
        verify(articleRepository, times(1)).findTop10ByOrderByLikeCountDesc();
    }

    @Test
    void getViralArticles_ShouldReturnViralArticles() {
        // Arrange
        List<Article> viralArticles = Arrays.asList(article3);
        when(articleRepository.findViralArticles()).thenReturn(viralArticles);

        // Act
        List<Article> result = articleService.getViralArticles();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getLikeCount()).isEqualTo(50);
        verify(articleRepository, times(1)).findViralArticles();
    }

    @Test
    void getBadgeForArticle_With30OrMoreLikes_ShouldReturnViralBadge() {
        // Arrange
        Article viralArticle = new Article();
        viralArticle.setLikeCount(30);

        // Act
        String badge = articleService.getBadgeForArticle(viralArticle);

        // Assert
        assertThat(badge).isEqualTo("👑 VIRAL");
    }

    @Test
    void getBadgeForArticle_With20To29Likes_ShouldReturnTrendingBadge() {
        // Arrange
        Article trendingArticle = new Article();
        trendingArticle.setLikeCount(20);

        // Act
        String badge = articleService.getBadgeForArticle(trendingArticle);

        // Assert
        assertThat(badge).isEqualTo("⭐  TRENDING");
    }

    @Test
    void getBadgeForArticle_With10To19Likes_ShouldReturnPopularBadge() {
        // Arrange
        Article popularArticle = new Article();
        popularArticle.setLikeCount(10);

        // Act
        String badge = articleService.getBadgeForArticle(popularArticle);

        // Assert
        assertThat(badge).isEqualTo("🔥  POPULAR");
    }

    @Test
    void getBadgeForArticle_WithLessThan10Likes_ShouldReturnNull() {
        // Arrange
        Article normalArticle = new Article();
        normalArticle.setLikeCount(5);

        // Act
        String badge = articleService.getBadgeForArticle(normalArticle);

        // Assert
        assertThat(badge).isNull();
    }

    @Test
    void getBadgeForArticle_WithNullArticle_ShouldReturnNull() {
        // Act
        String badge = articleService.getBadgeForArticle(null);

        // Assert
        assertThat(badge).isNull();
    }

    @Test
    void getBadgeColorForArticle_With30OrMoreLikes_ShouldReturnRed() {
        // Arrange
        Article viralArticle = new Article();
        viralArticle.setLikeCount(30);

        // Act
        String color = articleService.getBadgeColorForArticle(viralArticle);

        // Assert
        assertThat(color).isEqualTo("#e74c3c");
    }

    @Test
    void getBadgeColorForArticle_With20To29Likes_ShouldReturnOrange() {
        // Arrange
        Article trendingArticle = new Article();
        trendingArticle.setLikeCount(20);

        // Act
        String color = articleService.getBadgeColorForArticle(trendingArticle);

        // Assert
        assertThat(color).isEqualTo("#f39c12");
    }

    @Test
    void getBadgeColorForArticle_With10To19Likes_ShouldReturnDarkerOrange() {
        // Arrange
        Article popularArticle = new Article();
        popularArticle.setLikeCount(10);

        // Act
        String color = articleService.getBadgeColorForArticle(popularArticle);

        // Assert
        assertThat(color).isEqualTo("#e67e22");
    }

    @Test
    void getBadgeColorForArticle_WithLessThan10Likes_ShouldReturnNull() {
        // Arrange
        Article normalArticle = new Article();
        normalArticle.setLikeCount(5);

        // Act
        String color = articleService.getBadgeColorForArticle(normalArticle);

        // Assert
        assertThat(color).isNull();
    }

    @Test
    void getBadgeColorForArticle_WithNullArticle_ShouldReturnNull() {
        // Act
        String color = articleService.getBadgeColorForArticle(null);

        // Assert
        assertThat(color).isNull();
    }

    @Test
    void updateArticleCounts_WhenArticleExists_ShouldUpdateLikeAndDislikeCounts() {
        // Arrange
        Long articleId = 1L;
        int likeCount = 15;
        int dislikeCount = 3;

        when(articleRepository.findById(articleId)).thenReturn(Optional.of(article1));
        when(reactionRepository.countLikesByArticleId(articleId)).thenReturn(likeCount);
        when(reactionRepository.countDislikesByArticleId(articleId)).thenReturn(dislikeCount);
        when(articleRepository.save(any(Article.class))).thenReturn(article1);

        // Act
        articleService.updateArticleCounts(articleId);

        // Assert
        assertThat(article1.getLikeCount()).isEqualTo(likeCount);
        assertThat(article1.getDislikeCount()).isEqualTo(dislikeCount);
        verify(articleRepository, times(1)).findById(articleId);
        verify(reactionRepository, times(1)).countLikesByArticleId(articleId);
        verify(reactionRepository, times(1)).countDislikesByArticleId(articleId);
        verify(articleRepository, times(1)).save(article1);
    }

    @Test
    void updateArticleCounts_WhenArticleDoesNotExist_ShouldNotUpdateOrSave() {
        // Arrange
        Long articleId = 999L;
        when(articleRepository.findById(articleId)).thenReturn(Optional.empty());

        // Act
        articleService.updateArticleCounts(articleId);

        // Assert
        verify(articleRepository, times(1)).findById(articleId);
        verify(reactionRepository, never()).countLikesByArticleId(anyLong());
        verify(reactionRepository, never()).countDislikesByArticleId(anyLong());
        verify(articleRepository, never()).save(any(Article.class));
    }

    @Test
    void getBadgeForArticle_WithBoundaryValues_ShouldReturnCorrectBadge() {
        // Test des valeurs limites
        Article article29Likes = new Article();
        article29Likes.setLikeCount(29);
        assertThat(articleService.getBadgeForArticle(article29Likes)).isEqualTo("⭐  TRENDING");

        Article article30Likes = new Article();
        article30Likes.setLikeCount(30);
        assertThat(articleService.getBadgeForArticle(article30Likes)).isEqualTo("👑 VIRAL");

        Article article19Likes = new Article();
        article19Likes.setLikeCount(19);
        assertThat(articleService.getBadgeForArticle(article19Likes)).isEqualTo("🔥  POPULAR");

        Article article20Likes = new Article();
        article20Likes.setLikeCount(20);
        assertThat(articleService.getBadgeForArticle(article20Likes)).isEqualTo("⭐  TRENDING");

        Article article9Likes = new Article();
        article9Likes.setLikeCount(9);
        assertThat(articleService.getBadgeForArticle(article9Likes)).isNull();

        Article article10Likes = new Article();
        article10Likes.setLikeCount(10);
        assertThat(articleService.getBadgeForArticle(article10Likes)).isEqualTo("🔥  POPULAR");
    }
}