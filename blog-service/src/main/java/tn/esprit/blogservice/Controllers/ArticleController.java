package tn.esprit.blogservice.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.esprit.blogservice.Service.ArticleService;
import tn.esprit.blogservice.entities.Article;

import java.util.List;

@RestController
@RequestMapping("/api/articles")
@CrossOrigin("*")
public class ArticleController {

    @Autowired
    private ArticleService service;

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
}