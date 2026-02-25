import React from 'react';
import { Link, Head, router, usePage } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { useT } from '@/contexts/LanguageContext';
import type { HealthProfile, Student } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, AlertTriangle, Heart, Syringe, Shield, Phone, FileText } from 'lucide-react';

const sevColors: Record<string, string> = {
  mild: 'bg-muted text-muted-foreground', moderate: 'bg-warning/10 text-warning',
  severe: 'bg-orange-500/10 text-orange-600', critical: 'bg-destructive/10 text-destructive',
  life_threatening: 'bg-destructive text-destructive-foreground',
};

const vaccColors: Record<string, string> = {
  up_to_date: 'bg-success/10 text-success', due_soon: 'bg-warning/10 text-warning', overdue: 'bg-destructive/10 text-destructive',
};

interface Props extends InertiaSharedProps {
  studentId: string;
  healthProfile: HealthProfile;
  student: Student;
}

const SchoolHealthDetail: React.FC = () => {
  const { healthProfile: hp, student } = usePage<Props>().props;
  const T = useT();
  const t = T.HEALTH_TEXT;

  if (!hp || !student) {
    return <div className="p-8 text-center text-muted-foreground">Health profile not found.</div>;
  }

  const hasSevereAllergy = hp.allergies.some(a => a.severity === 'life_threatening' || a.severity === 'severe');

  return (
    <div className="space-y-6 animate-fade-in">
      <Head title={`${student.firstName} ${student.lastName} - Health Profile`} />
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.visit('/school/health/records')}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{student.firstName} {student.lastName}</h1>
          <p className="text-muted-foreground text-sm">{student.grade} · {student.className} · {student.admissionNumber}</p>
        </div>
      </div>

      {/* Alert Banner */}
      {hasSevereAllergy && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-destructive">Life-Threatening Allergy Alert</p>
            {hp.allergies.filter(a => a.severity === 'life_threatening' || a.severity === 'severe').map(a => (
              <p key={a.id} className="text-sm mt-1"><strong>{a.allergen}</strong> — {a.emergencyProtocol}</p>
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conditions">Conditions ({hp.conditions.length})</TabsTrigger>
          <TabsTrigger value="allergies">Allergies ({hp.allergies.length})</TabsTrigger>
          <TabsTrigger value="vaccinations">Vaccinations ({hp.vaccinations.length})</TabsTrigger>
          <TabsTrigger value="incidents">Incidents ({hp.incidents.length})</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Contacts</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Heart className="h-4 w-4 text-primary" />Health Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Blood Type:</span> <strong>{hp.bloodType}</strong></div>
                  <div><span className="text-muted-foreground">Height:</span> <strong>{hp.height} cm</strong></div>
                  <div><span className="text-muted-foreground">Weight:</span> <strong>{hp.weight} kg</strong></div>
                  <div><span className="text-muted-foreground">Vision:</span> <strong>{hp.visionNotes}</strong></div>
                  <div><span className="text-muted-foreground">Hearing:</span> <strong>{hp.hearingNotes}</strong></div>
                  <div><span className="text-muted-foreground">General:</span> <strong>{hp.generalHealthStatus}</strong></div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-base">Quick View</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Active Conditions</p>
                  {hp.conditions.filter(c => c.status === 'active').map(c => (
                    <Badge key={c.id} className={`mr-1 mb-1 ${sevColors[c.severity]}`}>{c.name}</Badge>
                  ))}
                  {hp.conditions.filter(c => c.status === 'active').length === 0 && <p className="text-sm text-muted-foreground">None</p>}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Known Allergies</p>
                  {hp.allergies.map(a => (
                    <Badge key={a.id} className={`mr-1 mb-1 ${sevColors[a.severity]}`}>{a.allergen}</Badge>
                  ))}
                  {hp.allergies.length === 0 && <p className="text-sm text-muted-foreground">None</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conditions">
          <Card className="shadow-sm">
            <CardHeader><div className="flex justify-between"><CardTitle className="text-base">Medical Conditions</CardTitle><Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" />{t.condition.add}</Button></div></CardHeader>
            <CardContent>
              {hp.conditions.length === 0 ? <p className="text-muted-foreground text-center py-8">No conditions recorded.</p> : (
                <div className="space-y-3">
                  {hp.conditions.map(c => (
                    <div key={c.id} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between mb-2">
                        <div><h4 className="font-semibold">{c.name}</h4><p className="text-xs text-muted-foreground">{t.condition.types[c.type as keyof typeof t.condition.types]} · Diagnosed: {c.diagnosedDate}</p></div>
                        <Badge className={sevColors[c.severity]}>{t.condition.severities[c.severity as keyof typeof t.condition.severities]}</Badge>
                      </div>
                      {c.managementNotes && <p className="text-sm mt-2"><strong>Management:</strong> {c.managementNotes}</p>}
                      {c.emergencyActionPlan && <p className="text-sm mt-1"><strong>Emergency Plan:</strong> {c.emergencyActionPlan}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allergies">
          <Card className="shadow-sm">
            <CardHeader><div className="flex justify-between"><CardTitle className="text-base">Allergies</CardTitle><Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" />{t.allergy.add}</Button></div></CardHeader>
            <CardContent>
              {hp.allergies.length === 0 ? <p className="text-muted-foreground text-center py-8">No allergies recorded.</p> : (
                <div className="space-y-3">
                  {hp.allergies.map(a => (
                    <div key={a.id} className={`p-4 rounded-lg border ${a.severity === 'life_threatening' ? 'border-destructive/50 bg-destructive/5' : ''}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div><h4 className="font-semibold">{a.allergen}</h4><p className="text-xs text-muted-foreground">{a.allergenCategory} · Reaction: {a.reactionType}</p></div>
                        <Badge className={sevColors[a.severity]}>{t.allergy.severities[a.severity as keyof typeof t.allergy.severities]}</Badge>
                      </div>
                      <p className="text-sm"><strong>Protocol:</strong> {a.emergencyProtocol}</p>
                      {a.epiPenAvailable && <p className="text-sm mt-1 text-destructive font-medium">🔴 EpiPen: {a.epiPenLocation}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vaccinations">
          <Card className="shadow-sm">
            <CardHeader><div className="flex justify-between"><CardTitle className="text-base">Vaccinations</CardTitle><Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" />{t.vaccination.add}</Button></div></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Vaccine</TableHead><TableHead>Date</TableHead><TableHead>Given By</TableHead><TableHead>Next Due</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {hp.vaccinations.map(v => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.vaccineName}</TableCell>
                      <TableCell className="text-sm">{v.dateAdministered || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{v.administeredBy || '—'}</TableCell>
                      <TableCell className="text-sm">{v.nextDueDate || '—'}</TableCell>
                      <TableCell><Badge className={vaccColors[v.status]}>{t.vaccination.statuses[v.status as keyof typeof t.vaccination.statuses]}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents">
          <Card className="shadow-sm">
            <CardHeader><div className="flex justify-between"><CardTitle className="text-base">Incident Log</CardTitle><Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" />{t.incident.record}</Button></div></CardHeader>
            <CardContent>
              {hp.incidents.length === 0 ? <p className="text-muted-foreground text-center py-8">No incidents recorded.</p> : (
                <div className="space-y-3">
                  {hp.incidents.map(inc => (
                    <div key={inc.id} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between mb-2">
                        <div><Badge variant="outline">{t.incident.types[inc.type as keyof typeof t.incident.types]}</Badge><span className="text-xs text-muted-foreground ml-2">{inc.incidentDate} at {inc.incidentTime}</span></div>
                        {inc.parentNotified && <Badge variant="outline" className="bg-success/10 text-success">Parent Notified</Badge>}
                      </div>
                      <p className="text-sm">{inc.description}</p>
                      <p className="text-sm mt-1"><strong>Action:</strong> {inc.actionTaken}</p>
                      <p className="text-xs text-muted-foreground mt-1">Reported by: {inc.reportedBy}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency">
          <Card className="shadow-sm">
            <CardHeader><div className="flex justify-between"><CardTitle className="text-base">{t.emergency.contacts}</CardTitle><Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" />{t.emergency.addContact}</Button></div></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hp.emergencyContacts.map(ec => (
                  <div key={ec.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="text-sm font-semibold">{ec.fullName}</p>
                      <p className="text-xs text-muted-foreground">{ec.relationship}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono">{ec.primaryPhone}</p>
                      {ec.secondaryPhone && <p className="text-xs text-muted-foreground font-mono">{ec.secondaryPhone}</p>}
                    </div>
                    <Badge variant="outline">#{ec.priority}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card className="shadow-sm">
            <CardHeader><div className="flex justify-between"><CardTitle className="text-base">Health Documents</CardTitle><Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" />{t.documents.upload}</Button></div></CardHeader>
            <CardContent>
              {hp.documents.length === 0 ? <p className="text-muted-foreground text-center py-8">No documents uploaded.</p> : <p>Documents list here.</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchoolHealthDetail;
