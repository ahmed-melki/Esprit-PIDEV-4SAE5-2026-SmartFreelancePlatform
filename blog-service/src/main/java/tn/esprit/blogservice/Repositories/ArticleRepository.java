package tn.esprit.blogservice.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.blogservice.entities.Article;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
}