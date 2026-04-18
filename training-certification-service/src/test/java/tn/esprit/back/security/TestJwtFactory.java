package tn.esprit.back.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;

public final class TestJwtFactory {

    private static final String SECRET = "VGhpc0lzQVRlc3RTZWNyZXRLZXlGb3JTbWFydEZyZWVsYW5jZVNlY3VyaXR5";

    private TestJwtFactory() {
    }

    public static String token(String subject, String... roles) {
        SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET));
        return Jwts.builder()
                .subject(subject)
                .claim("roles", List.of(roles))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3_600_000))
                .signWith(key)
                .compact();
    }
}
