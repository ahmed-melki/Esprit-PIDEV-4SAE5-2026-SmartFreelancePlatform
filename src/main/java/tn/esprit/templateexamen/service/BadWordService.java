package tn.esprit.templateexamen.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.templateexamen.entite.BadWord;
import tn.esprit.templateexamen.repository.BadWordRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BadWordService {

    private final BadWordRepository badWordRepository;

    public List<BadWord> getAllBadWords() {
        return badWordRepository.findAll();
    }

    public BadWord getBadWordById(Long id) {
        return badWordRepository.findById(id).orElse(null);
    }

    public BadWord createBadWord(BadWord badWord) {
        return badWordRepository.save(badWord);
    }

    public void deleteBadWord(Long id) {
        badWordRepository.deleteById(id);
    }

    // Méthode utilitaire pour vérifier si un texte contient un mot interdit
    public boolean containsBadWord(String text) {
        if (text == null) return false;
        String lower = text.toLowerCase();
        return badWordRepository.findAll().stream()
                .anyMatch(bw -> lower.contains(bw.getWord().toLowerCase()));
    }
}