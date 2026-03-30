package tn.esprit.blogservice.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.blogservice.Repositories.ArticleRepository;
import tn.esprit.blogservice.entities.Article;

import java.util.List;

@Service
public class ArticleService {

    @Autowired
    private ArticleRepository repo;

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
}