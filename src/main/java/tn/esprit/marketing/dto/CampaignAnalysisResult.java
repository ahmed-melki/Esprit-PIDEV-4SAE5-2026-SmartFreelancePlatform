package tn.esprit.marketing.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CampaignAnalysisResult {
    private int successScore;
    private String scoreLabel;       // "Excellent", "Good", "Average", "Poor"
    private double averageDiscount;
    private int durationDays;
    private int promotionCount;
    private List<String> warnings;
    private List<String> suggestions;
}