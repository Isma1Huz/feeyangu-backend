import React from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pencil } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';

interface StaffUser {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    lastLogin: string;
    created_at: string;
}

interface Props extends InertiaSharedProps {
    user: StaffUser;
}

const StaffShow: React.FC = () => {
    const { user } = usePage<Props>().props;

    return (
        <AppLayout>
            <Head title={user?.name ?? 'Staff Member'} />
            <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/school/staff">
                            <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
                        </Link>
                        <h1 className="text-2xl font-bold">{user?.name}</h1>
                    </div>
                    <Link href={`/school/staff/${user?.id}/edit`}>
                        <Button variant="outline">
                            <Pencil className="h-4 w-4 mr-2" />Edit
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader><CardTitle>Staff Details</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Full Name</p>
                                    <p className="font-medium">{user?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{user?.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Role</p>
                                    <p className="font-medium capitalize">{user?.role?.replace(/_/g, ' ')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge variant={user?.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                                        {user?.status}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Last Login</p>
                                    <p className="font-medium">{user?.lastLogin ?? 'Never'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Member Since</p>
                                    <p className="font-medium">{user?.created_at}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-3">
                    <Link href={`/school/staff/${user?.id}/permissions`}>
                        <Button variant="outline">Manage Permissions</Button>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
};

export default StaffShow;
