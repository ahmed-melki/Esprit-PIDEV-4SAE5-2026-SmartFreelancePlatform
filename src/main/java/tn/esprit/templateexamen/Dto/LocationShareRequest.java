package tn.esprit.templateexamen.Dto;

import lombok.Data;

@Data
public class LocationShareRequest {
    private Long conversationId;
    private Long senderId;
    private double latitude;
    private double longitude;
}