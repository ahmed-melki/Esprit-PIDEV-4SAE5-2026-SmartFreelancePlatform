package com.freeflow.user_service.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserStatsDTO {
    private long totalUsers;
    private long activeUsers;
    private long pendingUsers;
    private long freelancers;
    private long clients;
    private long admins;
}