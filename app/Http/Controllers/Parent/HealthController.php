<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Inertia\Inertia;
use Inertia\Response;

class HealthController extends Controller
{
    /**
     * Display health profile for a specific child.
     */
    public function show(Student $student): Response
    {
        // Verify the parent has access to this student
        if (!auth()->user()->students()->where('students.id', $student->id)->exists()) {
            abort(403, 'Unauthorized access to this student');
        }

        $student->load([
            'grade',
            'class',
            'medicalConditions',
            'allergies',
            'vaccinationRecords',
            'emergencyContacts',
            'healthIncidents',
        ]);

        $healthProfile = [
            'studentId' => (string) $student->id,
            'conditions' => $student->medicalConditions->map(fn ($c) => [
                'id' => (string) $c->id,
                'name' => $c->name,
                'severity' => $c->severity,
                'managementNotes' => $c->management_notes ?? '',
            ]),
            'allergies' => $student->allergies->map(fn ($a) => [
                'id' => (string) $a->id,
                'allergen' => $a->allergen,
                'severity' => $a->severity,
                'reactionType' => $a->reaction_type ?? '',
                'emergencyProtocol' => $a->emergency_protocol ?? '',
                'epiPenAvailable' => (bool) $a->epi_pen_available,
                'epiPenLocation' => $a->epi_pen_location,
            ]),
            'vaccinations' => $student->vaccinationRecords->map(fn ($v) => [
                'id' => (string) $v->id,
                'vaccineName' => $v->vaccine_name,
                'dateAdministered' => $v->date_administered?->format('M d, Y'),
                'status' => $v->status,
            ]),
            'emergencyContacts' => $student->emergencyContacts->map(fn ($ec) => [
                'id' => (string) $ec->id,
                'fullName' => $ec->full_name,
                'relationship' => $ec->relationship,
                'primaryPhone' => $ec->primary_phone,
            ]),
            'incidents' => $student->healthIncidents
                ->where('parent_notified', true)
                ->values()
                ->map(fn ($inc) => [
                    'id' => (string) $inc->id,
                    'type' => $inc->type,
                    'incidentDate' => $inc->incident_date?->format('M d, Y'),
                    'description' => $inc->description ?? '',
                    'actionTaken' => $inc->action_taken ?? '',
                    'parentNotified' => (bool) $inc->parent_notified,
                ]),
        ];

        return Inertia::render('parent/Health', [
            'student' => [
                'id' => (string) $student->id,
                'firstName' => $student->first_name,
                'grade' => $student->grade?->name ?? '',
                'className' => $student->class?->name ?? '',
            ],
            'healthProfile' => $healthProfile,
        ]);
    }
}
