# Backend – Correction de l’URL des fichiers uploadés (éviter 404)

Ce dépôt ne contient que le frontend. Pour que les liens des fichiers uploadés fonctionnent, le backend Spring Boot doit renvoyer une URL correcte (avec le contexte `/Communication`).

## 1. MessageController – URL avec contexte

Utiliser `ServletUriComponentsBuilder` pour construire l’URL du fichier à partir du contexte de la requête :

```java
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

// Dans la méthode uploadFile :

@PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public Message uploadFile(
        @RequestParam("file") MultipartFile file,
        @RequestParam("conversationId") Long conversationId,
        @RequestParam("senderId") Long senderId,
        @RequestParam("receiverId") Long receiverId,
        @RequestParam(value = "content", required = false) String content) throws IOException {

    String uploadDir = "uploads/";
    String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
    Path filePath = Paths.get(uploadDir + fileName);
    Files.createDirectories(filePath.getParent());
    Files.write(filePath, file.getBytes());

    // URL avec le contexte de l’application (ex. /Communication/uploads/fichier.pdf)
    String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
            .path("/uploads/")
            .path(fileName)
            .toUriString();

    Message message = new Message();
    message.setConversationId(conversationId);
    message.setSenderId(senderId);
    message.setReceiverId(receiverId);
    message.setContent(content != null ? content : "📎 Fichier joint");
    message.setFileUrl(fileUrl);
    message.setFileName(file.getOriginalFilename());
    // ... sauvegarde et retour
    return messageRepository.save(message);
}
```

## 2. Ressources statiques (application.properties)

Pour que Spring serve les fichiers du dossier `uploads/` sous `/uploads/**` :

```properties
spring.web.resources.static-locations=file:uploads/
spring.mvc.static-path-pattern=/uploads/**
```

Avec un contexte d’application `/Communication`, l’URL finale sera :  
`http://localhost:8089/Communication/uploads/nom_fichier`.

## 3. Frontend

- Le proxy (`proxy.conf.js`) redirige les requêtes vers `/Communication/uploads/*` vers le backend (port 8089).
- Le service Angular normalise la réponse d’upload (`file_url` → `fileUrl`, `file_name` → `fileName`).
- Le lien dans le chat utilise `msg.fileUrl` tel quel (relatif ou absolu).
