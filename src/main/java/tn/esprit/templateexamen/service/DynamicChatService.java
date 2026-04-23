package tn.esprit.templateexamen.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class DynamicChatService {

    private final ChatClient chatClient;

    public DynamicChatService(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    public String ask(String message) {
        return chatClient.prompt()
                .user(message)
                .call()
                .content();  // ← ici c'est content() avec des parenthèses
    }
}