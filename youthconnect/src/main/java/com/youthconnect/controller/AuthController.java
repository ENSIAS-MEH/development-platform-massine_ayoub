package com.youthconnect.controller;

import com.youthconnect.entity.User;
import com.youthconnect.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        try {
            User user = new User();
            user.setUsername(body.get("name"));
            user.setEmail(body.get("email"));
            user.setPassword(body.get("password"));
            User saved = userService.register(user);
            saved.setPassword(null);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            String emailReceived = body.get("email");
            String passwordReceived = body.get("password");
            
            System.out.println("Email received: " + emailReceived);
            System.out.println("Password received: " + passwordReceived);
            
            User user = userService.findByEmail(emailReceived);
            
            System.out.println("User found: " + user.getUsername());
            System.out.println("Stored password: " + user.getPassword());
            System.out.println("Match result: " + passwordEncoder.matches(passwordReceived, user.getPassword()));
            
            if (!passwordEncoder.matches(passwordReceived, user.getPassword())) {
                return ResponseEntity.badRequest().body("Invalid email or password");
            }
            user.setPassword(null);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            System.out.println("Exception: " + e.getMessage());
            return ResponseEntity.badRequest().body("Invalid email or password");
        }
    }
}