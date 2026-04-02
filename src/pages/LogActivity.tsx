import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { calculateProductivityScore, updateStreak } from '@/lib/productivity';
import { Save, BookOpen, Code, Dumbbell, FileCheck } from 'lucide-react';

const LogActivity: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [studyHours, setStudyHours] = useState('');
  const [assignments, setAssignments] = useState('');
  const [codingHours, setCodingHours] = useState('');
  const [exerciseMinutes, setExerciseMinutes] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const study = parseFloat(studyHours) || 0;
    const assign = parseInt(assignments) || 0;
    const coding = parseFloat(codingHours) || 0;
    const exercise = parseInt(exerciseMinutes) || 0;
    const score = calculateProductivityScore(study, assign, coding, exercise);

    try {
      const { error } = await supabase.from('activities').upsert({
        student_id: user.id,
        date,
        study_hours: study,
        assignments_completed: assign,
        coding_practice_hours: coding,
        exercise_minutes: exercise,
        productivity_score: score,
        notes: notes || null,
      }, { onConflict: 'student_id,date' });

      if (error) throw error;
      await updateStreak(user.id);
      toast({ title: 'Activity logged!', description: `Productivity score: ${score}/100` });
      
      // Reset form
      setStudyHours('');
      setAssignments('');
      setCodingHours('');
      setExerciseMinutes('');
      setNotes('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const previewScore = calculateProductivityScore(
    parseFloat(studyHours) || 0,
    parseInt(assignments) || 0,
    parseFloat(codingHours) || 0,
    parseInt(exerciseMinutes) || 0
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Log Activity</h1>
        <p className="text-muted-foreground">Record your daily academic productivity</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-heading flex items-center justify-between">
            <span>Daily Log</span>
            <div className="text-right">
              <p className="text-sm text-muted-foreground font-body">Productivity Score</p>
              <p className="text-3xl font-bold text-primary">{previewScore}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="study" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" /> Study Hours
                </Label>
                <Input id="study" type="number" step="0.5" min="0" max="24" value={studyHours} onChange={e => setStudyHours(e.target.value)} placeholder="e.g. 4.5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignments" className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-primary" /> Assignments Completed
                </Label>
                <Input id="assignments" type="number" min="0" max="50" value={assignments} onChange={e => setAssignments(e.target.value)} placeholder="e.g. 3" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coding" className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-primary" /> Coding Practice (hrs)
                </Label>
                <Input id="coding" type="number" step="0.5" min="0" max="24" value={codingHours} onChange={e => setCodingHours(e.target.value)} placeholder="e.g. 2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exercise" className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-primary" /> Exercise (minutes)
                </Label>
                <Input id="exercise" type="number" min="0" max="480" value={exerciseMinutes} onChange={e => setExerciseMinutes(e.target.value)} placeholder="e.g. 30" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="How was your day?" maxLength={1000} rows={3} />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Log Activity'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Study Hours (40%)', value: Math.min((parseFloat(studyHours) || 0) / 8, 1) * 40, max: 40 },
              { label: 'Assignments (20%)', value: Math.min((parseInt(assignments) || 0) / 5, 1) * 20, max: 20 },
              { label: 'Coding (25%)', value: Math.min((parseFloat(codingHours) || 0) / 4, 1) * 25, max: 25 },
              { label: 'Exercise (15%)', value: Math.min((parseInt(exerciseMinutes) || 0) / 60, 1) * 15, max: 15 },
            ].map(item => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{Math.round(item.value)}/{item.max}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${(item.value / item.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogActivity;
