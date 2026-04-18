package tn.esprit.back.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.esprit.back.clients.dto.ClientSummaryDto;

@FeignClient(
        name = "client-service",
        path = "/api/clients",
        dismiss404 = true
)
public interface ClientProfileClient {

    @GetMapping("/{clientId}")
    ClientSummaryDto getClientById(@PathVariable("clientId") Long clientId);
}
