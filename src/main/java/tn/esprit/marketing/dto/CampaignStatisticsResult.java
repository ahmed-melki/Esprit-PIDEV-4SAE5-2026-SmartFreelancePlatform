package tn.esprit.marketing.dto;

import lombok.*;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CampaignStatisticsResult {
    private long totalCampaigns;
    private long totalPromotions;
    private double averageDiscountAcrossAll;
    private double averageDurationDays;
    private Map<String, Long> campaignsByStatus;   // {"PLANNED": 2, "ACTIVE": 1, "ENDED": 3}
    private String mostGenerousPromoCode;           // code with highest discount
    private double highestDiscount;
    private String campaignWithMostPromotions;
    private int maxPromotionCount;
}