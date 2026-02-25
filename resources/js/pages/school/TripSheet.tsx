import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { useT } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';

interface Grade {
  id: string;
  name: string;
}

interface Props extends InertiaSharedProps {
  grades: Grade[];
}

const SchoolTripSheet: React.FC = () => {
  const { grades } = usePage<Props>().props;
  const [selectedGrade, setSelectedGrade] = useState('');

  return (
    <>
      <Head title="Trip Health Sheet Generator" />
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trip Health Sheet Generator</h1>
          <p className="text-muted-foreground text-sm mt-1">Generate health summary sheets for school trips.</p>
        </div>

      <Card className="shadow-sm">
        <CardHeader><CardTitle className="text-base">Configure Trip Sheet</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Grade/Class</label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                <SelectContent>
                  {grades.map(g => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Trip Name</label>
              <Input placeholder="e.g. Science Field Trip" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Trip Date</label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select format" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1pp">1 student per page</SelectItem>
                  <SelectItem value="2pp">2 students per page (compact)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button className="gap-2"><FileText className="h-4 w-4" />Generate PDF</Button>
            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Download Offline Version</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader><CardTitle className="text-base">Preview</CardTitle></CardHeader>
        <CardContent>
          <div className="border rounded-lg p-8 text-center text-muted-foreground min-h-[200px] flex items-center justify-center">
            <p>Select a grade and generate to preview the trip health sheet.</p>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
};

export default SchoolTripSheet;
