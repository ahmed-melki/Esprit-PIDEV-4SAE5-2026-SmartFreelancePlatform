package tn.esprit.templateexamen.repository;

import tn.esprit.templateexamen.entite.BadWord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BadWordRepository extends JpaRepository<BadWord, Long> {
    List<BadWord> findAll();
}