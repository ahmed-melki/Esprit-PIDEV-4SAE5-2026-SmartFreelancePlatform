package tn.esprit.marketing.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.marketing.dto.CampaignAnalysisRequest;
import tn.esprit.marketing.dto.CampaignAnalysisResult;
import tn.esprit.marketing.dto.CampaignStatisticsResult;
import tn.esprit.marketing.entity.Campaign;
import tn.esprit.marketing.service.CampaignAnalysisService;
import tn.esprit.marketing.service.CampaignStatisticsService;
import tn.esprit.marketing.service.ICampaignService;
import java.util.List;

@RestController
@RequestMapping("/api/campaigns")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class CampaignController {

    private final ICampaignService campaignService;
    private final CampaignAnalysisService analysisService;
    private final CampaignStatisticsService statisticsService;

    @PostMapping
    public ResponseEntity<Campaign> createCampaign(@RequestBody Campaign campaign) {
        return ResponseEntity.ok(campaignService.createCampaign(campaign));
    }

    @GetMapping
    public List<Campaign> getAllCampaigns() {
        return campaignService.getAllCampaigns();
    }

    @GetMapping("/{id}")
    public Campaign getCampaignById(@PathVariable Long id) {
        return campaignService.getCampaignById(id);
    }

    @PutMapping("/{id}")
    public Campaign updateCampaign(@PathVariable Long id, @RequestBody Campaign campaign) {
        return campaignService.updateCampaign(id, campaign);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCampaign(@PathVariable Long id) {
        campaignService.deleteCampaign(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/analyze")
    public ResponseEntity<CampaignAnalysisResult> analyze(@RequestBody CampaignAnalysisRequest request) {
        return ResponseEntity.ok(analysisService.analyze(request));
    }

    @GetMapping("/statistics")
    public ResponseEntity<CampaignStatisticsResult> statistics() {
        return ResponseEntity.ok(statisticsService.getStatistics());
    }
    @PostMapping("/{id}/duplicate")
    public ResponseEntity<Campaign> duplicateCampaign(@PathVariable Long id) {
        Campaign duplicated = campaignService.duplicateCampaign(id);
        return ResponseEntity.ok(duplicated);
    }
    @GetMapping("/test-comm")
    public ResponseEntity<String> testComm() {
        return ResponseEntity.ok("Test endpoint works!");
    }
}