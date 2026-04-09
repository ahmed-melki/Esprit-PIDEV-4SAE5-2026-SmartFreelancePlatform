package tn.esprit.blogservice.Controllers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.blogservice.Repositories.ArticleReportRepository;
import tn.esprit.blogservice.Repositories.ArticleRepository;
import tn.esprit.blogservice.Service.ArticleService;
import tn.esprit.blogservice.entities.Article;
import tn.esprit.blogservice.entities.ArticleReport;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/articles")
@CrossOrigin("*")
public class ArticleController {

    @Autowired
    private ArticleService service;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private ArticleReportRepository reportRepository;

    @GetMapping
    public List<Article> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Article getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public Article create(@RequestBody Article article) {
        return service.save(article);
    }

    @PutMapping("/{id}")
    public Article update(@PathVariable Long id, @RequestBody Article article) {
        article.setId(id);
        return service.save(article);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    // DTO pour recevoir la raison
    public static class ReportRequest {
        private String reason;
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    // POST report article - Utilisation directe de l'entité ArticleReport
    @PostMapping("/{id}/report")
    public ResponseEntity<?> reportArticle(@PathVariable Long id,
                                           @RequestBody ArticleReport reportRequest) {
        try {
            // Vérifier si l'article existe
            Article article = articleRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Article non trouvé"));

            // Définir l'ID de l'article et la date
            reportRequest.setArticleId(id);
            reportRequest.setReportedAt(LocalDateTime.now());
            if (reportRequest.getStatus() == null) {
                reportRequest.setStatus("pending");
            }

            // Sauvegarder le signalement
            ArticleReport savedReport = reportRepository.save(reportRequest);

            // Mettre à jour le compteur de signalements
            int totalReports = reportRepository.countByArticleId(id);
            article.setReportCount(totalReports);
            articleRepository.save(article);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Signalement ajouté avec succès");
            response.put("totalReports", totalReports);
            response.put("report", savedReport);

            // Si plus de 3 signalements, supprimer l'article
            if (totalReports >= 3) {
                articleRepository.delete(article);
                response.put("articleDeleted", true);
                response.put("message", "Article supprimé après " + totalReports + " signalements");
            }

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur: " + e.getMessage()));
        }
    }

    // GET reports by article ID
    @GetMapping("/{id}/reports")
    public ResponseEntity<?> getArticleReports(@PathVariable Long id) {
        try {
            List<ArticleReport> reports = reportRepository.findByArticleId(id);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
