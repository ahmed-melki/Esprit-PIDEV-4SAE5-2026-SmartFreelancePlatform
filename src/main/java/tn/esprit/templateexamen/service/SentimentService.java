package tn.esprit.templateexamen.service;

import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;

@Service
public class SentimentService {

    private static final List<String> POSITIVE_WORDS = Arrays.asList(
            "merci", "parfait", "excellent", "super", "bravo", "bon", "bien", "génial", "top", "sympa"
    );
    private static final List<String> NEGATIVE_WORDS = Arrays.asList(
            "problème", "bug", "déçu", "mauvais", "pas content", "erreur", "retard", "inacceptable", "désolé", "dommage"
    );

    public String analyze(String content) {
        if (content == null || content.trim().isEmpty()) return "NEUTRAL";
        String lower = content.toLowerCase();
        int positiveCount = 0;
        int negativeCount = 0;
        for (String word : POSITIVE_WORDS) {
            if (lower.contains(word)) positiveCount++;
        }
        for (String word : NEGATIVE_WORDS) {
            if (lower.contains(word)) negativeCount++;
        }
        if (positiveCount > negativeCount) return "POSITIVE";
        if (negativeCount > positiveCount) return "NEGATIVE";
        return "NEUTRAL";
    }
}