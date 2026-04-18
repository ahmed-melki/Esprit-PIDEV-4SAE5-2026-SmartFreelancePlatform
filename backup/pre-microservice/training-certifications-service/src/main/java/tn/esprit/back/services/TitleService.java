package tn.esprit.back.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.back.entities.*;
import tn.esprit.back.repositories.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TitleService {

    private final TitleRepository titleRepository;
    private final UserTitleRepository userTitleRepository;
    private final CertificationRepository certificationRepository;
    private final ClientValidationService clientValidationService;

    public Title createTitle(Title title) {
        title.setIsActive(true);
        return titleRepository.save(title);
    }

    public List<Title> getAllActiveTitles() {
        return titleRepository.findByIsActiveTrue();
    }

    public List<UserTitle> getUserTitles(Long clientId) {
        clientValidationService.validateClientExistsOrSkip(clientId);
        return userTitleRepository.findByClientIdOrderByUnlockedAtDesc(clientId);
    }

    public List<Title> checkAndUnlockTitles(Long clientId) {
        clientValidationService.validateClientExistsOrSkip(clientId);
        List<Title> unlockedTitles = new ArrayList<>();
        
        List<Title> eligibleTitles = titleRepository.findActiveTitlesWithRequirements();
        List<Training> completedTrainings = getCompletedTrainingsForClient(clientId);
        
        for (Title title : eligibleTitles) {
            if (userTitleRepository.findByClientIdAndTitleId(clientId, title.getId()).isPresent()) {
                continue;
            }
            
            if (checkTitleRequirements(clientId, completedTrainings, title)) {
                unlockTitle(clientId, title);
                unlockedTitles.add(title);
                log.info("Unlocked title '{}' for client {}", title.getName(), clientId);
            }
        }
        
        return unlockedTitles;
    }

    private boolean checkTitleRequirements(Long clientId, List<Training> completedTrainings, Title title) {
        if (title.getRequiredTrainingCount() != null) {
            if (completedTrainings.size() < title.getRequiredTrainingCount()) {
                return false;
            }
        }
        
        if (title.getRequiredCategories() != null && !title.getRequiredCategories().trim().isEmpty()) {
            Set<String> requiredCategories = Arrays.stream(title.getRequiredCategories().split(","))
                    .map(String::trim)
                    .collect(Collectors.toSet());
            
            Set<String> userCategories = completedTrainings.stream()
                    .map(Training::getCategory)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
            
            if (!userCategories.containsAll(requiredCategories)) {
                return false;
            }
        }
        
        if (title.getRequiredTrainingIds() != null && !title.getRequiredTrainingIds().trim().isEmpty()) {
            Set<Long> requiredTrainingIds = Arrays.stream(title.getRequiredTrainingIds().split(","))
                    .map(String::trim)
                    .map(Long::parseLong)
                    .collect(Collectors.toSet());
            
            Set<Long> userTrainingIds = completedTrainings.stream()
                    .map(Training::getId)
                    .collect(Collectors.toSet());
            
            if (!userTrainingIds.containsAll(requiredTrainingIds)) {
                return false;
            }
        }
        
        return true;
    }

    private List<Training> getCompletedTrainingsForClient(Long clientId) {
        List<Certification> certifications = certificationRepository.findByClientId(clientId);
        
        return certifications.stream()
                .filter(cert -> cert.getStatus() == Certification.CertificateStatus.ISSUED)
                .map(Certification::getTraining)
                .filter(Objects::nonNull)
                .filter(training -> training.getStatus() == Training.TrainingStatus.COMPLETED)
                .distinct()
                .collect(Collectors.toList());
    }

    private void unlockTitle(Long clientId, Title title) {
        UserTitle userTitle = UserTitle.builder()
                .clientId(clientId)
                .title(title)
                .unlockedAt(LocalDateTime.now())
                .unlockSource(UserTitle.UnlockSource.TRAINING_COMPLETION)
                .build();
        
        userTitleRepository.save(userTitle);
    }

    public void initializeDefaultTitles() {
        if (titleRepository.count() == 0) {
            List<Title> defaultTitles = Arrays.asList(
                Title.builder()
                        .name("Kubernauts")
                        .description("Master of container orchestration")
                        .iconName("kubernetes")
                        .requiredCategories("Kubernetes,DevOps")
                        .requiredTrainingCount(2)
                        .rarity(Title.TitleRarity.LEGENDARY)
                        .isActive(true)
                        .build(),
                
                Title.builder()
                        .name("Cloud Architect")
                        .description("Designer of cloud solutions")
                        .iconName("cloud")
                        .requiredCategories("AWS,Azure,Cloud")
                        .requiredTrainingCount(3)
                        .rarity(Title.TitleRarity.EPIC)
                        .isActive(true)
                        .build(),
                
                Title.builder()
                        .name("Full Stack Warrior")
                        .description("Master of frontend and backend")
                        .iconName("code")
                        .requiredCategories("Frontend,Backend,Database")
                        .requiredTrainingCount(3)
                        .rarity(Title.TitleRarity.RARE)
                        .isActive(true)
                        .build(),
                
                Title.builder()
                        .name("Beginner")
                        .description("Just starting the journey")
                        .iconName("star")
                        .requiredTrainingCount(1)
                        .rarity(Title.TitleRarity.COMMON)
                        .isActive(true)
                        .build()
            );
            
            titleRepository.saveAll(defaultTitles);
            log.info("Initialized {} default titles", defaultTitles.size());
        }
    }
}
