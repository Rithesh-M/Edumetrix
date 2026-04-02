import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, Flame, Target, BookOpen } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateInsights, predictScore } from '@/lib/productivity';
import CalendarHeatmap from '@/components/CalendarHeatmap';

const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [streak, setStreak] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    // Fetch linked student profiles
    supabase.from('profiles').select('*').eq('parent_id', user.id).then(({ data }) => {
      setStudents(data ?? []);
      if (data && data.length > 0) {
        setSelectedStudent(data[0]);
      }
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    if (!selectedStudent) return;
    Promise.all([
      supabase.from('activities').select('*').eq('student_id', selectedStudent.user_id).order('date', { ascending: true }),
      supabase.from('streaks').select('*').eq('student_id', selectedStudent.user_id).maybeSingle(),
      supabase.from('goals').select('*').eq('student_id', selectedStudent.user_id).eq('is_completed', false).limit(5),
    ]).then(([actRes, streakRes, goalRes]) => {
      setActivities(actRes.data ?? []);
      setStreak(streakRes.data);
      setGoals(goalRes.data ?? []);
    });
  }, [selectedStudent]);

  const recent = activities.slice(-7);
  const avgScore = activities.length > 0
    ? Math.round(activities.slice(-14).reduce((s, a) => s + (a.productivity_score ?? 0), 0) / Math.min(activities.length, 14))
    : 0;
  const predicted = predictScore(activities);
  const insights = generateInsights(activities);

  const chartData = recent.map(a => ({
    date: new Date(a.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    score: a.productivity_score ?? 0,
  }));

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 animate-fade-in">
        <Users className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-xl font-heading font-bold">No Students Linked</h2>
        <p className="text-muted-foreground max-w-md">
          Share your parent code with your student so they can link their account. 
          Find your code on the Profile page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Parent Dashboard</h1>
        <p className="text-muted-foreground">Monitor your student's academic progress</p>
      </div>

      {/* Student Selector */}
      {students.length > 1 && (
        <div className="flex gap-2">
          {students.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedStudent(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedStudent?.id === s.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {s.name || s.email}
            </button>
          ))}
        </div>
      )}

      {selectedStudent && (
        <>
          <Card className="shadow-card gradient-warm text-primary-foreground">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-bold">{selectedStudent.name || 'Student'}</h2>
                  <p className="text-primary-foreground/80 text-sm">{selectedStudent.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="shadow-card">
              <CardContent className="pt-6 text-center">
                <Flame className="w-8 h-8 text-warning mx-auto mb-2" />
                <p className="text-2xl font-heading font-bold">{streak?.current_streak ?? 0}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="w-8 h-8 text-success mx-auto mb-2" />
                <p className="text-2xl font-heading font-bold">{avgScore}%</p>
                <p className="text-sm text-muted-foreground">Avg Productivity</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="pt-6 text-center">
                <Target className="w-8 h-8 text-info mx-auto mb-2" />
                <p className="text-2xl font-heading font-bold">{predicted ?? '—'}{predicted ? '%' : ''}</p>
                <p className="text-sm text-muted-foreground">Predicted Score</p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg">Recent Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-12">No activity data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Heatmap */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg">Activity Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarHeatmap activities={activities} />
            </CardContent>
          </Card>

          {/* Insights */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg">Insights & Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map((insight, i) => (
                <div key={i} className="p-3 bg-muted rounded-lg text-sm">{insight}</div>
              ))}
            </CardContent>
          </Card>

          {/* Goals */}
          {goals.length > 0 && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-heading text-lg">Student's Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {goals.map(goal => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{goal.title}</span>
                      <span className="text-muted-foreground">{Math.round(((goal.current_value ?? 0) / (goal.target_value ?? 1)) * 100)}%</span>
                    </div>
                    <Progress value={((goal.current_value ?? 0) / (goal.target_value ?? 1)) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default ParentDashboard;
