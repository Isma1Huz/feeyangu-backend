<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFeeStructureRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole(['school_admin', 'super_admin']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'grade_id' => 'required|exists:grades,id',
            'term_id' => 'required|exists:academic_terms,id',
            'status' => 'required|in:active,inactive',
            'items' => 'required|array|min:1',
            'items.*.name' => 'required|string|max:255',
            'items.*.amount' => 'required|numeric|min:0',
        ];
    }

    /**
     * Get custom error messages.
     */
    public function messages(): array
    {
        return [
            'items.min' => 'Fee structure must have at least one item.',
            'grade_id.exists' => 'The selected grade is invalid.',
            'term_id.exists' => 'The selected academic term is invalid.',
        ];
    }

    /**
     * Prepare data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert item amounts to cents
        if ($this->has('items')) {
            $items = collect($this->items)->map(function ($item) {
                return [
                    'name' => $item['name'],
                    'amount' => (int) (($item['amount'] ?? 0) * 100),
                ];
            })->toArray();
            
            $this->merge([
                'items_cents' => $items,
                'total_amount' => collect($items)->sum('amount'),
            ]);
        }
    }
}
