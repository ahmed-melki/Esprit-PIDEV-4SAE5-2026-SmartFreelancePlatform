package tn.esprit.back.controllers;


import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import tn.esprit.back.entities.Training;
import tn.esprit.back.services.TrainingService;

import java.util.List;

@RestController
@RequestMapping("/api/trainings")
@RequiredArgsConstructor
public class TrainingController {

    private final TrainingService trainingService;

    @GetMapping
    public List<Training> getAll() {
        return trainingService.findAll();
    }

    @GetMapping("/{id}")
    public Training getById(@PathVariable Long id) {
        return trainingService.findById(id);
    }

    @GetMapping("/status/{status}")
    public List<Training> getByStatus(@PathVariable Training.TrainingStatus status) {
        return trainingService.findByStatus(status);
    }

    @GetMapping("/search")
    public List<Training> search(@RequestParam String keyword) {
        return trainingService.search(keyword);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Training create( @RequestBody Training training) {
        return trainingService.create(training);
    }

    @PutMapping("/{id}")
    public Training update(@PathVariable Long id, @RequestBody Training training) {
        return trainingService.update(id, training);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        trainingService.delete(id);
    }
}
