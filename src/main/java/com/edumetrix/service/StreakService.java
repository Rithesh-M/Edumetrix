// Project note: This file recalculates streak records from saved activity dates.
// It ensures dashboard streaks stay correct whenever a student updates an existing day log or adds a new one.
package com.edumetrix.service;

import com.edumetrix.domain.Activity;
import com.edumetrix.domain.Streak;
import com.edumetrix.repository.ActivityRepository;
import com.edumetrix.repository.StreakRepository;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StreakService {

    private final ActivityRepository activityRepository;
    private final StreakRepository streakRepository;

    public StreakService(ActivityRepository activityRepository, StreakRepository streakRepository) {
        this.activityRepository = activityRepository;
        this.streakRepository = streakRepository;
    }

    @Transactional
    public Streak recalculate(String studentId) {
        List<Activity> activities = activityRepository.findByStudentIdOrderByDateAsc(studentId);
        Streak streak = streakRepository.findByStudentId(studentId).orElseGet(() -> {
            Streak created = new Streak();
            created.setId(UUID.randomUUID().toString());
            created.setStudentId(studentId);
            return created;
        });

        if (activities.isEmpty()) {
            streak.setCurrentStreak(0);
            streak.setLongestStreak(0);
            streak.setLastActiveDate(null);
            return streakRepository.save(streak);
        }

        int longestStreak = 1;
        int rollingStreak = 1;

        for (int index = 1; index < activities.size(); index++) {
            long diff = ChronoUnit.DAYS.between(activities.get(index - 1).getDate(), activities.get(index).getDate());
            if (diff == 1) {
                rollingStreak++;
                longestStreak = Math.max(longestStreak, rollingStreak);
            } else if (diff > 1) {
                rollingStreak = 1;
            }
        }

        int currentStreak = 1;
        for (int index = activities.size() - 1; index > 0; index--) {
            long diff = ChronoUnit.DAYS.between(activities.get(index - 1).getDate(), activities.get(index).getDate());
            if (diff == 1) {
                currentStreak++;
            } else {
                break;
            }
        }

        LocalDate lastActiveDate = activities.get(activities.size() - 1).getDate();
        if (ChronoUnit.DAYS.between(lastActiveDate, LocalDate.now()) > 1) {
            currentStreak = 0;
        }

        streak.setCurrentStreak(currentStreak);
        streak.setLongestStreak(longestStreak);
        streak.setLastActiveDate(lastActiveDate);
        return streakRepository.save(streak);
    }
}
