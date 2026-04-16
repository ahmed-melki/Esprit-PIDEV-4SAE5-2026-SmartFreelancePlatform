package tn.esprit.back.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
public class JwtTokenService {

    private final SecretKey signingKey;

    public JwtTokenService(@Value("${security.jwt.secret}") String secret) {
        this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    public Claims parseToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception ex) {
            throw new BadCredentialsException("Invalid JWT token", ex);
        }
    }

    public Collection<? extends GrantedAuthority> extractAuthorities(Claims claims) {
        Set<GrantedAuthority> authorities = new LinkedHashSet<>();
        Object rolesClaim = claims.get("roles");

        if (rolesClaim instanceof Collection<?> roles) {
            roles.stream()
                    .filter(Objects::nonNull)
                    .map(Object::toString)
                    .map(String::trim)
                    .filter(role -> !role.isEmpty())
                    .map(this::normalizeRole)
                    .map(SimpleGrantedAuthority::new)
                    .forEach(authorities::add);
        } else if (rolesClaim instanceof String roles) {
            List.of(roles.split(",")).stream()
                    .map(String::trim)
                    .filter(role -> !role.isEmpty())
                    .map(this::normalizeRole)
                    .map(SimpleGrantedAuthority::new)
                    .forEach(authorities::add);
        }

        return authorities;
    }

    public String extractSubject(Claims claims) {
        return claims.getSubject();
    }

    private String normalizeRole(String role) {
        return role.startsWith("ROLE_") ? role : "ROLE_" + role.toUpperCase();
    }
}
