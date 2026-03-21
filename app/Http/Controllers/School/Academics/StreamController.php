<?php

namespace App\Http\Controllers\School\Academics;

use App\Http\Controllers\Controller;
use App\Models\AcademicClass;
use App\Models\Stream;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class StreamController extends Controller
{
    public function store(Request $request, AcademicClass $academicClass): RedirectResponse
    {
        if ($academicClass->school_id !== auth()->user()->school_id) {
            abort(403);
        }

        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'code'     => 'required|string|max:50',
            'capacity' => 'nullable|integer|min:1',
        ]);

        $academicClass->streams()->create($data);

        return redirect()->back()->with('success', 'Stream added.');
    }

    public function update(Request $request, AcademicClass $academicClass, Stream $stream): RedirectResponse
    {
        if ($academicClass->school_id !== auth()->user()->school_id) {
            abort(403);
        }

        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'code'     => 'required|string|max:50',
            'capacity' => 'nullable|integer|min:1',
        ]);

        $stream->update($data);

        return redirect()->back()->with('success', 'Stream updated.');
    }

    public function destroy(AcademicClass $academicClass, Stream $stream): RedirectResponse
    {
        if ($academicClass->school_id !== auth()->user()->school_id) {
            abort(403);
        }

        $stream->delete();

        return redirect()->back()->with('success', 'Stream deleted.');
    }
}
