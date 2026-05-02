package tn.esprit.joboffre;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import tn.esprit.joboffre.controllers.FileController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FileController.class)
class FileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void uploadCV_shouldReturnFileUrl() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "cv.pdf",
                "application/pdf",
                "Contenu du CV".getBytes()
        );

        mockMvc.perform(multipart("/api/files/upload/cv")
                        .file(file))
                .andExpect(status().isOk());
    }

    @Test
    void uploadCV_shouldReturnBadRequestWhenNoFile() throws Exception {
        mockMvc.perform(multipart("/api/files/upload/cv"))
                .andExpect(status().isBadRequest());
    }
}