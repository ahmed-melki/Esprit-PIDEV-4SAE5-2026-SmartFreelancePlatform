package tn.esprit.back.clients.dto;

public record ClientSummaryDto(
        Long id,
        String firstName,
        String lastName,
        String email
) {
}
