<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InitiatePaymentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole('parent');
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
            'amount' => 'required|numeric|min:1|max:1000000', // Max 1M KES
            'provider' => 'required|in:mpesa,kcb,equity,ncba,coop,absa,stanbic,dtb,im_bank,family_bank',
            'phone_number' => 'required_if:provider,mpesa|nullable|regex:/^254[0-9]{9}$/',
        ];
    }

    /**
     * Get custom error messages.
     */
    public function messages(): array
    {
        return [
            'amount.max' => 'Payment amount cannot exceed 1,000,000 KES.',
            'phone_number.regex' => 'Phone number must be in format 254XXXXXXXXX.',
            'phone_number.required_if' => 'Phone number is required for M-Pesa payments.',
        ];
    }

    /**
     * Prepare data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert amount to cents for storage
        if ($this->has('amount')) {
            $this->merge([
                'amount_cents' => (int) ($this->amount * 100),
            ]);
        }
    }
}
