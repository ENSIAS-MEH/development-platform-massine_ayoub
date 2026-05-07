package com.youthconnect.repository;

import com.youthconnect.entity.Activity;
import com.youthconnect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Integer> {
    List<Activity> findByCreatedBy(User user);
    List<Activity> findByCategoryId(Integer categoryId);
}