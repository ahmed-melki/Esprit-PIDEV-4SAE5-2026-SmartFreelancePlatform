package tn.esprit.projetpi.services;

import org.springframework.stereotype.Service;
import tn.esprit.projetpi.entities.Project;
import tn.esprit.projetpi.entities.Role;
import tn.esprit.projetpi.entities.Status;
import tn.esprit.projetpi.entities.User;
import tn.esprit.projetpi.repositories.ProjectRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }


    public Project createProject(Project project) {
        project.setCreatedAt(LocalDateTime.now());
        project.setStatus(Status.OPEN);
        return projectRepository.save(project);
    }


    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }


    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }


    public Project updateProject(Long id, Project updatedProject) {
        Project project = getProjectById(id);

        project.setTitle(updatedProject.getTitle());
        project.setDescription(updatedProject.getDescription());
        project.setBudget(updatedProject.getBudget());
        project.setDeadline(updatedProject.getDeadline());
        project.setStatus(updatedProject.getStatus());

        return projectRepository.save(project);
    }
    public Project updateProjectPartial(Long id, Map<String, Object> updates) {
        Project project = getProjectById(id);

        if (updates.containsKey("title")) {
            project.setTitle((String) updates.get("title"));
        }
        if (updates.containsKey("description")) {
            project.setDescription((String) updates.get("description"));
        }
        if (updates.containsKey("budget")) {
            project.setBudget(Double.valueOf(updates.get("budget").toString()));
        }
        if (updates.containsKey("deadline")) {
            project.setDeadline(LocalDate.parse((String) updates.get("deadline")));
        }
        if (updates.containsKey("status")) {
            project.setStatus(Status.valueOf((String) updates.get("status")));
        }

        return projectRepository.save(project);
    }


    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }
    public List<Project> getMatchedProjectsForFreelancer(User freelancer) {

        if (freelancer.getRole() != Role.FREELANCER) {
            throw new RuntimeException("User is not a freelancer");
        }

        List<Project> openProjects = projectRepository.findAll()
                .stream()
                .filter(p -> p.getStatus() == Status.OPEN)
                .toList();

        return openProjects.stream()
                .filter(project -> {

                    String title = project.getTitle().toLowerCase();
                    String description = project.getDescription().toLowerCase();

                    return freelancer.getSkills().stream()
                            .flatMap(skill -> List.of(skill.split(" ")).stream())
                            .anyMatch(singleSkill ->
                                    title.contains(singleSkill.toLowerCase()) ||
                                            description.contains(singleSkill.toLowerCase())
                            );
                })
                .toList();
    }
}