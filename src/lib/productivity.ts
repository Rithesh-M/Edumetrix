import { supabase } from '@/integrations/supabase/client';

// Productivity Score Algorithm:
// Study Hours → 40%, Assignments → 20%, Coding → 25%, Exercise → 15%
// Normalized to 0–100
export function calculateProductivityScore(
  studyHours: number,
  assignmentsCompleted: number,
  codingPracticeHours: number,
  exerciseMinutes: number
): number {
  const studyScore = Math.min(studyHours / 8, 1) * 40;
  const assignmentScore = Math.min(assignmentsCompleted / 5, 1) * 20;
  const codingScore = Math.min(codingPracticeHours / 4, 1) * 25;
  const exerciseScore = Math.min(exerciseMinutes / 60, 1) * 15;
  return Math.round(studyScore + assignmentScore + codingScore + exerciseScore);
}

// Predictive engine: estimate future marks based on recent trends
export function predictScore(activities: Array<{ productivity_score: number | null; study_hours: number; date: string }>) {
  if (activities.length < 3) return null;
  const recent = activities.slice(-14);
  const avgScore = recent.reduce((s, a) => s + (a.productivity_score ?? 0), 0) / recent.length;
  const avgStudy = recent.reduce((s, a) => s + a.study_hours, 0) / recent.length;
  
  // Simple linear projection: avgScore correlates to exam performance
  const predictedMark = Math.min(Math.round(avgScore * 0.85 + avgStudy * 2.5), 100);
  return predictedMark;
}

// Generate insights based on activity patterns
export function generateInsights(activities: Array<{
  date: string;
  productivity_score: number | null;
  study_hours: number;
  coding_practice_hours: number;
  exercise_minutes: number;
  assignments_completed: number;
}>) {
  const insights: string[] = [];
  if (activities.length < 3) return ['Log more activities to get personalized insights!'];

  const recent = activities.slice(-14);
  const avgScore = recent.reduce((s, a) => s + (a.productivity_score ?? 0), 0) / recent.length;
  
  // Weekend analysis
  const weekendActivities = recent.filter(a => {
    const day = new Date(a.date).getDay();
    return day === 0 || day === 6;
  });
  const weekdayActivities = recent.filter(a => {
    const day = new Date(a.date).getDay();
    return day !== 0 && day !== 6;
  });
  
  if (weekendActivities.length > 0 && weekdayActivities.length > 0) {
    const weekendAvg = weekendActivities.reduce((s, a) => s + (a.productivity_score ?? 0), 0) / weekendActivities.length;
    const weekdayAvg = weekdayActivities.reduce((s, a) => s + (a.productivity_score ?? 0), 0) / weekdayActivities.length;
    if (weekdayAvg - weekendAvg > 15) {
      insights.push('📉 Your productivity drops significantly on weekends. Try maintaining a lighter routine.');
    }
  }

  // Coding analysis
  const avgCoding = recent.reduce((s, a) => s + a.coding_practice_hours, 0) / recent.length;
  if (avgCoding < 1) {
    insights.push('💻 You should allocate more time to coding practice for balanced skill development.');
  }

  // Exercise analysis
  const avgExercise = recent.reduce((s, a) => s + a.exercise_minutes, 0) / recent.length;
  if (avgExercise < 20) {
    insights.push('🏃 Low exercise detected. Even 30 minutes of daily exercise boosts focus and productivity.');
  }

  // Consistency
  if (avgScore > 70) {
    insights.push('🌟 Great consistency! You\'re averaging above 70% productivity. Keep it up!');
  } else if (avgScore < 40) {
    insights.push('⚠️ Your average productivity is below 40%. Try setting smaller, achievable daily goals.');
  }

  // Study hours
  const avgStudy = recent.reduce((s, a) => s + a.study_hours, 0) / recent.length;
  if (avgStudy > 6) {
    insights.push('📚 You\'re studying over 6 hours daily. Make sure to take regular breaks to avoid burnout.');
  }

  return insights.length > 0 ? insights : ['Keep logging your activities for more personalized insights!'];
}

// Streak calculation
export async function updateStreak(userId: string) {
  const { data: activities } = await supabase
    .from('activities')
    .select('date')
    .eq('student_id', userId)
    .order('date', { ascending: false });

  if (!activities || activities.length === 0) return;

  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastDate = new Date(activities[0].date);
  lastDate.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 1) {
    streak = 0;
  } else {
    for (let i = 1; i < activities.length; i++) {
      const curr = new Date(activities[i - 1].date);
      const prev = new Date(activities[i].date);
      const diff = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 1) streak++;
      else break;
    }
  }

  const { data: existing } = await supabase
    .from('streaks')
    .select('longest_streak')
    .eq('student_id', userId)
    .maybeSingle();

  const longestStreak = Math.max(streak, existing?.longest_streak ?? 0);

  await supabase.from('streaks').upsert({
    student_id: userId,
    current_streak: streak,
    longest_streak: longestStreak,
    last_active_date: activities[0].date,
  }, { onConflict: 'student_id' });
}
