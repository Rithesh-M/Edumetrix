import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, BookOpen, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const SubjectsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [allocated, setAllocated] = useState('');
  const [actual, setActual] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchSlots = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('subject_slots')
      .select('*')
      .eq('student_id', user.id)
      .order('date', { ascending: false })
      .limit(50);
    setSlots(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchSlots(); }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subjectName.trim()) return;
    const { error } = await supabase.from('subject_slots').insert({
      student_id: user.id,
      subject_name: subjectName.trim(),
      allocated_hours: parseFloat(allocated) || 0,
      actual_hours: parseFloat(actual) || 0,
      date,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Subject slot added!' });
      setSubjectName('');
      setAllocated('');
      setActual('');
      setShowForm(false);
      fetchSlots();
    }
  };

  // Aggregate by subject for chart
  const subjectMap = new Map<string, { allocated: number; actual: number; count: number }>();
  slots.forEach(s => {
    const existing = subjectMap.get(s.subject_name) ?? { allocated: 0, actual: 0, count: 0 };
    existing.allocated += Number(s.allocated_hours);
    existing.actual += Number(s.actual_hours);
    existing.count++;
    subjectMap.set(s.subject_name, existing);
  });

  const chartData = Array.from(subjectMap.entries()).map(([name, data]) => ({
    subject: name,
    allocated: Math.round(data.allocated * 10) / 10,
    actual: Math.round(data.actual * 10) / 10,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Subject Slots</h1>
          <p className="text-muted-foreground">Plan vs actual time per subject</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" /> Add Slot
        </Button>
      </div>

      {showForm && (
        <Card className="shadow-card animate-scale-in">
          <CardContent className="pt-6">
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input value={subjectName} onChange={e => setSubjectName(e.target.value)} placeholder="e.g. Mathematics" required maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Allocated Hours</Label>
                  <Input type="number" step="0.5" min="0" value={allocated} onChange={e => setAllocated(e.target.value)} placeholder="2" />
                </div>
                <div className="space-y-2">
                  <Label>Actual Hours</Label>
                  <Input type="number" step="0.5" min="0" value={actual} onChange={e => setActual(e.target.value)} placeholder="1.5" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" /> Planned vs Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="subject" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="allocated" fill="hsl(var(--primary))" name="Planned" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" fill="hsl(var(--accent))" name="Actual" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent slots list */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : slots.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No subject slots yet. Add your first one!</p>
          ) : (
            <div className="space-y-2">
              {slots.slice(0, 20).map(slot => {
                const diff = Number(slot.actual_hours) - Number(slot.allocated_hours);
                return (
                  <div key={slot.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{slot.subject_name}</p>
                        <p className="text-xs text-muted-foreground">{slot.date}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p>{Number(slot.actual_hours)}h / {Number(slot.allocated_hours)}h</p>
                      <p className={`text-xs ${diff >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {diff >= 0 ? '+' : ''}{diff.toFixed(1)}h
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubjectsPage;
