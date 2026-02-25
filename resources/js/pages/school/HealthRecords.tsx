import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_HEALTH_PROFILES, MOCK_STUDENTS } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download, Eye } from 'lucide-react';

const severityColors: Record<string, string> = {
  mild: 'text-muted-foreground',
  moderate: 'text-warning',
  severe: 'text-orange-600',
  critical: 'text-destructive',
  life_threatening: 'text-destructive font-bold',
};

const SchoolHealthRecords: React.FC = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Health Records</h1>
          <p className="text-muted-foreground text-sm mt-1">View all student health profiles.</p>
        </div>
        <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Export CSV</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by student name or admission number..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Conditions</TableHead>
                <TableHead>Allergies</TableHead>
                <TableHead>Alert Level</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_HEALTH_PROFILES.map(hp => {
                const student = MOCK_STUDENTS.find(s => s.id === hp.studentId);
                if (!student) return null;
                const name = `${student.firstName} ${student.lastName}`;
                if (search && !name.toLowerCase().includes(search.toLowerCase())) return null;
                const hasSevere = hp.allergies.some(a => a.severity === 'life_threatening' || a.severity === 'severe') || hp.conditions.some(c => c.severity === 'severe' || c.severity === 'critical');
                const alertLevel = hasSevere ? 'Alert' : hp.conditions.length > 0 ? 'Watch' : 'Normal';
                const alertColors = { Alert: 'bg-destructive/10 text-destructive', Watch: 'bg-warning/10 text-warning', Normal: 'bg-success/10 text-success' };

                return (
                  <TableRow key={hp.id} className={hasSevere ? 'bg-destructive/[0.02]' : ''}>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell className="text-sm">{student.className}</TableCell>
                    <TableCell className="text-sm">{hp.conditions.length}</TableCell>
                    <TableCell className="text-sm">{hp.allergies.length}</TableCell>
                    <TableCell><Badge className={alertColors[alertLevel as keyof typeof alertColors]}>{alertLevel}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{hp.lastUpdatedAt.split('T')[0]}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate(`/school/health/records/${hp.studentId}`)}>
                        <Eye className="h-3.5 w-3.5" />View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolHealthRecords;
