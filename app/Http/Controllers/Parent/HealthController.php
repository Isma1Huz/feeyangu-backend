<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Inertia\Inertia;
use Inertia\Response;

class HealthController extends Controller
{
    /**
     * Display a student's health profile for a linked parent.
     */
    public function show(Student $student): Response
    {
        $parent = auth()->user();

        // Verify the parent is linked to this student
        $linked = $parent->students()->where('students.id', $student->id)->exists();
        if (!$linked) {
            abort(403, 'You are not linked to this student');
        }

        $student->load([
            'studentHealthProfile',
            'medicalConditions',
            'allergies',
            'vaccinationRecords',
            'healthIncidents',
            'emergencyContacts',
            'grade',
            'class',
        ]);

        $hp = $student->studentHealthProfile;

        $healthProfile = [
            'id'        => $hp ? (string) $hp->id : null,
            'studentId' => (string) $student->id,
            'bloodType' => $hp?->blood_type ?? '',
            'generalHealthStatus' => $hp?->general_health_status ?? '',
            'conditions' => $student->medicalConditions->map(fn($c) => [
                'id'                  => (string) $c->id,
                'name'                => $c->name,
                'type'                => $c->type,
                'severity'            => $c->severity,
                'diagnosedDate'       => $c->diagnosed_date?->format('Y-m-d'),
                'treatingDoctor'      => $c->treating_doctor ?? '',
                'managementNotes'     => $c->management_notes ?? '',
                'emergencyActionPlan' => $c->emergency_action_plan ?? '',
                'status'              => $c->status,
            ])->toArray(),
            'allergies' => $student->allergies->map(fn($a) => [
                'id'               => (string) $a->id,
                'allergen'         => $a->allergen,
                'allergenCategory' => $a->allergen_category ?? '',
                'reactionType'     => $a->reaction_type ?? '',
                'severity'         => $a->severity,
                'emergencyProtocol'=> $a->emergency_protocol ?? '',
                'epiPenAvailable'  => (bool) $a->epi_pen_available,
                'epiPenLocation'   => $a->epi_pen_location ?? '',
            ])->toArray(),
            'vaccinations' => $student->vaccinationRecords->map(fn($v) => [
                'id'               => (string) $v->id,
                'vaccineName'      => $v->vaccine_name,
                'dateAdministered' => $v->date_administered?->format('Y-m-d'),
                'nextDueDate'      => $v->next_due_date?->format('Y-m-d'),
                'status'           => $v->status,
            ])->toArray(),
            'incidents' => $student->healthIncidents->map(fn($i) => [
                'id'           => (string) $i->id,
                'incidentDate' => $i->incident_date->format('Y-m-d'),
                'type'         => $i->type,
                'description'  => $i->description,
                'actionTaken'  => $i->action_taken ?? '',
            ])->toArray(),
            'emergencyContacts' => $student->emergencyContacts->map(fn($c) => [
                'id'           => (string) $c->id,
                'fullName'     => $c->full_name,
                'relationship' => $c->relationship,
                'primaryPhone' => $c->primary_phone,
                'priority'     => $c->priority,
            ])->toArray(),
        ];

        $studentData = [
            'id'        => (string) $student->id,
            'firstName' => $student->first_name,
            'lastName'  => $student->last_name,
            'grade'     => $student->grade?->name ?? '',
            'className' => $student->class?->name ?? '',
        ];

        return Inertia::render('parent/Health', [
            'student'       => $studentData,
            'healthProfile' => $healthProfile,
        ]);
    }
}
