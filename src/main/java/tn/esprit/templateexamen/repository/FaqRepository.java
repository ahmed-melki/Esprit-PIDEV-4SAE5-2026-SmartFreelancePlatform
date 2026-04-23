package tn.esprit.templateexamen.repository;

import tn.esprit.templateexamen.entite.Faq;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FaqRepository extends JpaRepository<Faq, Long> {
}