package tn.esprit.projetpi;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import tn.esprit.projetpi.controllers.EventController;
import tn.esprit.projetpi.entities.Event;
import tn.esprit.projetpi.service.EventService;

import java.util.Arrays;
import java.util.Optional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EventController.class)
public class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EventService service;

    @Autowired
    private ObjectMapper objectMapper;

    // 🔹 GET ALL EVENTS
    @Test
    void testGetAllEvents() throws Exception {

        Event e1 = new Event();
        e1.setId(1L);
        e1.setTitle("Event 1");

        Event e2 = new Event();
        e2.setId(2L);
        e2.setTitle("Event 2");

        Mockito.when(service.getAllEvents())
                .thenReturn(Arrays.asList(e1, e2));

        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2));
    }

    // 🔹 GET EVENT BY ID
    @Test
    void testGetEventById() throws Exception {

        Event event = new Event();
        event.setId(1L);
        event.setTitle("Event Test");

        Mockito.when(service.getEventById(1L))
                .thenReturn(Optional.of(event));

        mockMvc.perform(get("/api/events/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Event Test"));
    }

    // 🔹 CREATE EVENT
    @Test
    void testCreateEvent() throws Exception {

        Event event = new Event();
        event.setId(1L);
        event.setTitle("New Event");

        Mockito.when(service.saveEvent(Mockito.any(Event.class)))
                .thenReturn(event);

        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(event)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("New Event"));
    }

    // 🔹 UPDATE EVENT
    @Test
    void testUpdateEvent() throws Exception {

        Event event = new Event();
        event.setId(1L);
        event.setTitle("Updated Event");

        Mockito.when(service.saveEvent(Mockito.any(Event.class)))
                .thenReturn(event);

        mockMvc.perform(put("/api/events/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(event)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Event"));
    }

    // 🔹 DELETE EVENT
    @Test
    void testDeleteEvent() throws Exception {

        Mockito.doNothing().when(service).deleteEvent(1L);

        mockMvc.perform(delete("/api/events/1"))
                .andExpect(status().isOk());
    }
}