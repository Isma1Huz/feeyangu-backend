<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInvoiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole(['accountant', 'school_admin', 'super_admin']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'student_id' => 'required|exists:students,id',
            'grade' => 'required|string|max:100',
            'term' => 'required|string|max:100',
            'due_date' => 'required|date|after:today',
            'status' => 'required|in:draft,sent,paid,partial,overdue,void',
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
            'due_date.after' => 'Due date must be in the future.',
            'items.min' => 'Invoice must have at least one item.',
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
