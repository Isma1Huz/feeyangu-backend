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

interface Props extends InertiaSharedProps {
    availableRoles: string[];
}

const emptyForm = { name: '', email: '', role: '', password: '', password_confirmation: '' };

const StaffCreate: React.FC = () => {
    const { toast } = useToast();
    const { availableRoles } = usePage<Props>().props;
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);
        router.post('/school/staff', form, {
            onSuccess: () => toast({ title: 'Staff member added successfully' }),
            onError: (errs) => { setErrors(errs as Record<string, string>); setSubmitting(false); },
            onFinish: () => setSubmitting(false),
            preserveState: false,
        });
    };

    return (
        <AppLayout>
            <Head title="Add Staff Member" />
            <div className="space-y-6 max-w-2xl">
                <div className="flex items-center gap-4">
                    <Link href="/school/staff">
                        <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Add Staff Member</h1>
                        <p className="text-sm text-muted-foreground">Create a new staff account</p>
                    </div>
                </div>

                <Card>
                    <CardHeader><CardTitle>Staff Details</CardTitle></CardHeader>
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

                            <div>
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={form.password}
                                    onChange={e => set('password', e.target.value)}
                                    placeholder="Minimum 8 characters"
                                />
                                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                            </div>

                            <div>
                                <Label htmlFor="password_confirmation">Confirm Password *</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={form.password_confirmation}
                                    onChange={e => set('password_confirmation', e.target.value)}
                                    placeholder="Re-enter password"
                                />
                                {errors.password_confirmation && (
                                    <p className="text-sm text-destructive mt-1">{errors.password_confirmation}</p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'Creating...' : 'Create Staff Member'}
                                </Button>
                                <Link href="/school/staff">
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

export default StaffCreate;
