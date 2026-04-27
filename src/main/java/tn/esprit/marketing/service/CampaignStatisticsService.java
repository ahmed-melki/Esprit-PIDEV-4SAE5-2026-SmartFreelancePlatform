package tn.esprit.marketing.service;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.marketing.dto.CampaignStatisticsResult;
import tn.esprit.marketing.entity.Campaign;
import tn.esprit.marketing.entity.Promotion;
import tn.esprit.marketing.repository.CampaignRepository;

import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CampaignStatisticsService {

    private final CampaignRepository campaignRepository;

    public CampaignStatisticsResult getStatistics() {
        List<Campaign> campaigns = campaignRepository.findAll();

        if (campaigns.isEmpty()) {
            return CampaignStatisticsResult.builder()
                    .totalCampaigns(0).totalPromotions(0)
                    .averageDiscountAcrossAll(0).averageDurationDays(0)
                    .campaignsByStatus(new HashMap<>())
                    .mostGenerousPromoCode("N/A").highestDiscount(0)
                    .campaignWithMostPromotions("N/A").maxPromotionCount(0)
                    .build();
        }

        // Total promotions
        long totalPromotions = campaigns.stream()
                .mapToLong(c -> c.getPromotions().size()).sum();

        // Average discount across all promotions
        double avgDiscount = campaigns.stream()
                .flatMap(c -> c.getPromotions().stream())
                .mapToDouble(Promotion::getDiscountPercentage)
                .average().orElse(0);

        // Average duration
        double avgDuration = campaigns.stream()
                .filter(c -> c.getStartDate() != null && c.getEndDate() != null)
                .mapToLong(c -> ChronoUnit.DAYS.between(c.getStartDate(), c.getEndDate()))
                .average().orElse(0);

        // Campaigns by status
        Map<String, Long> byStatus = campaigns.stream()
                .filter(c -> c.getStatus() != null)
                .collect(Collectors.groupingBy(
                        c -> c.getStatus().name(),
                        Collectors.counting()
                ));

        // Most generous promo code
        Promotion bestPromo = campaigns.stream()
                .flatMap(c -> c.getPromotions().stream())
                .max(Comparator.comparingDouble(Promotion::getDiscountPercentage))
                .orElse(null);

        String bestCode = bestPromo != null ? bestPromo.getCode() : "N/A";
        double bestDiscount = bestPromo != null ? bestPromo.getDiscountPercentage() : 0;

        // Campaign with most promotions
        Campaign richest = campaigns.stream()
                .max(Comparator.comparingInt(c -> c.getPromotions().size()))
                .orElse(null);

        String richestName = richest != null ? richest.getName() : "N/A";
        int richestCount = richest != null ? richest.getPromotions().size() : 0;

        return CampaignStatisticsResult.builder()
                .totalCampaigns(campaigns.size())
                .totalPromotions(totalPromotions)
                .averageDiscountAcrossAll(Math.round(avgDiscount * 10.0) / 10.0)
                .averageDurationDays(Math.round(avgDuration * 10.0) / 10.0)
                .campaignsByStatus(byStatus)
                .mostGenerousPromoCode(bestCode)
                .highestDiscount(bestDiscount)
                .campaignWithMostPromotions(richestName)
                .maxPromotionCount(richestCount)
                .build();
    }
}