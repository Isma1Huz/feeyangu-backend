import React from 'react';
import { useT } from '@/contexts/LanguageContext';
import { MOCK_LEARNING_AREAS } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings } from 'lucide-react';

const SchoolPortfolioSettings: React.FC = () => {
  const T = useT();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Portfolio Configuration</h1>
        <p className="text-muted-foreground text-sm mt-1">Define CBC learning areas, strands, and evidence requirements.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader><CardTitle className="text-base">Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Allow students to submit own evidence (parent-assisted)</Label>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <Label>Auto-notify parents when new evidence is published</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label>Allow parents to download portfolio as PDF</Label>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Learning Areas & Strands</CardTitle>
            <Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" />Add Area</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="space-y-2">
            {MOCK_LEARNING_AREAS.map(la => (
              <AccordionItem key={la.id} value={la.id} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{la.name}</span>
                    <Badge variant="outline">{la.code}</Badge>
                    <Badge variant="secondary">{la.strands.length} strands</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pb-2">
                    {la.strands.map(strand => (
                      <div key={strand.id} className="flex items-center justify-between p-3 rounded bg-muted/50">
                        <div>
                          <p className="text-sm font-medium">{strand.name}</p>
                          <p className="text-xs text-muted-foreground">{strand.subStrands.length} sub-strands · {strand.requiredEvidenceCount} evidence required</p>
                        </div>
                        <Button variant="ghost" size="sm"><Settings className="h-3.5 w-3.5" /></Button>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolPortfolioSettings;
