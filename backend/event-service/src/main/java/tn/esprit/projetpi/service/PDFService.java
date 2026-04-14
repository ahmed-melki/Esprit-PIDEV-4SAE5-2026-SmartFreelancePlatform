package tn.esprit.projetpi.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;
import org.springframework.stereotype.Service;
import tn.esprit.projetpi.entities.Sponsorship;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class PDFService {

    public byte[] generatePDF(Sponsorship sponsorship) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // --- Titre ---
        Paragraph title = new Paragraph("CONTRAT DE SPONSORING")
                .setBold()
                .setFontSize(20)
                .setFontColor(ColorConstants.BLUE)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(title);
        document.add(new Paragraph("\n"));

        // --- Informations de l'événement ---
        document.add(new Paragraph("Événement")
                .setBold().setFontSize(14).setFontColor(ColorConstants.BLACK));
        document.add(new Paragraph("Événement : " + sponsorship.getEvent().getTitle()));
        // si tu as une date événement
        document.add(new Paragraph("\n"));

        // --- Informations du sponsor ---
        document.add(new Paragraph("Informations du Sponsor")
                .setBold().setFontSize(14).setFontColor(ColorConstants.BLACK));
        document.add(new Paragraph("Nom : " + sponsorship.getSponsorFirstName() + " " + sponsorship.getSponsorLastName()));
        document.add(new Paragraph("Email : " + sponsorship.getSponsorEmail()));
        document.add(new Paragraph("\n"));

        // --- Montant et date de création ---
        NumberFormat currencyFormatter = NumberFormat.getCurrencyInstance(new Locale("fr", "TN"));
        document.add(new Paragraph("Montant du Sponsoring : " + currencyFormatter.format(sponsorship.getAmount())));
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        document.add(new Paragraph("Date de création : " + sponsorship.getDateCreated().format(dateFormatter)));
        document.add(new Paragraph("\n"));

        // --- Signature ---
        document.add(new Paragraph("Signature électronique : ____________________")
                .setTextAlignment(TextAlignment.RIGHT));

        document.close();
        return baos.toByteArray();
    }
}