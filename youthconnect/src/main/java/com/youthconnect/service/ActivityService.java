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

    public Participation joinActivity(Integer activityId, User user) {
        Activity activity = activityRepository.findById(activityId)
            .orElseThrow(() -> new RuntimeException("Activity not found"));

        if (participationRepository.existsByUserAndActivity(user, activity)) {
            throw new RuntimeException("You already joined this activity");
        }

        if (activity.getMaxParticipants() != null) {
            int currentCount = participationRepository.findByActivity(activity).size();
            if (currentCount >= activity.getMaxParticipants()) {
                throw new RuntimeException("This activity is full");
            }
        }

        Participation participation = new Participation();
        participation.setUser(user);
        participation.setActivity(activity);
        return participationRepository.save(participation);
    }
    
    //--------------------------------------------------------------------------
    
    public Activity createActivity(Activity activity, User creator) {
        activity.setCreatedBy(creator);
        return activityRepository.save(activity);
    }
    
    //--------------------------------------------------------------------------

    public void leaveActivity(Integer activityId, User user) {
        Activity activity = activityRepository.findById(activityId)
            .orElseThrow(() -> new RuntimeException("Activity not found"));

        Participation participation = participationRepository
            .findByUserAndActivity(user, activity)
            .orElseThrow(() -> new RuntimeException("You are not part of this activity"));

        participationRepository.delete(participation);
    }

}