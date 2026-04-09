package tn.esprit.blogservice.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.blogservice.Repositories.ArticleRepository;
import tn.esprit.blogservice.Repositories.ReactionRepository;
import tn.esprit.blogservice.entities.Article;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ArticleService {

    @Autowired
    private final ArticleRepository repo;
    private final ReactionRepository reactionRepository;

    public List<Article> getAll() {
        return repo.findAll();
    }

    public Article getById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public Article save(Article article) {
        return repo.save(article);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    public List<Article> getTopArticles() {
        return repo.findTop10ByOrderByLikeCountDesc();
    }

    public List<Article> getViralArticles() {
        return repo.findViralArticles();
    }

    public String getBadgeForArticle(Article article) {
        if (article == null) return null;  // ✅ Ajout de sécurité
        int likes = article.getLikeCount();
        if (likes >= 30) {
            return "👑 VIRAL";
        } else if (likes >= 20) {
            return "⭐  TRENDING";
        } else if (likes >= 10) {
            return "🔥  POPULAR";
        }
        return null;
    }

    public String getBadgeColorForArticle(Article article) {
        if (article == null) return null;  // ✅ Ajout de sécurité
        int likes = article.getLikeCount();
        if (likes >= 30) {
            return "#e74c3c";
        } else if (likes >= 20) {
            return "#f39c12";
        } else if (likes >= 10) {
            return "#e67e22";
        }
        return null;
    }

    public void updateArticleCounts(Long articleId) {
        Article article = repo.findById(articleId).orElse(null);
        if (article != null) {
            int likeCount = reactionRepository.countLikesByArticleId(articleId);
            int dislikeCount = reactionRepository.countDislikesByArticleId(articleId);
            article.setLikeCount(likeCount);      // ✅ Maintenant disponible
            article.setDislikeCount(dislikeCount); // ✅ Maintenant disponible
            repo.save(article);
        }
    }


}