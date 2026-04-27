package tn.esprit.marketing.dto;

import java.time.LocalDateTime;

public class ExpiringPromotionDto {
    private Long id;
    private String code;
    private Double discountPercentage;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
    private Integer maxUses;
    private Integer usedCount;
    private Long campaignId;   // <-- added

    // Constructors
    public ExpiringPromotionDto() {}

    public ExpiringPromotionDto(Long id, String code, Double discountPercentage,
                                LocalDateTime validFrom, LocalDateTime validUntil,
                                Integer maxUses, Integer usedCount, Long campaignId) {
        this.id = id;
        this.code = code;
        this.discountPercentage = discountPercentage;
        this.validFrom = validFrom;
        this.validUntil = validUntil;
        this.maxUses = maxUses;
        this.usedCount = usedCount;
        this.campaignId = campaignId;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public Double getDiscountPercentage() { return discountPercentage; }
    public void setDiscountPercentage(Double discountPercentage) { this.discountPercentage = discountPercentage; }

    public LocalDateTime getValidFrom() { return validFrom; }
    public void setValidFrom(LocalDateTime validFrom) { this.validFrom = validFrom; }

    public LocalDateTime getValidUntil() { return validUntil; }
    public void setValidUntil(LocalDateTime validUntil) { this.validUntil = validUntil; }

    public Integer getMaxUses() { return maxUses; }
    public void setMaxUses(Integer maxUses) { this.maxUses = maxUses; }

    public Integer getUsedCount() { return usedCount; }
    public void setUsedCount(Integer usedCount) { this.usedCount = usedCount; }

    public Long getCampaignId() { return campaignId; }
    public void setCampaignId(Long campaignId) { this.campaignId = campaignId; }
}