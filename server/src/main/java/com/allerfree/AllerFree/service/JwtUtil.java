package com.allerfree.AllerFree.service;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import java.util.Date;

@Component
public class JwtUtil {
    private final String secretKey = Jwts.SIG.HS256.key().toString();

    public String generateToken() {
        Date timeNow = new Date();
        Date validUntil = new Date(timeNow.getTime() + 30 * 60 * 1000); //Expires in 30 minutes

        return Jwts.builder()
            .subject("username")
            .issuedAt(timeNow)
            .expiration(validUntil)
            .signWith(Keys.hmacShaKeyFor(secretKey.getBytes()))
            .compact();
    }

    public String getUsername(String token){
        return Jwts.parser()
            .verifyWith(Keys.hmacShaKeyFor(secretKey.getBytes()))
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .getSubject();
    }

    public boolean tokenIsExpired(String token){
        return Jwts.parser()
            .verifyWith(Keys.hmacShaKeyFor(secretKey.getBytes()))
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .getExpiration().before(new Date());
    }

}
