package tn.esprit.marketing.service;

import tn.esprit.marketing.entity.Campaign;
import java.util.List;

public interface ICampaignService {
    Campaign createCampaign(Campaign campaign);
    List<Campaign> getAllCampaigns();
    Campaign getCampaignById(Long id);
    Campaign updateCampaign(Long id, Campaign campaign);
    void deleteCampaign(Long id);
    Campaign duplicateCampaign(Long id);   // <-- add this line
}