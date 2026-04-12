package tn.esprit.projetpi.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tn.esprit.projetpi.entities.Project;
import tn.esprit.projetpi.entities.Role;
import tn.esprit.projetpi.entities.Status;
import tn.esprit.projetpi.entities.User;
import tn.esprit.projetpi.services.ProjectService;
import tn.esprit.projetpi.services.UserService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProjectController.class)
@Import(TestConfig.class)
class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // Utilisation de MockitoBean à la place de MockBean (Spring Boot 3.4+)
    @MockitoBean
    private ProjectService projectService;

    @MockitoBean
    private UserService userService;

    private Project project;
    private User freelancer;

    @BeforeEach
    void setUp() {
        project = new Project();
        project.setId(1L);
        project.setTitle("Test Project");
        project.setDescription("Test Description");
        project.setBudget(5000.0);
        project.setDeadline(LocalDate.now().plusDays(30));
        project.setStatus(Status.OPEN);
        project.setCreatedAt(LocalDateTime.now());

        freelancer = new User();
        freelancer.setId(1L);
        freelancer.setRole(Role.FREELANCER);
        freelancer.setSkills(List.of("Java", "Spring"));
    }

    @Test
    void createProject_ShouldReturnCreatedProject() throws Exception {
        // Given
        when(projectService.createProject(any(Project.class))).thenReturn(project);

        // When & Then
        mockMvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(project)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Test Project"))
                .andExpect(jsonPath("$.status").value("OPEN"));

        verify(projectService, times(1)).createProject(any(Project.class));
    }

    @Test
    void getAllProjects_ShouldReturnListOfProjects() throws Exception {
        // Given
        List<Project> projects = Arrays.asList(project, new Project());
        when(projectService.getAllProjects()).thenReturn(projects);

        // When & Then
        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1L));

        verify(projectService, times(1)).getAllProjects();
    }

    @Test
    void getProject_WhenProjectExists_ShouldReturnProject() throws Exception {
        // Given
        when(projectService.getProjectById(1L)).thenReturn(project);

        // When & Then
        mockMvc.perform(get("/api/projects/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Test Project"));

        verify(projectService, times(1)).getProjectById(1L);
    }



    @Test
    void updateProject_ShouldReturnUpdatedProject() throws Exception {
        // Given
        Project updatedProject = new Project();
        updatedProject.setTitle("Updated Title");
        updatedProject.setDescription("Updated Description");
        updatedProject.setBudget(8000.0);

        when(projectService.updateProject(eq(1L), any(Project.class))).thenReturn(updatedProject);

        // When & Then
        mockMvc.perform(put("/api/projects/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedProject)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"))
                .andExpect(jsonPath("$.description").value("Updated Description"))
                .andExpect(jsonPath("$.budget").value(8000.0));

        verify(projectService, times(1)).updateProject(eq(1L), any(Project.class));
    }

    @Test
    void updateProjectPartial_ShouldReturnPartiallyUpdatedProject() throws Exception {
        // Given
        Map<String, Object> updates = new HashMap<>();
        updates.put("title", "Partially Updated");
        updates.put("budget", 7500.0);

        Project partiallyUpdated = new Project();
        partiallyUpdated.setId(1L);
        partiallyUpdated.setTitle("Partially Updated");
        partiallyUpdated.setDescription("Test Description");
        partiallyUpdated.setBudget(7500.0);
        partiallyUpdated.setStatus(Status.OPEN);

        when(projectService.updateProjectPartial(eq(1L), any(Map.class))).thenReturn(partiallyUpdated);

        // When & Then
        mockMvc.perform(patch("/api/projects/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Partially Updated"))
                .andExpect(jsonPath("$.budget").value(7500.0))
                .andExpect(jsonPath("$.description").value("Test Description"));

        verify(projectService, times(1)).updateProjectPartial(eq(1L), any(Map.class));
    }

    @Test
    void getMatchingProjects_ShouldReturnMatchedProjects() throws Exception {
        // Given
        List<Project> matchedProjects = Arrays.asList(project, new Project());
        when(userService.getUserById(1L)).thenReturn(freelancer);
        when(projectService.getMatchedProjectsForFreelancer(freelancer)).thenReturn(matchedProjects);

        // When & Then
        mockMvc.perform(get("/api/projects/matching/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        verify(userService, times(1)).getUserById(1L);
        verify(projectService, times(1)).getMatchedProjectsForFreelancer(freelancer);
    }

    @Test
    void deleteProject_ShouldDeleteProject() throws Exception {
        // Given
        doNothing().when(projectService).deleteProject(1L);

        // When & Then
        mockMvc.perform(delete("/api/projects/1"))
                .andExpect(status().isOk());

        verify(projectService, times(1)).deleteProject(1L);
    }
}