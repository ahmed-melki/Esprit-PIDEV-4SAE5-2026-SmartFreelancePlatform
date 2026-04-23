package tn.esprit.templateexamen.control;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.templateexamen.entite.Faq;
import tn.esprit.templateexamen.service.FaqService;

import java.util.List;

@RestController
@RequestMapping("/faqs")
@RequiredArgsConstructor
public class FaqController {

    private final FaqService faqService;

    @GetMapping
    public List<Faq> getAll() {
        return faqService.getAllFaqs();
    }

    @GetMapping("/{id}")
    public Faq getById(@PathVariable Long id) {
        return faqService.getFaqById(id);
    }

    @PostMapping
    public Faq create(@RequestBody Faq faq) {
        return faqService.createFaq(faq);
    }

    @PutMapping("/{id}")
    public Faq update(@PathVariable Long id, @RequestBody Faq faq) {
        return faqService.updateFaq(id, faq);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        faqService.deleteFaq(id);
    }
}