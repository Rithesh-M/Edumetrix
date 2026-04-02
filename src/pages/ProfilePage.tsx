import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { User, Save } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [parentCode, setParentCode] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setProfile(data);
        setName(data.name ?? '');
        setNickname(data.nickname ?? '');
        setBio(data.bio ?? '');
        setGender(data.gender ?? '');
        setPronouns(data.pronouns ?? '');
      }
      setLoading(false);
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      name, nickname, bio, gender, pronouns,
    }).eq('user_id', user.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile updated!' });
    }
    setSaving(false);
  };

  const handleLinkParent = async () => {
    if (!user || !parentCode.trim()) return;
    // Parent code is the parent's user_id
    const { error } = await supabase.from('profiles').update({
      parent_id: parentCode.trim(),
    }).eq('user_id', user.id);
    if (error) {
      toast({ title: 'Error', description: 'Invalid parent code', variant: 'destructive' });
    } else {
      toast({ title: 'Parent linked successfully!' });
      setParentCode('');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Personal Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email ?? ''} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input value={role ?? 'Not assigned'} disabled className="bg-muted capitalize" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label>Nickname</Label>
              <Input value={nickname} onChange={e => setNickname(e.target.value)} maxLength={50} />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Input value={gender} onChange={e => setGender(e.target.value)} placeholder="e.g. Male, Female, Non-binary" maxLength={30} />
            </div>
            <div className="space-y-2">
              <Label>Pronouns</Label>
              <Input value={pronouns} onChange={e => setPronouns(e.target.value)} placeholder="e.g. he/him, she/her" maxLength={30} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." maxLength={500} rows={3} />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Parent Linking (for students) */}
      {role === 'student' && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Link Parent Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter your parent's user ID to link accounts. Your parent can find their ID on their profile page.
            </p>
            {profile?.parent_id && (
              <p className="text-sm text-success">✓ Parent account linked</p>
            )}
            <div className="flex gap-2">
              <Input value={parentCode} onChange={e => setParentCode(e.target.value)} placeholder="Parent's user ID" />
              <Button onClick={handleLinkParent}>Link</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User ID for parents */}
      {role === 'parent' && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Your Parent Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">Share this code with your student to link accounts:</p>
            <code className="block p-3 bg-muted rounded-lg text-sm font-mono break-all">{user?.id}</code>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;
