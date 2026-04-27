package tn.esprit.marketing.service;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.marketing.dto.CampaignAnalysisRequest;
import tn.esprit.marketing.dto.CampaignAnalysisResult;
import tn.esprit.marketing.entity.Campaign;
import tn.esprit.marketing.entity.Promotion;
import tn.esprit.marketing.repository.CampaignRepository;

import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class CampaignAnalysisService {

    private final CampaignRepository campaignRepository;

    public CampaignAnalysisResult analyze(CampaignAnalysisRequest request) {
        List<String> warnings    = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();
        int score = 0;

        // ── 1. DURATION (30 pts) ─────────────────────────────────────────────
        long durationDays = 0;
        if (request.getStartDate() != null && request.getEndDate() != null) {
            durationDays = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
        }

        if (durationDays >= 30) {
            score += 30;
        } else if (durationDays >= 7) {
            score += 20;
        } else if (durationDays >= 3) {
            score += 10;
            warnings.add("Campaign duration is short (" + durationDays + " days). Consider at least 7 days for better visibility.");
        } else {
            score += 0;
            warnings.add("Campaign duration is too short (" + durationDays + " days). Minimum recommended is 3 days.");
        }

        // ── 2. DISCOUNT QUALITY (25 pts) ─────────────────────────────────────
        double avgDiscount = 0;
        List<Double> discounts = request.getDiscountPercentages();

        if (discounts != null && !discounts.isEmpty()) {
            avgDiscount = discounts.stream().mapToDouble(Double::doubleValue).average().orElse(0);

            if (avgDiscount >= 10 && avgDiscount <= 30) {
                score += 25;  // sweet spot
            } else if (avgDiscount > 30 && avgDiscount <= 50) {
                score += 15;
                warnings.add("Average discount is high (" + String.format("%.1f", avgDiscount) + "%). This may reduce profitability.");
            } else if (avgDiscount > 50) {
                score += 5;
                warnings.add("Average discount exceeds 50% (" + String.format("%.1f", avgDiscount) + "%). This is very risky for margins.");
            } else if (avgDiscount < 10) {
                score += 10;
                suggestions.add("Consider increasing the discount above 10% to attract more customers.");
            }
        } else {
            warnings.add("No promotions attached. A campaign without promotions has no offers for customers.");
            suggestions.add("Add at least 2 promotions with discounts between 10% and 30%.");
        }

        // ── 3. PROMOTION COUNT (25 pts) ───────────────────────────────────────
        int promoCount = (discounts != null) ? discounts.size() : 0;

        if (promoCount >= 3) {
            score += 25;
        } else if (promoCount == 2) {
            score += 15;
            suggestions.add("Adding a third promotion increases campaign appeal and reach.");
        } else if (promoCount == 1) {
            score += 8;
            suggestions.add("Only 1 promotion attached. Consider adding at least 2 more.");
        } else {
            score += 0;
        }

        // ── 4. DESCRIPTION QUALITY (20 pts) ──────────────────────────────────
        String description = request.getDescription();
        if (description != null && description.length() >= 100) {
            score += 20;
        } else if (description != null && description.length() >= 50) {
            score += 12;
            suggestions.add("Enrich your description (currently " + description.length() + " chars). Aim for 100+ characters.");
        } else if (description != null && description.length() >= 20) {
            score += 5;
            warnings.add("Description is too short (" + description.length() + " chars). A detailed description improves campaign credibility.");
        } else {
            score += 0;
            warnings.add("No description provided. Always describe what the campaign is about.");
        }

        // ── 5. BENCHMARK AGAINST EXISTING CAMPAIGNS ───────────────────────────
        List<Campaign> existingCampaigns = campaignRepository.findAll();
        if (!existingCampaigns.isEmpty()) {
            double avgExistingDiscount = existingCampaigns.stream()
                    .flatMap(c -> c.getPromotions().stream())
                    .mapToDouble(Promotion::getDiscountPercentage)
                    .average()
                    .orElse(0);

            if (avgDiscount > 0 && avgExistingDiscount > 0) {
                if (avgDiscount < avgExistingDiscount * 0.5) {
                    suggestions.add("Your average discount (" + String.format("%.1f", avgDiscount)
                            + "%) is much lower than your existing campaigns average ("
                            + String.format("%.1f", avgExistingDiscount) + "%).");
                } else if (avgDiscount > avgExistingDiscount * 1.5) {
                    suggestions.add("Your average discount (" + String.format("%.1f", avgDiscount)
                            + "%) is much higher than your existing campaigns average ("
                            + String.format("%.1f", avgExistingDiscount) + "%).");
                }
            }
        }

        // ── SCORE LABEL ───────────────────────────────────────────────────────
        String label;
        if (score >= 80)      label = "Excellent";
        else if (score >= 60) label = "Good";
        else if (score >= 40) label = "Average";
        else                  label = "Poor";

        return CampaignAnalysisResult.builder()
                .successScore(score)
                .scoreLabel(label)
                .averageDiscount(Math.round(avgDiscount * 10.0) / 10.0)
                .durationDays((int) durationDays)
                .promotionCount(promoCount)
                .warnings(warnings)
                .suggestions(suggestions)
                .build();
    }
}