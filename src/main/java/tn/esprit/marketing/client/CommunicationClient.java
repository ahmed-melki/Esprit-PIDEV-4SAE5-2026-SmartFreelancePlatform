package tn.esprit.marketing.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "communication-service", url = "http://localhost:8089/Communication")
public interface CommunicationClient {

    @GetMapping("/api/health")
    String checkHealth();
}