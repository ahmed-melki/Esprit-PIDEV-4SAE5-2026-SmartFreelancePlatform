package tn.esprit.marketing.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.marketing.dto.PromotionHealthDto;
import tn.esprit.marketing.entity.Promotion;
import tn.esprit.marketing.service.IPromotionService;
import tn.esprit.marketing.dto.ExpiringPromotionDto;
import java.util.stream.Collectors;
import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class PromotionController {

    private final IPromotionService promotionService;

    // ========== SPECIFIC ENDPOINTS FIRST ==========
    @GetMapping("/expiring-soon")
    public ResponseEntity<List<ExpiringPromotionDto>> getExpiringSoon(@RequestParam(defaultValue = "7") int days) {
        List<Promotion> promotions = promotionService.getExpiringSoon(days);
        List<ExpiringPromotionDto> dtos = promotions.stream()
                .map(p -> {
                    ExpiringPromotionDto dto = new ExpiringPromotionDto();
                    dto.setId(p.getId());
                    dto.setCode(p.getCode());
                    dto.setDiscountPercentage(p.getDiscountPercentage());
                    dto.setValidFrom(p.getValidFrom());
                    dto.setValidUntil(p.getValidUntil());
                    dto.setMaxUses(p.getMaxUses());
                    dto.setUsedCount(p.getUsedCount());
                    dto.setCampaignId(p.getCampaign().getId());  // requires campaign != null
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/generate-code/{campaignId}")
    public ResponseEntity<String> generateCode(@PathVariable Long campaignId) {
        return ResponseEntity.ok(promotionService.generateCode(campaignId));
    }

    @GetMapping("/campaign/{campaignId}")
    public List<Promotion> getPromotionsByCampaign(@PathVariable Long campaignId) {
        return promotionService.getPromotionsByCampaign(campaignId);
    }

    @GetMapping("/{id}/health")
    public ResponseEntity<PromotionHealthDto> getPromotionHealth(@PathVariable Long id) {
        return ResponseEntity.ok(promotionService.getPromotionHealth(id));
    }

    // ========== GENERIC ENDPOINTS AFTER ==========
    @GetMapping("/{id}")
    public Promotion getPromotionById(@PathVariable Long id) {
        return promotionService.getPromotionById(id);
    }

    @GetMapping
    public List<Promotion> getAllPromotions() {
        return promotionService.getAllPromotions();
    }

    @PostMapping
    public ResponseEntity<Promotion> createPromotion(@RequestBody Promotion promotion,
                                                     @RequestParam Long campaignId) {
        return ResponseEntity.ok(promotionService.createPromotion(promotion, campaignId));
    }

    @PutMapping("/{id}")
    public Promotion updatePromotion(@PathVariable Long id, @RequestBody Promotion promotion) {
        return promotionService.updatePromotion(id, promotion);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePromotion(@PathVariable Long id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.noContent().build();
    }
}