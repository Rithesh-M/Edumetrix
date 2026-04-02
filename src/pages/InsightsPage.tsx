import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateInsights, predictScore } from '@/lib/productivity';
import { Lightbulb, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';

const InsightsPage: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [subjectSlots, setSubjectSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('activities').select('*').eq('student_id', user.id).order('date', { ascending: true }),
      supabase.from('subject_slots').select('*').eq('student_id', user.id),
    ]).then(([actRes, subRes]) => {
      setActivities(actRes.data ?? []);
      setSubjectSlots(subRes.data ?? []);
      setLoading(false);
    });
  }, [user]);

  const insights = generateInsights(activities);
  const predicted = predictScore(activities);

  // Subject imbalance analysis
  const subjectMap = new Map<string, { allocated: number; actual: number }>();
  subjectSlots.forEach(s => {
    const existing = subjectMap.get(s.subject_name) ?? { allocated: 0, actual: 0 };
    existing.allocated += Number(s.allocated_hours);
    existing.actual += Number(s.actual_hours);
    subjectMap.set(s.subject_name, existing);
  });

  const subjectInsights: string[] = [];
  subjectMap.forEach((data, name) => {
    if (data.allocated > 0) {
      const ratio = data.actual / data.allocated;
      if (ratio < 0.7) {
        subjectInsights.push(`📕 You're under-allocating time to ${name}. Only ${Math.round(ratio * 100)}% of planned hours completed.`);
      } else if (ratio > 1.3) {
        subjectInsights.push(`📗 Great focus on ${name}! You're exceeding your planned hours by ${Math.round((ratio - 1) * 100)}%.`);
      }
    }
  });

  // Prediction insights
  const predictionInsights: string[] = [];
  if (predicted !== null) {
    if (predicted >= 85) {
      predictionInsights.push(`🎯 At your current pace, predicted performance: ${predicted}%. Excellent trajectory!`);
    } else if (predicted >= 70) {
      predictionInsights.push(`📊 Predicted performance: ${predicted}%. Increase study consistency to reach 85%+.`);
    } else {
      predictionInsights.push(`⚠️ Predicted performance: ${predicted}%. Consider increasing daily study hours and reducing gaps.`);
    }

    const avgStudy = activities.slice(-14).reduce((s, a) => s + a.study_hours, 0) / Math.min(activities.length, 14);
    const neededForNinety = Math.max(0, Math.round((90 - predicted) / 2.5 + avgStudy));
    if (predicted < 90) {
      predictionInsights.push(`📈 To reach 90%, aim for ~${neededForNinety} study hours daily.`);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading insights...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Insights & Predictions</h1>
        <p className="text-muted-foreground">AI-powered analysis of your academic performance</p>
      </div>

      {/* Predictions */}
      <Card className="shadow-card border-primary/20">
        <CardHeader>
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Performance Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {predictionInsights.length > 0 ? (
            <div className="space-y-3">
              {predictionInsights.map((insight, i) => (
                <div key={i} className="p-4 bg-primary/5 border border-primary/10 rounded-lg text-sm">{insight}</div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-6">Log at least 3 days of activity for predictions.</p>
          )}
        </CardContent>
      </Card>

      {/* Smart Insights */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-warning" /> Smart Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.map((insight, i) => (
            <div key={i} className="p-4 bg-muted rounded-lg text-sm flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <span>{insight}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Subject Analysis */}
      {subjectInsights.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" /> Subject Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {subjectInsights.map((insight, i) => (
              <div key={i} className="p-4 bg-warning/5 border border-warning/10 rounded-lg text-sm">{insight}</div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InsightsPage;
