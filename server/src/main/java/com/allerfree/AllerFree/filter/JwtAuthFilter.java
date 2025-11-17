package com.allerfree.AllerFree.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import com.allerfree.AllerFree.service.JwtUtil;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil, HandlerExceptionResolver handlerExceptionResolver) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    //Check if JWT / user is properly authenticated then proceed with request
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        try{
            String token = getTokenFromRequest(request);
            if (token != null && !jwtUtil.tokenIsExpired(token)){
                // System.out.println("Adding user to security context");
                if (jwtUtil.getUsername(token).equals("username")){ //Supposed to load user from database and compare with data stored in token -> but we don't actually have user accounts
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            token,
                            null,
                            Collections.emptyList()); //Creates authToken based on username, no password, and empty list of authorities
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken); //Adds authToken to security context
                }

                // //See if user was added to security context
                // Authentication authentication = SecurityContextHolder.getContext().getAuthentication(); 
                // if (authentication != null && authentication.isAuthenticated()) {
                //     System.out.print("In security context: ");
                //     System.out.println(authentication.getName());
                // }
            }
            //Continue request chain
            chain.doFilter(request, response);
        }catch (io.jsonwebtoken.security.SignatureException e){
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Error: Invalid token");
        }catch (io.jsonwebtoken.ExpiredJwtException e2){
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Error: Token has expired");
        }catch (Exception e3){ //Need to fix catch all scenario (instead of just receiving 403 Forbidden)
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("Error: Something went wrong");
        }

    }

    //Get the JWT from the request header
    private String getTokenFromRequest(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")){
            return header.substring(7);
        }else{
            return null;
        }
    }
}