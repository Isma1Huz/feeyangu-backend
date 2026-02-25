import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Search, Download } from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  className: string;
  status: string;
}

interface StudentPortfolio {
  studentId: string;
  completionPercentage: number;
}

interface Props extends InertiaSharedProps {
  students: Student[];
  portfolios: StudentPortfolio[];
}

const SchoolPortfolioAll: React.FC = () => {
  const { students, portfolios } = usePage<Props>().props;
  const [search, setSearch] = useState('');
  const filtered = students.filter(s =>
    s.status === 'active' && `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Head title="All Portfolios" />
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">All Portfolios</h1>
            <p className="text-muted-foreground text-sm mt-1">Browse all student portfolios across all classes.</p>
          </div>
          <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Export All</Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by student name..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(s => {
            const p = portfolios.find(sp => sp.studentId === s.id);
            const pct = p?.completionPercentage ?? 0;
            return (
              <Card key={s.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{s.firstName[0]}{s.lastName[0]}</div>
                    <div>
                      <p className="text-sm font-semibold">{s.firstName} {s.lastName}</p>
                      <p className="text-xs text-muted-foreground">{s.grade} · {s.className}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Completion</span>
                      <span className="font-medium">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default SchoolPortfolioAll;
