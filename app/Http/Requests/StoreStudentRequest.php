<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStudentRequest extends FormRequest
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
        $schoolId = $this->user()->school_id;
        
        return [
            'admission_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('students')->where(function ($query) use ($schoolId) {
                    return $query->where('school_id', $schoolId);
                }),
            ],
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'grade_id' => 'required|exists:grades,id',
            'class_id' => 'nullable|exists:grade_classes,id',
            'status' => 'required|in:active,inactive',
            'parent_ids' => 'nullable|array',
            'parent_ids.*' => 'exists:users,id',
        ];
    }

    /**
     * Get custom error messages.
     */
    public function messages(): array
    {
        return [
            'admission_number.unique' => 'This admission number is already used in your school.',
            'grade_id.exists' => 'The selected grade is invalid.',
            'class_id.exists' => 'The selected class is invalid.',
        ];
    }
}
