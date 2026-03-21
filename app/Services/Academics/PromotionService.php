<?php

namespace App\Services\Academics;

use App\Models\AcademicClass;
use App\Models\PromotionBatch;
use App\Models\PromotionItem;
use App\Models\School;
use App\Models\Student;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PromotionService
{
    /**
     * Preview which students would be promoted based on batch parameters.
     */
    public function previewPromotion(School $school, int $fromYear, int $toYear): Collection
    {
        $classes = AcademicClass::where('school_id', $school->id)
            ->with(['students', 'nextClass'])
            ->get();

        return $classes->map(function (AcademicClass $class) use ($fromYear, $toYear) {
            return [
                'from_class'    => $class->name,
                'to_class'      => $class->nextClass?->name ?? 'No next class configured',
                'student_count' => $class->students->count(),
                'year_from'     => $fromYear,
                'year_to'       => $toYear,
            ];
        });
    }

    /**
     * Create a promotion batch and generate promotion items for all students.
     */
    public function createBatch(School $school, int $fromYear, int $toYear, ?string $notes = null): PromotionBatch
    {
        return DB::transaction(function () use ($school, $fromYear, $toYear, $notes) {
            $batch = PromotionBatch::create([
                'tenant_id'    => $school->id,
                'from_year'    => $fromYear,
                'to_year'      => $toYear,
                'status'       => 'pending',
                'notes'        => $notes,
                'processed_by' => auth()->id(),
            ]);

            $classes = AcademicClass::where('school_id', $school->id)
                ->with(['students', 'nextClass'])
                ->get();

            foreach ($classes as $class) {
                foreach ($class->students as $student) {
                    PromotionItem::create([
                        'promotion_batch_id' => $batch->id,
                        'student_id'         => $student->id,
                        'from_class_id'      => $class->id,
                        'to_class_id'        => $class->nextClass?->id,
                        'status'             => 'pending',
                    ]);
                }
            }

            return $batch;
        });
    }

    /**
     * Execute a pending promotion batch: move students to their target classes.
     */
    public function executeBatch(PromotionBatch $batch): void
    {
        DB::transaction(function () use ($batch) {
            $items = $batch->items()->where('status', 'pending')->with('student')->get();

            foreach ($items as $item) {
                if ($item->to_class_id) {
                    $item->student->update(['academic_class_id' => $item->to_class_id]);
                    $item->update(['status' => 'completed']);
                } else {
                    $item->update(['status' => 'skipped', 'notes' => 'No target class configured.']);
                }
            }

            $batch->update([
                'status'       => 'completed',
                'processed_at' => now(),
            ]);
        });
    }

    /**
     * Rollback a completed promotion batch.
     */
    public function rollbackBatch(PromotionBatch $batch): void
    {
        DB::transaction(function () use ($batch) {
            $items = $batch->items()->where('status', 'completed')->with('student')->get();

            foreach ($items as $item) {
                if ($item->from_class_id) {
                    $item->student->update(['academic_class_id' => $item->from_class_id]);
                }
                $item->update(['status' => 'rolled_back']);
            }

            $batch->update(['status' => 'rolled_back']);
        });
    }
}
