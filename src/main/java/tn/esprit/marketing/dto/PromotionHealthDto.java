package tn.esprit.marketing.dto;

public class PromotionHealthDto {
    private String status;        // "HEALTHY", "AT_RISK", "CRITICAL"
    private String usageRate;     // e.g., "85%"
    private int daysRemaining;
    private String recommendation;

    // Constructors
    public PromotionHealthDto() {}

    public PromotionHealthDto(String status, String usageRate, int daysRemaining, String recommendation) {
        this.status = status;
        this.usageRate = usageRate;
        this.daysRemaining = daysRemaining;
        this.recommendation = recommendation;
    }

    // Getters and setters
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getUsageRate() { return usageRate; }
    public void setUsageRate(String usageRate) { this.usageRate = usageRate; }
    public int getDaysRemaining() { return daysRemaining; }
    public void setDaysRemaining(int daysRemaining) { this.daysRemaining = daysRemaining; }
    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }
}