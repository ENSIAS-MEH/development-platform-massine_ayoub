package com.youthconnect.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.youthconnect.entity.Activity;
import com.youthconnect.entity.Participation;
import com.youthconnect.entity.User;
import com.youthconnect.repository.ActivityRepository;
import com.youthconnect.repository.ParticipationRepository;

@Service
public class ActivityService {

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private ParticipationRepository participationRepository;

    public List<Activity> getAllActivities() {
        return activityRepository.findAll();
    }

    public List<Activity> getActivitiesByUser(User user) {
        return activityRepository.findByCreatedBy(user);
    }

    public List<Participation> getJoinedActivities(User user) {
        return participationRepository.findByUser(user);
    }

    public Activity createActivity(Activity activity, User creator) {
        activity.setCreatedBy(creator);
        return activityRepository.save(activity);
    }

    public Participation joinActivity(Integer activityId, User user) {
        Activity activity = activityRepository.findById(activityId)
            .orElseThrow(() -> new RuntimeException("Activity not found"));

        if (participationRepository.existsByUserIdAndActivityId(user.getId(), activity.getId())) {
            throw new RuntimeException("You already joined this activity");
        }

        if (activity.getMaxParticipants() != null) {
            int currentCount = participationRepository.findByActivity(activity).size();
            if (currentCount >= activity.getMaxParticipants()) {
                throw new RuntimeException("This activity is full");
            }
        }

        try {
            Participation participation = new Participation();
            participation.setUser(user);
            participation.setActivity(activity);
            return participationRepository.save(participation);
        } catch (Exception e) {
            throw new RuntimeException("You already joined this activity");
        }
    }

    public void leaveActivity(Integer activityId, User user) {
        Activity activity = activityRepository.findById(activityId)
            .orElseThrow(() -> new RuntimeException("Activity not found"));

        Participation participation = participationRepository
            .findByUserAndActivity(user, activity)
            .orElseThrow(() -> new RuntimeException("You are not part of this activity"));

        participationRepository.delete(participation);
    }
    
    public void deleteActivity(Integer activityId, User user) {
        Activity activity = activityRepository.findById(activityId)
            .orElseThrow(() -> new RuntimeException("Activity not found"));

        if (!activity.getCreatedBy().getId().equals(user.getId()) 
            && user.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("You are not authorized to delete this activity");
        }

        activityRepository.delete(activity);
    }
}