<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\HealthUpdateRequest;
use App\Models\Student;
use Inertia\Inertia;
use Inertia\Response;

class HealthController extends Controller
{
    /**
     * Display health profiles overview for all students in the school.
     */
    public function index(): Response
    {
        $school = auth()->user()->school;

        if (!$school) {
            abort(403, 'No school assigned to user');
        }

        $students = $school->students()
            ->with([
                'studentHealthProfile',
                'medicalConditions',
                'allergies',
                'vaccinationRecords',
                'healthIncidents',
                'emergencyContacts',
                'grade',
                'class',
            ])
            ->get();

        $healthProfiles = $students->map(function (Student $student) {
            $hp = $student->studentHealthProfile;

            return [
                'id'        => $hp ? (string) $hp->id : null,
                'studentId' => (string) $student->id,
                'bloodType' => $hp?->blood_type ?? '',
                'conditions' => $student->medicalConditions->map(fn($c) => [
                    'id'       => (string) $c->id,
                    'name'     => $c->name,
                    'type'     => $c->type,
                    'severity' => $c->severity,
                    'status'   => $c->status,
                ])->toArray(),
                'allergies' => $student->allergies->map(fn($a) => [
                    'id'       => (string) $a->id,
                    'allergen' => $a->allergen,
                    'severity' => $a->severity,
                ])->toArray(),
                'vaccinations' => $student->vaccinationRecords->map(fn($v) => [
                    'id'     => (string) $v->id,
                    'name'   => $v->vaccine_name,
                    'status' => $v->status,
                ])->toArray(),
                'incidents' => $student->healthIncidents->map(fn($i) => [
                    'id'   => (string) $i->id,
                    'type' => $i->type,
                    'date' => $i->incident_date->format('Y-m-d'),
                ])->toArray(),
            ];
        });

        $studentList = $students->map(fn($s) => [
            'id'        => (string) $s->id,
            'firstName' => $s->first_name,
            'lastName'  => $s->last_name,
            'grade'     => $s->grade?->name ?? '',
            'className' => $s->class?->name ?? '',
        ]);

        $updateRequests = HealthUpdateRequest::whereIn('student_id', $students->pluck('id'))
            ->with(['student:id,first_name,last_name', 'parent:id,name'])
            ->orderByDesc('submitted_at')
            ->get()
            ->map(fn($req) => [
                'id'                => (string) $req->id,
                'studentId'         => (string) $req->student_id,
                'parentId'          => (string) $req->parent_id,
                'updateDescription' => $req->update_description,
                'status'            => $req->status,
                'submittedAt'       => $req->submitted_at?->toISOString(),
            ]);

        return Inertia::render('school/Health', [
            'healthProfiles' => $healthProfiles,
            'students'       => $studentList,
            'updateRequests' => $updateRequests,
        ]);
    }
}
