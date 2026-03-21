<?php

namespace App\Services\Academics;

use App\Models\Curriculum;
use Illuminate\Support\Facades\DB;

class CurriculumService
{
    public function createCurriculum(array $data): Curriculum
    {
        return DB::transaction(function () use ($data) {
            $curriculum = Curriculum::create([
                'school_id'   => auth()->user()->school_id,
                'name'        => $data['name'],
                'code'        => $data['code'],
                'type'        => $data['type'],
                'description' => $data['description'] ?? null,
                'is_active'   => $data['is_active'] ?? true,
                'settings'    => $data['settings'] ?? null,
            ]);

            if (!empty($data['grade_scales'])) {
                foreach ($data['grade_scales'] as $scale) {
                    $curriculum->gradeScales()->create(array_merge($scale, [
                        'school_id' => auth()->user()->school_id,
                    ]));
                }
            }

            return $curriculum;
        });
    }

    public function buildCurriculumTree(Curriculum $curriculum): array
    {
        return $curriculum->learningAreas()
            ->with(['strands.subStrands.learningOutcomes'])
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($area) => [
                'id'      => $area->id,
                'name'    => $area->name,
                'code'    => $area->code,
                'strands' => $area->strands->map(fn ($strand) => [
                    'id'          => $strand->id,
                    'name'        => $strand->name,
                    'code'        => $strand->code,
                    'sub_strands' => $strand->subStrands->map(fn ($sub) => [
                        'id'       => $sub->id,
                        'name'     => $sub->name,
                        'code'     => $sub->code,
                        'outcomes' => $sub->learningOutcomes->map(fn ($o) => [
                            'id'   => $o->id,
                            'name' => $o->name,
                            'code' => $o->code,
                        ]),
                    ]),
                ]),
            ])
            ->toArray();
    }
}
