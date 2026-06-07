package com.youthconnect.controller;

import com.youthconnect.entity.Activity;
import com.youthconnect.repository.ActivityRepository;
import com.youthconnect.repository.ParticipationRepository;
import com.youthconnect.entity.Participation;
import com.youthconnect.entity.User;
import com.youthconnect.service.ActivityService;
import com.youthconnect.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = "*")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @Autowired
    private UserService userService;
    
    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private ParticipationRepository participationRepository;

    @GetMapping
    public ResponseEntity<List<Activity>> getAllActivities() {
        return ResponseEntity.ok(activityService.getAllActivities());
    }

    @PostMapping
    public ResponseEntity<?> createActivity(@RequestBody Activity activity,
                                             @RequestParam String email) {
        try {
            User user = userService.findByEmail(email);
            Activity saved = activityService.createActivity(activity, user);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinActivity(@PathVariable Integer id,
                                           @RequestParam String email) {
        try {
            User user = userService.findByEmail(email);
            Participation p = activityService.joinActivity(id, user);
            return ResponseEntity.ok(p);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}/leave")
    public ResponseEntity<?> leaveActivity(@PathVariable Integer id,
                                            @RequestParam String email) {
        try {
            User user = userService.findByEmail(email);
            activityService.leaveActivity(id, user);
            return ResponseEntity.ok("Left activity successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/created")
    public ResponseEntity<?> getCreatedActivities(@RequestParam String email) {
        try {
            User user = userService.findByEmail(email);
            return ResponseEntity.ok(activityService.getActivitiesByUser(user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/joined")
    public ResponseEntity<?> getJoinedActivities(@RequestParam String email) {
        try {
            User user = userService.findByEmail(email);
            return ResponseEntity.ok(activityService.getJoinedActivities(user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/{id}/count")
    public ResponseEntity<Integer> getParticipantCount(@PathVariable Integer id) {
        try {
            Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity not found"));
            int count = participationRepository.findByActivity(activity).size();
            return ResponseEntity.ok(count);
        } catch (RuntimeException e) {
            return ResponseEntity.ok(0);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteActivity(@PathVariable Integer id,
                                             @RequestParam String email) {
        try {
            User user = userService.findByEmail(email);
            activityService.deleteActivity(id, user);
            return ResponseEntity.ok("Activity deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}