import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, BookOpen } from 'lucide-react';
import { generateInsights } from '@/lib/productivity';

const ParentStudentPage: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [studentData, setStudentData] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('parent_id', user.id).then(async ({ data }) => {
      const studs = data ?? [];
      setStudents(studs);
      
      const dataMap = new Map();
      for (const s of studs) {
        const [actRes, streakRes] = await Promise.all([
          supabase.from('activities').select('*').eq('student_id', s.user_id).order('date', { ascending: true }).limit(30),
          supabase.from('streaks').select('*').eq('student_id', s.user_id).maybeSingle(),
        ]);
        dataMap.set(s.user_id, {
          activities: actRes.data ?? [],
          streak: streakRes.data,
        });
      }
      setStudentData(dataMap);
      setLoading(false);
    });
  }, [user]);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 animate-fade-in">
        <Users className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-xl font-heading font-bold">No Students Linked</h2>
        <p className="text-muted-foreground">Share your parent code from the Profile page with your student.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Student Progress</h1>
        <p className="text-muted-foreground">Detailed view of each linked student</p>
      </div>

      {students.map(student => {
        const data = studentData.get(student.user_id);
        const activities = data?.activities ?? [];
        const streak = data?.streak;
        const avgScore = activities.length > 0
          ? Math.round(activities.slice(-7).reduce((s: number, a: any) => s + (a.productivity_score ?? 0), 0) / Math.min(activities.length, 7))
          : 0;
        const insights = generateInsights(activities);

        return (
          <Card key={student.id} className="shadow-card">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p>{student.name || 'Student'}</p>
                  <p className="text-sm text-muted-foreground font-body font-normal">{student.email}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xl font-bold">{streak?.current_streak ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Streak</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xl font-bold">{avgScore}%</p>
                  <p className="text-xs text-muted-foreground">Avg Score</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xl font-bold">{activities.length}</p>
                  <p className="text-xs text-muted-foreground">Entries</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Insights:</p>
                {insights.slice(0, 3).map((ins, i) => (
                  <p key={i} className="text-sm text-muted-foreground bg-muted p-2 rounded">{ins}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ParentStudentPage;
