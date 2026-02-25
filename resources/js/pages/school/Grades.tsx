import React, { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Users } from 'lucide-react';
import { Head, usePage } from '@inertiajs/react';
import type { InertiaSharedProps } from '@/types/inertia';
import { useT } from '@/contexts/LanguageContext';
import type { Grade, GradeClass } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/AppLayout';

interface Props extends InertiaSharedProps {
  grades: Grade[];
}

const Grades: React.FC = () => {
  const { toast } = useToast();
  const { GRADES_TEXT: t, COMMON_TEXT } = useT();
  const { grades: initialGrades } = usePage<Props>().props;
  const [grades, setGrades] = useState<Grade[]>(initialGrades);
  const [expandedGrade, setExpandedGrade] = useState<string | null>(null);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [editingClass, setEditingClass] = useState<GradeClass | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'grade' | 'class'; id: string } | null>(null);
  const [gradeName, setGradeName] = useState('');
  const [className, setClassName] = useState('');
  const [classTeacher, setClassTeacher] = useState('');
  const [selectedGradeId, setSelectedGradeId] = useState('');

  const openGradeDialog = (grade?: Grade) => {
    setEditingGrade(grade || null);
    setGradeName(grade?.name || '');
    setGradeDialogOpen(true);
  };

  const openClassDialog = (gradeId: string, cls?: GradeClass) => {
    setEditingClass(cls || null);
    setClassName(cls?.name || '');
    setClassTeacher(cls?.teacher || '');
    setSelectedGradeId(gradeId);
    setClassDialogOpen(true);
  };

  const handleSaveGrade = () => {
    if (!gradeName.trim()) return;
    if (editingGrade) {
      setGrades(prev => prev.map(g => g.id === editingGrade.id ? { ...g, name: gradeName } : g));
      toast({ title: 'Grade updated', description: `${gradeName} has been updated.` });
    } else {
      const newGrade: Grade = { id: `g${Date.now()}`, name: gradeName, studentCount: 0, classes: [] };
      setGrades(prev => [...prev, newGrade]);
      toast({ title: 'Grade created', description: `${gradeName} has been added.` });
    }
    setGradeDialogOpen(false);
  };

  const handleSaveClass = () => {
    if (!className.trim()) return;
    const grade = grades.find(g => g.id === selectedGradeId);
    if (!grade) return;
    if (editingClass) {
      setGrades(prev => prev.map(g => g.id === selectedGradeId
        ? { ...g, classes: g.classes.map(c => c.id === editingClass.id ? { ...c, name: className, teacher: classTeacher } : c) }
        : g));
      toast({ title: 'Class updated', description: `${className} has been updated.` });
    } else {
      const newClass: GradeClass = { id: `c${Date.now()}`, name: className, gradeId: selectedGradeId, gradeName: grade.name, teacher: classTeacher, studentCount: 0 };
      setGrades(prev => prev.map(g => g.id === selectedGradeId ? { ...g, classes: [...g.classes, newClass] } : g));
      toast({ title: 'Class created', description: `${className} has been added to ${grade.name}.` });
    }
    setClassDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'grade') {
      setGrades(prev => prev.filter(g => g.id !== deleteTarget.id));
      toast({ title: 'Grade deleted' });
    } else {
      setGrades(prev => prev.map(g => ({ ...g, classes: g.classes.filter(c => c.id !== deleteTarget.id) })));
      toast({ title: 'Class deleted' });
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  return (
    <AppLayout>
      <Head title={t.title} />
      <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => openGradeDialog()}>
          <Plus className="h-3.5 w-3.5" />
          {t.addGrade}
        </Button>
      </div>

      {grades.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-medium text-muted-foreground">{t.emptyState.title}</p>
            <p className="text-sm text-muted-foreground mt-1">{t.emptyState.description}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {grades.map(grade => (
            <Card key={grade.id} className="border-none shadow-sm">
              <CardHeader className="pb-0 cursor-pointer" onClick={() => setExpandedGrade(expandedGrade === grade.id ? null : grade.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {expandedGrade === grade.id ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    <CardTitle className="text-base">{grade.name}</CardTitle>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" />{grade.studentCount} students · {grade.classes.length} classes</span>
                  </div>
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openClassDialog(grade.id)}>
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openGradeDialog(grade)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeleteTarget({ type: 'grade', id: grade.id }); setDeleteDialogOpen(true); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {expandedGrade === grade.id && (
                <CardContent className="pt-4">
                  {grade.classes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No classes yet. Click + to add one.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t.classTable.name}</TableHead>
                          <TableHead>{t.classTable.teacher}</TableHead>
                          <TableHead>{t.classTable.students}</TableHead>
                          <TableHead className="w-20">{t.classTable.actions}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {grade.classes.map(cls => (
                          <TableRow key={cls.id}>
                            <TableCell className="font-medium">{cls.name}</TableCell>
                            <TableCell className="text-sm">{cls.teacher}</TableCell>
                            <TableCell className="text-sm">{cls.studentCount}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openClassDialog(grade.id, cls)}>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { setDeleteTarget({ type: 'class', id: cls.id }); setDeleteDialogOpen(true); }}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Grade Dialog */}
      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGrade ? t.editGrade : t.addGrade}</DialogTitle>
            <DialogDescription>Enter the grade details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t.form.gradeName}</Label>
              <Input placeholder={t.form.gradeNamePlaceholder} value={gradeName} onChange={e => setGradeName(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGradeDialogOpen(false)}>{COMMON_TEXT.actions.cancel}</Button>
            <Button onClick={handleSaveGrade}>{COMMON_TEXT.actions.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Class Dialog */}
      <Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingClass ? t.editClass : t.addClass}</DialogTitle>
            <DialogDescription>Enter the class details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t.form.className}</Label>
              <Input placeholder={t.form.classNamePlaceholder} value={className} onChange={e => setClassName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t.form.teacher}</Label>
              <Input placeholder={t.form.teacherPlaceholder} value={classTeacher} onChange={e => setClassTeacher(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClassDialogOpen(false)}>{COMMON_TEXT.actions.cancel}</Button>
            <Button onClick={handleSaveClass}>{COMMON_TEXT.actions.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{COMMON_TEXT.actions.delete}</DialogTitle>
            <DialogDescription>{t.deleteConfirm}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>{COMMON_TEXT.actions.cancel}</Button>
            <Button variant="destructive" onClick={handleDelete}>{COMMON_TEXT.actions.delete}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AppLayout>
  );
};

export default Grades;
