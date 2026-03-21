import React, { useState } from 'react';
import { Head, usePage, router, Link } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Eye, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

interface StaffMember {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    lastLogin: string;
    created_at: string;
}

interface Props extends InertiaSharedProps {
    staff: StaffMember[];
    availableRoles: string[];
}

const StaffIndex: React.FC = () => {
    const { toast } = useToast();
    const { staff, availableRoles } = usePage<Props>().props;
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const filtered = (staff ?? []).filter(s => {
        const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = !roleFilter || s.role === roleFilter;
        return matchSearch && matchRole;
    });

    const handleDelete = () => {
        if (!deleteId) return;
        router.delete(`/school/staff/${deleteId}`, {
            onSuccess: () => { toast({ title: 'Staff member removed' }); setDeleteId(null); },
            onError: () => toast({ title: 'Error', description: 'Failed to remove staff member.', variant: 'destructive' } as any),
            preserveState: false,
        });
    };

    return (
        <AppLayout>
            <Head title="Staff Management" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Staff Management</h1>
                        <p className="text-sm text-muted-foreground">Manage school staff members and their roles</p>
                    </div>
                    <Link href="/school/staff/create">
                        <Button><Plus className="h-4 w-4 mr-2" />Add Staff Member</Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            className="pl-9"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All roles</SelectItem>
                            {(availableRoles ?? []).map(r => (
                                <SelectItem key={r} value={r} className="capitalize">{r.replace('_', ' ')}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Card>
                    <CardContent className="pt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Last Login</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                                            {search || roleFilter ? 'No staff members match your search.' : 'No staff members yet.'}
                                        </TableCell>
                                    </TableRow>
                                )}
                                {filtered.map(s => (
                                    <TableRow key={s.id}>
                                        <TableCell className="font-medium">{s.name}</TableCell>
                                        <TableCell>{s.email}</TableCell>
                                        <TableCell>
                                            <span className="capitalize">{s.role.replace('_', ' ')}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={s.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                                                {s.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{s.lastLogin}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{s.created_at}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Link href={`/school/staff/${s.id}`}>
                                                    <Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button>
                                                </Link>
                                                <Link href={`/school/staff/${s.id}/edit`}>
                                                    <Button size="sm" variant="ghost"><Pencil className="h-4 w-4" /></Button>
                                                </Link>
                                                <Button size="sm" variant="ghost" onClick={() => setDeleteId(s.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove Staff Member</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove this staff member? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Remove</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
};

export default StaffIndex;
