<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Grade;
use App\Models\GradeClass;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class StudentController extends Controller
{
    /**
     * Display a listing of students.
     */
    public function index(Request $request): Response
    {
        $school = auth()->user()->school;
        $query = $school->students();

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by grade
        if ($request->has('grade_id') && $request->grade_id) {
            $query->where('grade_id', $request->grade_id);
        }

        // Search by name or admission number
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                  ->orWhere('last_name', 'like', "%{$request->search}%")
                  ->orWhere('admission_number', 'like', "%{$request->search}%");
            });
        }

        $students = $query->with(['grade', 'class'])
            ->latest()
            ->paginate(20)
            ->through(function ($student) {
                return [
                    'id' => $student->id,
                    'admission_number' => $student->admission_number,
                    'full_name' => $student->full_name,
                    'first_name' => $student->first_name,
                    'last_name' => $student->last_name,
                    'grade' => [
                        'id' => $student->grade->id,
                        'name' => $student->grade->name,
                    ],
                    'class' => [
                        'id' => $student->class->id,
                        'name' => $student->class->name,
                    ],
                    'status' => $student->status,
                    'created_at' => $student->created_at->format('M d, Y'),
                ];
            });

        // Get grades for filter dropdown
        $grades = $school->grades()->orderBy('sort_order')->get(['id', 'name']);

        return Inertia::render('school/Students', [
            'students' => $students,
            'grades' => $grades,
            'filters' => $request->only(['status', 'grade_id', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new student.
     */
    public function create(): Response
    {
        $school = auth()->user()->school;
        
        $grades = $school->grades()
            ->with('classes')
            ->orderBy('sort_order')
            ->get()
            ->map(function ($grade) {
                return [
                    'id' => $grade->id,
                    'name' => $grade->name,
                    'classes' => $grade->classes->map(fn($class) => [
                        'id' => $class->id,
                        'name' => $class->name,
                    ]),
                ];
            });

        return Inertia::render('school/StudentCreate', [
            'grades' => $grades,
        ]);
    }

    /**
     * Store a newly created student.
     */
    public function store(Request $request): RedirectResponse
    {
        $school = auth()->user()->school;

        $validated = $request->validate([
            'admission_number' => [
                'required',
                'string',
                'max:50',
                'unique:students,admission_number,NULL,id,school_id,' . $school->id,
            ],
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'grade_id' => 'required|exists:grades,id',
            'class_id' => 'required|exists:grade_classes,id',
            'status' => 'required|in:active,inactive',
        ]);

        $validated['school_id'] = $school->id;

        $student = Student::create($validated);

        return redirect()->route('school.students.show', $student)
            ->with('success', 'Student created successfully.');
    }

    /**
     * Display the specified student.
     */
    public function show(Student $student): Response
    {
        // Ensure student belongs to this school
        if ($student->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this student');
        }

        $student->load([
            'grade',
            'class',
            'parents',
            'invoices' => function ($query) {
                $query->latest()->take(10);
            },
            'paymentTransactions' => function ($query) {
                $query->latest()->take(10);
            },
            'healthProfile',
        ]);

        // Calculate financial summary
        $financialSummary = [
            'total_invoiced' => $student->invoices()->sum('total_amount') / 100,
            'total_paid' => $student->invoices()->sum('paid_amount') / 100,
            'total_balance' => $student->invoices()->whereIn('status', ['sent', 'partial', 'overdue'])->sum('balance') / 100,
        ];

        return Inertia::render('school/StudentDetail', [
            'student' => [
                'id' => $student->id,
                'admission_number' => $student->admission_number,
                'full_name' => $student->full_name,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'grade' => [
                    'id' => $student->grade->id,
                    'name' => $student->grade->name,
                ],
                'class' => [
                    'id' => $student->class->id,
                    'name' => $student->class->name,
                ],
                'status' => $student->status,
                'created_at' => $student->created_at->format('M d, Y'),
            ],
            'parents' => $student->parents->map(fn($parent) => [
                'id' => $parent->id,
                'name' => $parent->name,
                'email' => $parent->email,
                'phone' => $parent->phone,
            ]),
            'recentInvoices' => $student->invoices->map(fn($invoice) => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'total_amount' => $invoice->total_amount / 100,
                'paid_amount' => $invoice->paid_amount / 100,
                'balance' => $invoice->balance / 100,
                'status' => $invoice->status,
                'due_date' => $invoice->due_date->format('M d, Y'),
            ]),
            'recentPayments' => $student->paymentTransactions->map(fn($payment) => [
                'id' => $payment->id,
                'amount' => $payment->amount / 100,
                'provider' => $payment->provider,
                'status' => $payment->status,
                'reference' => $payment->reference,
                'created_at' => $payment->created_at->format('M d, Y'),
            ]),
            'financialSummary' => $financialSummary,
            'hasHealthProfile' => $student->healthProfile !== null,
        ]);
    }

    /**
     * Show the form for editing the specified student.
     */
    public function edit(Student $student): Response
    {
        // Ensure student belongs to this school
        if ($student->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this student');
        }

        $school = auth()->user()->school;
        
        $grades = $school->grades()
            ->with('classes')
            ->orderBy('sort_order')
            ->get()
            ->map(function ($grade) {
                return [
                    'id' => $grade->id,
                    'name' => $grade->name,
                    'classes' => $grade->classes->map(fn($class) => [
                        'id' => $class->id,
                        'name' => $class->name,
                    ]),
                ];
            });

        return Inertia::render('school/StudentEdit', [
            'student' => [
                'id' => $student->id,
                'admission_number' => $student->admission_number,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'grade_id' => $student->grade_id,
                'class_id' => $student->class_id,
                'status' => $student->status,
            ],
            'grades' => $grades,
        ]);
    }

    /**
     * Update the specified student.
     */
    public function update(Request $request, Student $student): RedirectResponse
    {
        // Ensure student belongs to this school
        if ($student->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this student');
        }

        $school = auth()->user()->school;

        $validated = $request->validate([
            'admission_number' => [
                'required',
                'string',
                'max:50',
                'unique:students,admission_number,' . $student->id . ',id,school_id,' . $school->id,
            ],
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'grade_id' => 'required|exists:grades,id',
            'class_id' => 'required|exists:grade_classes,id',
            'status' => 'required|in:active,inactive',
        ]);

        $student->update($validated);

        return redirect()->route('school.students.show', $student)
            ->with('success', 'Student updated successfully.');
    }

    /**
     * Remove the specified student.
     */
    public function destroy(Student $student): RedirectResponse
    {
        // Ensure student belongs to this school
        if ($student->school_id !== auth()->user()->school_id) {
            abort(403, 'Unauthorized access to this student');
        }

        $student->delete();

        return redirect()->route('school.students.index')
            ->with('success', 'Student deleted successfully.');
    }
}
