package tn.esprit.marketing.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.esprit.marketing.client.CommunicationClient;

@RestController
@RequestMapping("/api/test")
public class TestFeignController {

    @Autowired
    private CommunicationClient communicationClient;

    @GetMapping("/communication")
    public String testCommunication() {
        try {
            String response = communicationClient.checkHealth();
            return "Marketing → Communication: " + response;
        } catch (Exception e) {
            return "Communication service not available: " + e.getMessage();
        }
    }
}