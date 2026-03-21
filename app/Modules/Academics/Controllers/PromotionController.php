<?php

namespace App\Modules\Academics\Controllers;

use App\Http\Controllers\Controller;
use App\Models\PromotionBatch;
use App\Services\Academics\PromotionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PromotionController extends Controller
{
    public function __construct(private readonly PromotionService $promotionService) {}

    /**
     * Display promotion batches for the current school.
     */
    public function index(): Response
    {
        $school  = auth()->user()->school;
        $batches = PromotionBatch::where('tenant_id', $school->id)
            ->withCount('items')
            ->latest()
            ->get();

        return Inertia::render('school/Academics/Promotion/Index', compact('batches'));
    }

    /**
     * Preview what a promotion would look like.
     */
    public function preview(Request $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'from_year' => 'required|integer|min:2000',
            'to_year'   => 'required|integer|gt:from_year',
        ]);

        $school  = auth()->user()->school;
        $preview = $this->promotionService->previewPromotion($school, $validated['from_year'], $validated['to_year']);

        return response()->json(['preview' => $preview]);
    }

    /**
     * Create a new promotion batch.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'from_year' => 'required|integer|min:2000',
            'to_year'   => 'required|integer|gt:from_year',
            'notes'     => 'nullable|string|max:1000',
        ]);

        $school = auth()->user()->school;
        $batch  = $this->promotionService->createBatch(
            $school,
            $validated['from_year'],
            $validated['to_year'],
            $validated['notes'] ?? null
        );

        return redirect()->route('school.academics.promotion.show', $batch->id)
            ->with('success', 'Promotion batch created. Review and execute to apply changes.');
    }

    /**
     * Show a specific promotion batch.
     */
    public function show(int $id): Response
    {
        $school = auth()->user()->school;
        $batch  = PromotionBatch::where('tenant_id', $school->id)
            ->with(['items.student', 'items.fromClass', 'items.toClass'])
            ->findOrFail($id);

        return Inertia::render('school/Academics/Promotion/Show', compact('batch'));
    }

    /**
     * Execute a pending promotion batch.
     */
    public function execute(int $id): RedirectResponse
    {
        $school = auth()->user()->school;
        $batch  = PromotionBatch::where('tenant_id', $school->id)
            ->where('status', 'pending')
            ->findOrFail($id);

        $this->promotionService->executeBatch($batch);

        return redirect()->route('school.academics.promotion.show', $batch->id)
            ->with('success', 'Promotion executed successfully.');
    }

    /**
     * Rollback a completed promotion batch.
     */
    public function rollback(int $id): RedirectResponse
    {
        $school = auth()->user()->school;
        $batch  = PromotionBatch::where('tenant_id', $school->id)
            ->where('status', 'completed')
            ->findOrFail($id);

        $this->promotionService->rollbackBatch($batch);

        return redirect()->route('school.academics.promotion.show', $batch->id)
            ->with('success', 'Promotion rolled back.');
    }
}
