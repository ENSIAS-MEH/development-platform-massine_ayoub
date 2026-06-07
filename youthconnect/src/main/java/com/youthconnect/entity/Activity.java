package com.youthconnect.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "activities")
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 80)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String location;

    @Column(name = "activity_date")
    private LocalDateTime activityDate;

    @Column(name = "max_participants")
    private Integer maxParticipants;

    @Column(name = "cover_image", length = 255)
    private String coverImage;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}