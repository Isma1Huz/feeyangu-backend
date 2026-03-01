import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

interface SchoolUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  created_at: string;
}

interface Props extends InertiaSharedProps {
  users: SchoolUser[];
  filters?: Record<string, string>;
}

const SchoolUsers: React.FC = () => {
  const { toast } = useToast();
  const { users: initialUsers = [] } = usePage<Props>().props;

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SchoolUser | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', status: 'active' });
  const [submitting, setSubmitting] = useState(false);

  const filtered = initialUsers.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', password: '', status: 'active' });
    setFormOpen(true);
  };

  const openEdit = (u: SchoolUser) => {
    setEditingUser(u);
    setForm({ name: u.name, email: u.email, password: '', status: u.status });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) return;
    setSubmitting(true);

    if (editingUser) {
      router.put(`/school/users/${editingUser.id}`, {
        name: form.name,
        email: form.email,
        status: form.status,
      }, {
        onSuccess: () => { toast({ title: 'User updated' }); setFormOpen(false); },
        onError: () => toast({ title: 'Error updating user', variant: 'destructive' } as any),
        onFinish: () => setSubmitting(false),
        preserveState: false,
      });
    } else {
      router.post('/school/users', {
        name: form.name,
        email: form.email,
        password: form.password,
      }, {
        onSuccess: () => { toast({ title: 'Accountant created' }); setFormOpen(false); },
        onError: () => toast({ title: 'Error creating accountant', variant: 'destructive' } as any),
        onFinish: () => setSubmitting(false),
        preserveState: false,
      });
    }
  };

  const handleDelete = (u: SchoolUser) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    router.delete(`/school/users/${u.id}`, {
      onSuccess: () => toast({ title: 'User deleted' }),
      onError: () => toast({ title: 'Error deleting user', variant: 'destructive' } as any),
    });
  };

  return (
    <AppLayout>
      <Head title="Staff Management" />
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage accountants and staff for your school.</p>
          </div>
          <Button onClick={openCreate} size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Add Accountant
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Input
            placeholder="Search staff..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-medium">No staff members found</p>
              <p className="text-sm text-muted-foreground mt-1">Add accountants to manage your school's finances.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filtered.map(u => (
              <Card key={u.id} className="shadow-sm">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={u.role === 'accountant' ? 'default' : 'secondary'} className="text-xs capitalize">
                      {u.role}
                    </Badge>
                    <Badge variant={u.status === 'active' ? 'outline' : 'secondary'} className={`text-xs ${u.status === 'active' ? 'border-green-500/30 text-green-700' : ''}`}>
                      {u.status}
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(u)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(u)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit Staff Member' : 'Add Accountant'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" className="mt-1" />
              </div>
              <div>
                <Label>Email Address</Label>
                <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="john@school.com" className="mt-1" />
              </div>
              {!editingUser && (
                <div>
                  <Label>Password</Label>
                  <Input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min. 8 characters" className="mt-1" />
                </div>
              )}
              {editingUser && (
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {!editingUser && (
                <p className="text-xs text-muted-foreground">
                  The new user will be created as an <strong>Accountant</strong> for your school.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFormOpen(false)} disabled={submitting}>Cancel</Button>
              <Button onClick={handleSave} disabled={!form.name || !form.email || (!editingUser && !form.password) || submitting}>
                {submitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default SchoolUsers;
