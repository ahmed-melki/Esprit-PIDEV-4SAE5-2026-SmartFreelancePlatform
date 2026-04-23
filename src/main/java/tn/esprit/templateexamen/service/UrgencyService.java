package tn.esprit.templateexamen.service;

import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;

@Service
public class UrgencyService {
    private static final List<String> URGENT_KEYWORDS = Arrays.asList(
            "urgent", "asap", "vite", "rapidement", "dès que possible",
            "urgence", "délai court", "critical", "immediately", "priority"
    );

    public boolean isUrgent(String content) {
        if (content == null || content.trim().isEmpty()) return false;
        String lower = content.toLowerCase();
        return URGENT_KEYWORDS.stream().anyMatch(lower::contains);
    }
}