package tn.esprit.templateexamen.control;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.templateexamen.entite.BadWord;
import tn.esprit.templateexamen.service.BadWordService;

import java.util.List;

@RestController
@RequestMapping("/bad-words")
@RequiredArgsConstructor
public class BadWordController {

    private final BadWordService badWordService;

    @GetMapping
    public List<BadWord> getAll() {
        return badWordService.getAllBadWords();
    }

    @PostMapping
    public BadWord add(@RequestBody BadWord badWord) {  // ← prend un objet JSON
        return badWordService.createBadWord(badWord);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        badWordService.deleteBadWord(id);
    }
}