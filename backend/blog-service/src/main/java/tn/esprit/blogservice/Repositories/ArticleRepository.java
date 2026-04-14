package tn.esprit.blogservice.Repositories;

import tn.esprit.blogservice.entities.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {

    // ✅ Méthode 1: Top 10 articles par nombre de likes (grâce à Spring Data JPA)
    List<Article> findTop10ByOrderByLikeCountDesc();

    // ✅ Méthode 2: Articles viraux (30+ likes) avec requête personnalisée
    @Query("SELECT a FROM Article a WHERE a.likeCount >= 30 ORDER BY a.likeCount DESC")
    List<Article> findViralArticles();

    // ✅ Méthode 3: Articles avec plus de 20 likes
    @Query("SELECT a FROM Article a WHERE a.likeCount >= 20 ORDER BY a.likeCount DESC")
    List<Article> findVeryPopularArticles();

    // ✅ Méthode 4: Articles avec plus de 10 likes
    @Query("SELECT a FROM Article a WHERE a.likeCount >= 10 ORDER BY a.likeCount DESC")
    List<Article> findPopularArticles();

    // ✅ Méthode 5: Compter les likes totaux
    @Query("SELECT SUM(a.likeCount) FROM Article a")
    Integer getTotalLikes();
}