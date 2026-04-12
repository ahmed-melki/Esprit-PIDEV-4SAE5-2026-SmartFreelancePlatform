package tn.esprit.projetpi.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.projetpi.entities.Project;
import tn.esprit.projetpi.entities.Role;
import tn.esprit.projetpi.entities.Status;
import tn.esprit.projetpi.entities.User;
import tn.esprit.projetpi.repositories.ProjectRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private ProjectService projectService;

    private Project project;
    private User freelancer;

    @BeforeEach
    void setUp() {
        project = new Project();
        project.setId(1L);
        project.setTitle("Java Spring Boot Project");
        project.setDescription("Need expert in Java and Spring Boot");
        project.setBudget(5000.0);
        project.setDeadline(LocalDate.now().plusDays(30));
        project.setStatus(Status.OPEN);
        project.setCreatedAt(LocalDateTime.now());

        freelancer = new User();
        freelancer.setId(1L);
        freelancer.setRole(Role.FREELANCER);
        // Correction: Convertir Set en List si l'entité User utilise List<String>
        freelancer.setSkills(List.of("Java", "Spring Boot", "Microservices"));
    }

    @Test
    void createProject_ShouldSaveProjectWithOpenStatusAndCreatedAt() {
        // Given
        Project newProject = new Project();
        newProject.setTitle("New Project");
        newProject.setDescription("Description");
        newProject.setBudget(1000.0);

        when(projectRepository.save(any(Project.class))).thenReturn(newProject);

        // When
        Project result = projectService.createProject(newProject);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(Status.OPEN);
        assertThat(result.getCreatedAt()).isNotNull();
        verify(projectRepository, times(1)).save(any(Project.class));
    }

    @Test
    void getAllProjects_ShouldReturnListOfProjects() {
        // Given
        List<Project> projects = Arrays.asList(project, new Project());
        when(projectRepository.findAll()).thenReturn(projects);

        // When
        List<Project> result = projectService.getAllProjects();

        // Then
        assertThat(result).hasSize(2);  // Correction : vérifier la taille
        assertThat(result).contains(project);  // Vérifier qu'il contient le projet
        verify(projectRepository, times(1)).findAll();
    }

    @Test
    void getProjectById_WhenProjectExists_ShouldReturnProject() {
        // Given
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        // When
        Project result = projectService.getProjectById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTitle()).isEqualTo("Java Spring Boot Project");
        verify(projectRepository, times(1)).findById(1L);
    }

    @Test
    void getProjectById_WhenProjectNotFound_ShouldThrowException() {
        // Given
        when(projectRepository.findById(99L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> projectService.getProjectById(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Project not found");
        verify(projectRepository, times(1)).findById(99L);
    }

    @Test
    void updateProject_ShouldUpdateAllFields() {
        // Given
        Project updatedProject = new Project();
        updatedProject.setTitle("Updated Title");
        updatedProject.setDescription("Updated Description");
        updatedProject.setBudget(8000.0);
        updatedProject.setDeadline(LocalDate.now().plusDays(60));
        updatedProject.setStatus(Status.IN_PROGRESS);

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(projectRepository.save(any(Project.class))).thenReturn(project);

        // When
        Project result = projectService.updateProject(1L, updatedProject);

        // Then
        assertThat(result.getTitle()).isEqualTo("Updated Title");
        assertThat(result.getDescription()).isEqualTo("Updated Description");
        assertThat(result.getBudget()).isEqualTo(8000.0);
        assertThat(result.getStatus()).isEqualTo(Status.IN_PROGRESS);
        verify(projectRepository, times(1)).save(project);
    }

    @Test
    void updateProjectPartial_ShouldUpdateOnlyProvidedFields() {
        // Given
        Map<String, Object> updates = new HashMap<>();
        updates.put("title", "Partially Updated Title");
        updates.put("budget", 7500.0);

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(projectRepository.save(any(Project.class))).thenReturn(project);

        // When
        Project result = projectService.updateProjectPartial(1L, updates);

        // Then
        assertThat(result.getTitle()).isEqualTo("Partially Updated Title");
        assertThat(result.getBudget()).isEqualTo(7500.0);
        assertThat(result.getDescription()).isEqualTo("Need expert in Java and Spring Boot");
        assertThat(result.getStatus()).isEqualTo(Status.OPEN);
        verify(projectRepository, times(1)).save(project);
    }

    @Test
    void deleteProject_ShouldDeleteById() {
        // Given
        doNothing().when(projectRepository).deleteById(1L);

        // When
        projectService.deleteProject(1L);

        // Then
        verify(projectRepository, times(1)).deleteById(1L);
    }

    @Test
    void getMatchedProjectsForFreelancer_WhenUserIsFreelancer_ShouldReturnMatchingProjects() {
        // Given
        Project matchingProject1 = new Project();
        matchingProject1.setId(1L);
        matchingProject1.setTitle("Java Developer Needed");
        matchingProject1.setDescription("Spring Boot microservices");
        matchingProject1.setStatus(Status.OPEN);

        Project matchingProject2 = new Project();
        matchingProject2.setId(2L);
        matchingProject2.setTitle("Python Project");
        matchingProject2.setDescription("Data analysis with Spring");  // Ajout de "Spring" pour matcher
        matchingProject2.setStatus(Status.OPEN);

        Project nonMatchingProject = new Project();
        nonMatchingProject.setId(3L);
        nonMatchingProject.setTitle("Frontend React");
        nonMatchingProject.setDescription("UI/UX design");
        nonMatchingProject.setStatus(Status.OPEN);

        Project closedProject = new Project();
        closedProject.setId(4L);
        closedProject.setTitle("Java Project");
        closedProject.setDescription("Backend");
        closedProject.setStatus(Status.CLOSED);

        when(projectRepository.findAll()).thenReturn(Arrays.asList(
                matchingProject1, matchingProject2, nonMatchingProject, closedProject
        ));

        // When
        List<Project> result = projectService.getMatchedProjectsForFreelancer(freelancer);

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).contains(matchingProject1, matchingProject2);  // Utiliser contains au lieu de containsExactly
        assertThat(result).doesNotContain(nonMatchingProject, closedProject);
        verify(projectRepository, times(1)).findAll();
    }

    @Test
    void getMatchedProjectsForFreelancer_WhenUserIsNotFreelancer_ShouldThrowException() {
        // Given
        User client = new User();
        client.setRole(Role.CLIENT);

        // When & Then
        assertThatThrownBy(() -> projectService.getMatchedProjectsForFreelancer(client))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User is not a freelancer");

        verify(projectRepository, never()).findAll();
    }

    @Test
    void getMatchedProjectsForFreelancer_WhenNoMatchingProjects_ShouldReturnEmptyList() {
        // Given
        freelancer.setSkills(List.of("C++", "Rust"));

        Project javaProject = new Project();
        javaProject.setTitle("Java Project");
        javaProject.setDescription("Spring Boot");
        javaProject.setStatus(Status.OPEN);

        when(projectRepository.findAll()).thenReturn(List.of(javaProject));

        // When
        List<Project> result = projectService.getMatchedProjectsForFreelancer(freelancer);

        // Then
        assertThat(result).isEmpty();
        verify(projectRepository, times(1)).findAll();
    }
}