import React from 'react';

interface CalendarHeatmapProps {
  activities: Array<{ date: string; productivity_score: number | null }>;
}

const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ activities }) => {
  // Build a map of date -> score
  const scoreMap = new Map<string, number>();
  activities.forEach(a => {
    scoreMap.set(a.date, a.productivity_score ?? 0);
  });

  // Generate last 90 days
  const days: { date: string; score: number; dayOfWeek: number }[] = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      score: scoreMap.get(dateStr) ?? 0,
      dayOfWeek: d.getDay(),
    });
  }

  const getColor = (score: number): string => {
    if (score === 0) return 'bg-muted';
    if (score < 25) return 'bg-primary/20';
    if (score < 50) return 'bg-primary/40';
    if (score < 75) return 'bg-primary/65';
    return 'bg-primary';
  };

  // Group into weeks
  const weeks: typeof days[] = [];
  let currentWeek: typeof days = [];
  days.forEach((day, i) => {
    currentWeek.push(day);
    if (day.dayOfWeek === 6 || i === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-fit">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                className={`w-3 h-3 rounded-sm ${getColor(day.score)} transition-colors`}
                title={`${day.date}: ${day.score}%`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-muted" />
        <div className="w-3 h-3 rounded-sm bg-primary/20" />
        <div className="w-3 h-3 rounded-sm bg-primary/40" />
        <div className="w-3 h-3 rounded-sm bg-primary/65" />
        <div className="w-3 h-3 rounded-sm bg-primary" />
        <span>More</span>
      </div>
    </div>
  );
};

export default CalendarHeatmap;
