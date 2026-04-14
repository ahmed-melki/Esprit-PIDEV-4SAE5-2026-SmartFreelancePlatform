package tn.esprit.blogservice.Repositories;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.blogservice.entities.ArticleReport;
import java.util.List;

@Repository
public interface ArticleReportRepository extends JpaRepository<ArticleReport, Long> {
    int countByArticleId(Long articleId);
    List<ArticleReport> findByArticleId(Long articleId);
}