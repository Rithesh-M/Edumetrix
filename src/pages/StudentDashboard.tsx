import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Code, Dumbbell, FileCheck, Flame, TrendingUp, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { predictScore, generateInsights } from '@/lib/productivity';
import CalendarHeatmap from '@/components/CalendarHeatmap';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [streak, setStreak] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [actRes, streakRes, goalRes] = await Promise.all([
        supabase.from('activities').select('*').eq('student_id', user.id).order('date', { ascending: true }),
        supabase.from('streaks').select('*').eq('student_id', user.id).maybeSingle(),
        supabase.from('goals').select('*').eq('student_id', user.id).eq('is_completed', false).limit(5),
      ]);
      setActivities(actRes.data ?? []);
      setStreak(streakRes.data);
      setGoals(goalRes.data ?? []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const recent = activities.slice(-7);
  const todayActivity = activities.find(a => a.date === new Date().toISOString().split('T')[0]);
  const avgScore = activities.length > 0
    ? Math.round(activities.slice(-14).reduce((s, a) => s + (a.productivity_score ?? 0), 0) / Math.min(activities.length, 14))
    : 0;
  const predicted = predictScore(activities);
  const insights = generateInsights(activities);

  const chartData = recent.map(a => ({
    date: new Date(a.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    score: a.productivity_score ?? 0,
    study: a.study_hours,
    coding: a.coding_practice_hours,
  }));

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Your academic productivity at a glance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Score</p>
                <p className="text-3xl font-heading font-bold text-foreground">{todayActivity?.productivity_score ?? '—'}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-3xl font-heading font-bold text-foreground">{streak?.current_streak ?? 0}<span className="text-lg text-muted-foreground ml-1">days</span></p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Flame className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">14-Day Avg</p>
                <p className="text-3xl font-heading font-bold text-foreground">{avgScore}<span className="text-lg text-muted-foreground ml-1">%</span></p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Predicted Score</p>
                <p className="text-3xl font-heading font-bold text-foreground">{predicted ?? '—'}<span className="text-lg text-muted-foreground ml-1">{predicted ? '%' : ''}</span></p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Productivity Trend</CardTitle>
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
              <p className="text-muted-foreground text-center py-12">No activity data yet. Start logging!</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Daily Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="study" fill="hsl(var(--primary))" name="Study Hours" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="coding" fill="hsl(var(--accent))" name="Coding Hours" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">Log activities to see your breakdown</p>
            )}
          </CardContent>
        </Card>
      </div>

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
          <CardTitle className="font-heading text-lg">Smart Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div key={i} className="p-3 bg-muted rounded-lg text-sm text-foreground">
                {insight}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Goals */}
      {goals.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Active Goals</CardTitle>
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
    </div>
  );
};

export default StudentDashboard;
