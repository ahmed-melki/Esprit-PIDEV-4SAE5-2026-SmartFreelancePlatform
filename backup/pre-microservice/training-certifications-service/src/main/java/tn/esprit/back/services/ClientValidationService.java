package tn.esprit.back.services;

import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tn.esprit.back.clients.ClientProfileClient;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClientValidationService {

    private final ClientProfileClient clientProfileClient;

    @Value("${services.client.validation-enabled:true}")
    private boolean validationEnabled;

    public void validateClientExistsOrSkip(Long clientId) {
        if (clientId == null || !validationEnabled) {
            return;
        }

        try {
            var client = clientProfileClient.getClientById(clientId);
            if (client == null || client.id() == null) {
                throw new IllegalArgumentException("Client not found with id: " + clientId);
            }
        } catch (FeignException.NotFound exception) {
            throw new IllegalArgumentException("Client not found with id: " + clientId);
        } catch (FeignException exception) {
            log.warn("Client service unavailable while validating client {}. Continuing in fail-open mode: {}",
                    clientId, exception.getMessage());
        }
    }
}
