package tn.esprit.templateexamen.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.templateexamen.entite.Faq;
import tn.esprit.templateexamen.repository.FaqRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FaqService {

    private final FaqRepository faqRepository;

    public List<Faq> getAllFaqs() {
        return faqRepository.findAll();
    }

    public Faq getFaqById(Long id) {
        return faqRepository.findById(id).orElse(null);
    }

    public Faq createFaq(Faq faq) {
        return faqRepository.save(faq);
    }

    public Faq updateFaq(Long id, Faq faq) {
        faq.setId(id);
        return faqRepository.save(faq);
    }

    public void deleteFaq(Long id) {
        faqRepository.deleteById(id);
    }

    // Méthode métier : suggérer une réponse à partir du contenu d'un message
    public String suggestReply(String messageContent) {
        List<Faq> faqs = faqRepository.findAll();
        String lowerMsg = messageContent.toLowerCase();
        for (Faq faq : faqs) {
            if (lowerMsg.contains(faq.getKeyword().toLowerCase())) {
                return faq.getAnswer();
            }
        }
        return null; // aucune suggestion
    }
}