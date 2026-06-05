package com.youthconnect.repository;

import com.youthconnect.entity.Activity;
import com.youthconnect.entity.Participation;
import com.youthconnect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ParticipationRepository extends JpaRepository<Participation, Integer> {
    List<Participation> findByUser(User user);
    List<Participation> findByActivity(Activity activity);
    Optional<Participation> findByUserAndActivity(User user, Activity activity);
    boolean existsByUserAndActivity(User user, Activity activity);
}