<?php

namespace App\Http\Controllers\School\Academics;

use App\Http\Controllers\Controller;
use App\Models\AcademicExam;
use App\Models\AcademicSubject;
use App\Models\Curriculum;
use App\Models\GradeClass;
use Inertia\Inertia;

class AcademicsDashboardController extends Controller
{
    public function index()
    {
        $school = auth()->user()->school;

        $stats = [
            'total_curricula' => Curriculum::where('school_id', $school->id)->count(),
            'total_subjects' => AcademicSubject::where('school_id', $school->id)->count(),
            'total_exams' => AcademicExam::where('school_id', $school->id)->count(),
            'active_exams' => AcademicExam::where('school_id', $school->id)
                ->whereIn('status', ['published', 'in_progress'])
                ->count(),
        ];

        $recentExams = AcademicExam::where('school_id', $school->id)
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($e) => [
                'id' => $e->id,
                'name' => $e->name,
                'type' => $e->type,
                'term' => $e->term,
                'year' => $e->year,
                'status' => $e->status,
            ]);

        return Inertia::render('school/academics/Dashboard', [
            'stats' => $stats,
            'recentExams' => $recentExams,
        ]);
    }
}
