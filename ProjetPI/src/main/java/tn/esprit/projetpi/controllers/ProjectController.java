package tn.esprit.projetpi.controllers;

import org.springframework.web.bind.annotation.*;
import tn.esprit.projetpi.entities.Project;
import tn.esprit.projetpi.entities.User;
import tn.esprit.projetpi.services.ProjectService;
import tn.esprit.projetpi.services.UserService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = {"http://localhost:4200"})
public class ProjectController {

    private final ProjectService projectService;
    private final UserService userService;
    public ProjectController(ProjectService projectService,UserService userService) {
        this.projectService = projectService;
        this.userService =userService;
    }

    @PostMapping
    public Project createProject(@RequestBody Project project) {
        return projectService.createProject(project);
    }


    @GetMapping
    public List<Project> getAllProjects() {
        return projectService.getAllProjects();
    }


    @GetMapping("/{id}")
    public Project getProject(@PathVariable Long id) {
        return projectService.getProjectById(id);
    }


    @PutMapping("/{id}")
    public Project updateProject(@PathVariable Long id,
                                 @RequestBody Project project) {
        return projectService.updateProject(id, project);
    }
    @PatchMapping("/{id}")
    public Project updateProjectPartial(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return projectService.updateProjectPartial(id, updates);
    }

    @GetMapping("/matching/{userId}")
    public List<Project> getMatchingProjects(@PathVariable Long userId) {

        User freelancer = userService.getUserById(userId);

        return projectService.getMatchedProjectsForFreelancer(freelancer);
    }

    @DeleteMapping("/{id}")
    public void deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
    }
}