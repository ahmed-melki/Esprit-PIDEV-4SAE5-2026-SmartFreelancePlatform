package tn.esprit.marketing;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.marketing.dto.CampaignAnalysisRequest;
import tn.esprit.marketing.dto.CampaignAnalysisResult;
import tn.esprit.marketing.dto.CampaignStatisticsResult;
import tn.esprit.marketing.entity.Campaign;
import tn.esprit.marketing.entity.CampaignStatus;
import tn.esprit.marketing.repository.CampaignRepository;
import tn.esprit.marketing.repository.PromotionRepository;
import tn.esprit.marketing.service.CampaignService;
import tn.esprit.marketing.service.CampaignAnalysisService;
import tn.esprit.marketing.service.CampaignStatisticsService;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MarketingApplicationTests {

    @Mock
    private CampaignRepository campaignRepository;

    @Mock
    private PromotionRepository promotionRepository;

    @InjectMocks
    private CampaignService campaignService;

    @InjectMocks
    private CampaignAnalysisService analysisService;

    @InjectMocks
    private CampaignStatisticsService statisticsService;

    private Campaign campaign;

    @BeforeEach
    public void setUp() {
        campaign = Campaign.builder()
                .id(1L)
                .name("Summer Sale 2025")
                .description("Big summer discounts for all freelancers on the platform")
                .startDate(LocalDateTime.of(2025, 6, 1, 0, 0))
                .endDate(LocalDateTime.of(2025, 8, 31, 0, 0))
                .status(CampaignStatus.PLANNED)
                .promotions(new ArrayList<>())
                .build();
    }

    // ══════════════════════════════════════════════════════════════
    // 2 TESTS WITH MOCKITO (CRUD)
    // ══════════════════════════════════════════════════════════════

    @Test
    public void testCreateCampaign_WithMockito() {
        when(campaignRepository.save(any(Campaign.class))).thenReturn(campaign);

        Campaign result = campaignService.createCampaign(campaign);

        assertNotNull(result);
        assertEquals("Summer Sale 2025", result.getName());
        assertEquals(CampaignStatus.PLANNED, result.getStatus());
        verify(campaignRepository, times(1)).save(any(Campaign.class));
    }

    @Test
    public void testUpdateCampaign_WithMockito() {
        Campaign updated = Campaign.builder()
                .id(1L)
                .name("Summer Sale Updated")
                .description("Updated description for freelancers")
                .startDate(LocalDateTime.of(2025, 6, 1, 0, 0))
                .endDate(LocalDateTime.of(2025, 9, 30, 0, 0))
                .status(CampaignStatus.ACTIVE)
                .promotions(new ArrayList<>())
                .build();

        when(campaignRepository.findById(1L)).thenReturn(Optional.of(campaign));
        when(campaignRepository.save(any(Campaign.class))).thenReturn(updated);

        Campaign result = campaignService.updateCampaign(1L, updated);

        assertNotNull(result);
        assertEquals("Summer Sale Updated", result.getName());
        assertEquals(CampaignStatus.ACTIVE, result.getStatus());
        verify(campaignRepository, times(1)).findById(1L);
        verify(campaignRepository, times(1)).save(any(Campaign.class));
    }

    // ══════════════════════════════════════════════════════════════
    // 2 TESTS WITH JUNIT (ADVANCED FEATURES)
    // ══════════════════════════════════════════════════════════════

    @Test
    public void testAnalyzeCampaign_WithJUnit() {
        CampaignAnalysisRequest request = CampaignAnalysisRequest.builder()
                .name("Summer Campaign")
                .description("Big summer discounts for all freelancers on our platform this season")
                .startDate(LocalDateTime.of(2025, 6, 1, 0, 0))
                .endDate(LocalDateTime.of(2025, 8, 31, 0, 0))
                .discountPercentages(Arrays.asList(20.0, 15.0, 25.0))
                .build();

        when(campaignRepository.findAll()).thenReturn(new ArrayList<>());

        CampaignAnalysisResult result = analysisService.analyze(request);

        assertNotNull(result);
        assertTrue(result.getSuccessScore() > 0);
        assertTrue(result.getSuccessScore() <= 100);
        assertEquals(3, result.getPromotionCount());
        assertNotNull(result.getScoreLabel());
        assertNotNull(result.getWarnings());
        assertNotNull(result.getSuggestions());
    }

    @Test
    public void testGetStatistics_WithJUnit() {
        when(campaignRepository.findAll()).thenReturn(Arrays.asList(campaign));

        CampaignStatisticsResult result = statisticsService.getStatistics();

        assertNotNull(result);
        assertEquals(1, result.getTotalCampaigns());
        assertEquals(0, result.getTotalPromotions());
        assertNotNull(result.getCampaignsByStatus());
        assertTrue(result.getCampaignsByStatus().containsKey("PLANNED"));
    }
}