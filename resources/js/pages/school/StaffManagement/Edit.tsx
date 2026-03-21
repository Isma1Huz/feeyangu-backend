import React, { useState } from 'react';
import { Head, usePage, router, Link } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

interface StaffUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface Props extends InertiaSharedProps {
    user: StaffUser;
    availableRoles: string[];
}

const StaffEdit: React.FC = () => {
    const { toast } = useToast();
    const { user, availableRoles } = usePage<Props>().props;
    const [form, setForm] = useState({
        name: user?.name ?? '',
        email: user?.email ?? '',
        role: user?.role ?? '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);
        router.put(`/school/staff/${user?.id}`, form, {
            onSuccess: () => toast({ title: 'Staff member updated successfully' }),
            onError: (errs) => { setErrors(errs as Record<string, string>); setSubmitting(false); },
            onFinish: () => setSubmitting(false),
            preserveState: false,
        });
    };

    return (
        <AppLayout>
            <Head title={`Edit ${user?.name ?? 'Staff Member'}`} />
            <div className="space-y-6 max-w-2xl">
                <div className="flex items-center gap-4">
                    <Link href={`/school/staff/${user?.id}`}>
                        <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Staff Member</h1>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                </div>

                <Card>
                    <CardHeader><CardTitle>Update Details</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={e => set('name', e.target.value)}
                                    placeholder="Enter full name"
                                />
                                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.email}
                                    onChange={e => set('email', e.target.value)}
                                    placeholder="staff@school.edu"
                                />
                                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <Label htmlFor="role">Role *</Label>
                                <Select value={form.role} onValueChange={v => set('role', v)}>
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(availableRoles ?? []).map(r => (
                                            <SelectItem key={r} value={r} className="capitalize">
                                                {r.replace(/_/g, ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.role && <p className="text-sm text-destructive mt-1">{errors.role}</p>}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'Updating...' : 'Update Staff Member'}
                                </Button>
                                <Link href={`/school/staff/${user?.id}`}>
                                    <Button type="button" variant="outline">Cancel</Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default StaffEdit;
