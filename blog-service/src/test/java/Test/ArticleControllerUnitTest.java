package Test;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.blogservice.Controllers.ArticleController;
import tn.esprit.blogservice.Repositories.ArticleReportRepository;
import tn.esprit.blogservice.Repositories.ArticleRepository;
import tn.esprit.blogservice.Service.ArticleService;
import tn.esprit.blogservice.entities.Article;
import tn.esprit.blogservice.entities.ArticleReport;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ArticleControllerUnitTest {

    @Mock
    private ArticleService service;

    @Mock
    private ArticleRepository articleRepository;

    @Mock
    private ArticleReportRepository reportRepository;

    @InjectMocks
    private ArticleController controller;

    private Article article;
    private ArticleReport report;

    @BeforeEach
    void setUp() {
        article = new Article();
        article.setId(1L);
        article.setTitle("Test Article");
        article.setReportCount(0);

        report = new ArticleReport();
        report.setReason("Spam");
    }

    // ✅ Test getAll()
    @Test
    void testGetAll() {
        when(service.getAll()).thenReturn(List.of(article));

        List<Article> result = controller.getAll();

        assertEquals(1, result.size());
        assertEquals("Test Article", result.get(0).getTitle());
        verify(service, times(1)).getAll();
    }

    // ✅ Test getById()
    @Test
    void testGetById() {
        when(service.getById(1L)).thenReturn(article);

        Article result = controller.getById(1L);

        assertNotNull(result);
        assertEquals("Test Article", result.getTitle());
        verify(service, times(1)).getById(1L);
    }

    // ✅ Test create()
    @Test
    void testCreate() {
        when(service.save(article)).thenReturn(article);

        Article result = controller.create(article);

        assertNotNull(result);
        assertEquals("Test Article", result.getTitle());
        verify(service, times(1)).save(article);
    }

    // ✅ Test update()
    @Test
    void testUpdate() {
        when(service.save(article)).thenReturn(article);

        Article result = controller.update(1L, article);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(service, times(1)).save(article);
    }

    // ✅ Test delete()
    @Test
    void testDelete() {
        doNothing().when(service).delete(1L);

        controller.delete(1L);

        verify(service, times(1)).delete(1L);
    }

    // ✅ Test reportArticle() normal
    @Test
    void testReportArticle_Normal() {
        // Préparer les mocks
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));
        when(reportRepository.save(report)).thenReturn(report);
        when(reportRepository.countByArticleId(1L)).thenReturn(1);
        when(articleRepository.save(article)).thenReturn(article);

        // Appeler la méthode
        var response = controller.reportArticle(1L, report);

        // ⚠️ Caster le body en Map pour accéder aux clés
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();

        // Assertions
        assertEquals("Signalement ajouté avec succès", body.get("message"));
        assertEquals(1, body.get("totalReports"));

        // Vérifications des interactions
        verify(articleRepository, times(1)).save(article);
        verify(reportRepository, times(1)).save(report);
    }

    // ✅ Test reportArticle() suppression après 3 signalements
    @Test
    void testReportArticle_DeletedAfter3Reports() {
        // Préparer les mocks
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));
        when(reportRepository.save(report)).thenReturn(report);
        when(reportRepository.countByArticleId(1L)).thenReturn(3);

        // Appeler la méthode
        var response = controller.reportArticle(1L, report);

        // ⚠️ Caster le body en Map pour accéder aux clés
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();

        // Assertions
        assertTrue((Boolean) body.get("articleDeleted"));
        assertEquals("Article supprimé après 3 signalements", body.get("message"));

        // Vérification de la suppression
        verify(articleRepository, times(1)).delete(article);
    }

    // ✅ Test getArticleReports()
    @Test
    void testGetArticleReports() {
        when(reportRepository.findByArticleId(1L)).thenReturn(List.of(report));

        var response = controller.getArticleReports(1L);

        var reports = (List<ArticleReport>) response.getBody();
        assertEquals(1, reports.size());
        assertEquals("Spam", reports.get(0).getReason());
        verify(reportRepository, times(1)).findByArticleId(1L);
    }
}