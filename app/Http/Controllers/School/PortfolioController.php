<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    /**
     * Display the portfolio overview for the school.
     * Portfolio data model is not yet implemented — returns empty scaffold.
     */
    public function index(): Response
    {
        $school = auth()->user()->school;

        if (!$school) {
            abort(403, 'No school assigned to user');
        }

        // Provide class list so the frontend can render the "By Class" tab
        $classes = $school->grades()
            ->with('gradeClasses:id,grade_id,name')
            ->get()
            ->flatMap(fn($grade) => $grade->gradeClasses->map(fn($cls) => [
                'id'                  => (string) $cls->id,
                'grade'               => $grade->name,
                'name'                => $cls->name,
                'portfolioCompletion' => 0,
            ]));

        return Inertia::render('school/Portfolio', [
            'portfolios' => [],
            'classes'    => $classes->values(),
        ]);
    }
}
