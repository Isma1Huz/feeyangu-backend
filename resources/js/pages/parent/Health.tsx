import React from 'react';
import { useParams } from 'react-router-dom';
import { useT } from '@/contexts/LanguageContext';
import { MOCK_HEALTH_PROFILES, MOCK_STUDENTS } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Flag, Heart, AlertTriangle } from 'lucide-react';

const sevColors: Record<string, string> = { mild: 'bg-muted text-muted-foreground', moderate: 'bg-warning/10 text-warning', severe: 'bg-orange-500/10 text-orange-600', critical: 'bg-destructive/10 text-destructive', life_threatening: 'bg-destructive text-destructive-foreground' };
const vaccColors: Record<string, string> = { up_to_date: 'bg-success/10 text-success', due_soon: 'bg-warning/10 text-warning', overdue: 'bg-destructive/10 text-destructive' };

const ParentHealth: React.FC = () => {
  const { studentId } = useParams();
  const T = useT();
  const t = T.HEALTH_TEXT;
  const student = MOCK_STUDENTS.find(s => s.id === studentId);
  const hp = MOCK_HEALTH_PROFILES.find(p => p.studentId === studentId);

  if (!student || !hp) return <div className="p-8 text-center text-muted-foreground">Health profile not available for this student.</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{student.firstName}'s Health Profile</h1>
          <p className="text-muted-foreground text-sm">{student.grade} · {student.className}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><Flag className="h-4 w-4" />{t.parentView.flagUpdate}</Button>
          <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />{t.parentView.downloadSummary}</Button>
        </div>
      </div>

      <Tabs defaultValue="conditions">
        <TabsList className="flex-wrap">
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="allergies">Allergies</TabsTrigger>
          <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
          <TabsTrigger value="contacts">Emergency Contacts</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
        </TabsList>
        <TabsContent value="conditions">
          <Card className="shadow-sm"><CardContent className="p-5">
            {hp.conditions.length === 0 ? <p className="text-muted-foreground text-center py-8">No conditions on file.</p> :
              hp.conditions.map(c => (
                <div key={c.id} className="p-3 rounded-lg border mb-2">
                  <div className="flex items-center justify-between"><h4 className="font-semibold text-sm">{c.name}</h4><Badge className={sevColors[c.severity]}>{c.severity}</Badge></div>
                  <p className="text-xs text-muted-foreground mt-1">{c.managementNotes}</p>
                </div>
              ))}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="allergies">
          <Card className="shadow-sm"><CardContent className="p-5">
            {hp.allergies.length === 0 ? <p className="text-muted-foreground text-center py-8">No allergies on file.</p> :
              hp.allergies.map(a => (
                <div key={a.id} className={`p-3 rounded-lg border mb-2 ${a.severity === 'life_threatening' ? 'border-destructive/50 bg-destructive/5' : ''}`}>
                  <div className="flex items-center justify-between"><h4 className="font-semibold text-sm">{a.allergen}</h4><Badge className={sevColors[a.severity]}>{a.severity}</Badge></div>
                  <p className="text-xs text-muted-foreground mt-1">Reaction: {a.reactionType}</p>
                  <p className="text-xs mt-1"><strong>Protocol:</strong> {a.emergencyProtocol}</p>
                  {a.epiPenAvailable && <p className="text-xs text-destructive font-medium mt-1">🔴 EpiPen: {a.epiPenLocation}</p>}
                </div>
              ))}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="vaccinations">
          <Card className="shadow-sm"><CardContent className="p-5">
            <div className="space-y-2">
              {hp.vaccinations.map(v => (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div><p className="text-sm font-medium">{v.vaccineName}</p><p className="text-xs text-muted-foreground">{v.dateAdministered || 'Not yet administered'}</p></div>
                  <Badge className={vaccColors[v.status]}>{v.status.replace('_', ' ')}</Badge>
                </div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="contacts">
          <Card className="shadow-sm"><CardContent className="p-5">
            {hp.emergencyContacts.map(ec => (
              <div key={ec.id} className="flex items-center justify-between p-3 rounded-lg border mb-2">
                <div><p className="text-sm font-semibold">{ec.fullName}</p><p className="text-xs text-muted-foreground">{ec.relationship}</p></div>
                <p className="text-sm font-mono">{ec.primaryPhone}</p>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="incidents">
          <Card className="shadow-sm"><CardContent className="p-5">
            {hp.incidents.filter(i => i.parentNotified).length === 0 ? <p className="text-muted-foreground text-center py-8">No incidents to display.</p> :
              hp.incidents.filter(i => i.parentNotified).map(inc => (
                <div key={inc.id} className="p-3 rounded-lg border mb-2">
                  <div className="flex items-center gap-2 mb-1"><Badge variant="outline">{inc.type}</Badge><span className="text-xs text-muted-foreground">{inc.incidentDate}</span></div>
                  <p className="text-sm">{inc.description}</p>
                  <p className="text-xs mt-1"><strong>Action:</strong> {inc.actionTaken}</p>
                </div>
              ))}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default ParentHealth;
