import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { useT } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Download, Eye } from 'lucide-react';

const ratingColors: Record<string, string> = { EE: 'bg-success/10 text-success', ME: 'bg-blue-500/10 text-blue-600', AE: 'bg-warning/10 text-warning', BE: 'bg-destructive/10 text-destructive' };

interface Student {
  id: string;
  firstName: string;
  grade: string;
  className: string;
}

interface Strand {
  id: string;
  name: string;
}

interface LearningArea {
  id: string;
  name: string;
  strands: Strand[];
}

interface Portfolio {
  studentId: string;
  completionPercentage: number;
}

interface Evidence {
  id: string;
  studentId: string;
  strandId: string;
  title: string;
  cbcRating: string;
  teacherObservation: string;
  dateOfActivity: string;
  visibility: string;
}

interface Props extends InertiaSharedProps {
  student: Student;
  portfolio: Portfolio;
  learningAreas: LearningArea[];
  evidence: Evidence[];
}

const ParentPortfolio: React.FC = () => {
  const { student, portfolio, learningAreas, evidence } = usePage<Props>().props;
  const T = useT();
  const t = T.PORTFOLIO_TEXT;

  if (!student) return <div className="p-8 text-center text-muted-foreground">Student not found.</div>;

  return (
    <>
      <Head title={`${student.firstName}'s Portfolio`} />
      <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{student.firstName}'s Portfolio</h1>
          <p className="text-muted-foreground text-sm">{student.grade} · {student.className} · Completion: {portfolio?.completionPercentage ?? 0}%</p>
        </div>
        <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />{t.parentView.downloadButton}</Button>
      </div>
      <Progress value={portfolio?.completionPercentage ?? 0} className="h-2" />
      <Tabs defaultValue={learningAreas[0]?.id}>
        <TabsList className="flex-wrap">
          {learningAreas.map(la => <TabsTrigger key={la.id} value={la.id} className="text-xs">{la.name}</TabsTrigger>)}
        </TabsList>
        {learningAreas.map(la => (
          <TabsContent key={la.id} value={la.id}>
            <Accordion type="multiple" className="space-y-2">
              {la.strands.map(strand => {
                const items = evidence.filter(e => e.strandId === strand.id);
                return (
                  <AccordionItem key={strand.id} value={strand.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3"><span className="text-sm font-medium">{strand.name}</span><Badge variant="outline" className="text-xs">{items.length} items</Badge></div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {items.length > 0 ? items.map(ev => (
                        <div key={ev.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50 mb-2">
                          <div className="h-12 w-12 rounded bg-muted flex items-center justify-center shrink-0"><Eye className="h-5 w-5 text-muted-foreground" /></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium">{ev.title}</p>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ratingColors[ev.cbcRating]}`}>{ev.cbcRating}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{ev.teacherObservation}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{ev.dateOfActivity}</p>
                          </div>
                        </div>
                      )) : <p className="text-sm text-muted-foreground italic py-4 text-center">{t.parentView.noEvidenceYet}</p>}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </TabsContent>
        ))}
      </Tabs>
      </div>
    </>
  );
};
export default ParentPortfolio;
