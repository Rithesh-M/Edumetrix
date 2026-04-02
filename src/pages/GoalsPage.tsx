import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Plus, Target, Check, Trash2 } from 'lucide-react';

const GoalsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [deadline, setDeadline] = useState('');

  const fetchGoals = async () => {
    if (!user) return;
    const { data } = await supabase.from('goals').select('*').eq('student_id', user.id).order('created_at', { ascending: false });
    setGoals(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchGoals(); }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;
    const { error } = await supabase.from('goals').insert({
      student_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      target_value: parseFloat(targetValue) || 100,
      deadline: deadline || null,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Goal created!' });
      setTitle('');
      setDescription('');
      setTargetValue('');
      setDeadline('');
      setShowForm(false);
      fetchGoals();
    }
  };

  const toggleComplete = async (goal: any) => {
    await supabase.from('goals').update({ is_completed: !goal.is_completed }).eq('id', goal.id);
    fetchGoals();
  };

  const deleteGoal = async (id: string) => {
    await supabase.from('goals').delete().eq('id', id);
    fetchGoals();
  };

  const activeGoals = goals.filter(g => !g.is_completed);
  const completedGoals = goals.filter(g => g.is_completed);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Goals</h1>
          <p className="text-muted-foreground">Set and track your academic goals</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" /> New Goal
        </Button>
      </div>

      {showForm && (
        <Card className="shadow-card animate-scale-in">
          <CardContent className="pt-6">
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Goal Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Study 6 hours daily" required maxLength={200} />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Details..." maxLength={500} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Value</Label>
                  <Input type="number" value={targetValue} onChange={e => setTargetValue(e.target.value)} placeholder="100" />
                </div>
                <div className="space-y-2">
                  <Label>Deadline</Label>
                  <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Goal</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Active Goals */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" /> Active Goals ({activeGoals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : activeGoals.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No active goals. Set one to stay motivated!</p>
          ) : (
            <div className="space-y-4">
              {activeGoals.map(goal => {
                const progress = Math.min(((goal.current_value ?? 0) / (goal.target_value ?? 1)) * 100, 100);
                return (
                  <div key={goal.id} className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{goal.title}</p>
                        {goal.description && <p className="text-sm text-muted-foreground">{goal.description}</p>}
                        {goal.deadline && <p className="text-xs text-muted-foreground mt-1">Due: {goal.deadline}</p>}
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => toggleComplete(goal)} title="Mark complete">
                          <Check className="w-4 h-4 text-success" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteGoal(goal.id)} title="Delete">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{goal.current_value ?? 0} / {goal.target_value ?? 100}</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-muted-foreground">Completed ({completedGoals.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {completedGoals.map(goal => (
              <div key={goal.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg opacity-70">
                <span className="line-through text-sm">{goal.title}</span>
                <Button size="icon" variant="ghost" onClick={() => toggleComplete(goal)}>
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GoalsPage;
