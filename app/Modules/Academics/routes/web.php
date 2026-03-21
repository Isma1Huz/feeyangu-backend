<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Academics Module Routes
|--------------------------------------------------------------------------
|
| These routes are loaded by the AcademicsServiceProvider and belong to the
| Academics module. They are prefixed and grouped in the main routes/web.php.
|
*/

Route::middleware(['auth', 'verified', 'role:school_admin|teacher', 'school.access'])
    ->prefix('school/academics')
    ->name('school.academics.')
    ->group(function () {

        // Curriculum
        Route::get('/curricula', [\App\Http\Controllers\School\Academics\CurriculumController::class, 'index'])->name('curricula.index');
        Route::post('/curricula', [\App\Http\Controllers\School\Academics\CurriculumController::class, 'store'])->name('curricula.store');
        Route::put('/curricula/{curriculum}', [\App\Http\Controllers\School\Academics\CurriculumController::class, 'update'])->name('curricula.update');
        Route::delete('/curricula/{curriculum}', [\App\Http\Controllers\School\Academics\CurriculumController::class, 'destroy'])->name('curricula.destroy');

        // Classes
        Route::get('/classes', [\App\Http\Controllers\School\Academics\ClassController::class, 'index'])->name('classes.index');
        Route::post('/classes', [\App\Http\Controllers\School\Academics\ClassController::class, 'store'])->name('classes.store');
        Route::get('/classes/{class}', [\App\Http\Controllers\School\Academics\ClassController::class, 'show'])->name('classes.show');
        Route::put('/classes/{class}', [\App\Http\Controllers\School\Academics\ClassController::class, 'update'])->name('classes.update');
        Route::delete('/classes/{class}', [\App\Http\Controllers\School\Academics\ClassController::class, 'destroy'])->name('classes.destroy');

        // Subjects
        Route::get('/subjects', [\App\Http\Controllers\School\Academics\SubjectController::class, 'index'])->name('subjects.index');
        Route::post('/subjects', [\App\Http\Controllers\School\Academics\SubjectController::class, 'store'])->name('subjects.store');
        Route::put('/subjects/{subject}', [\App\Http\Controllers\School\Academics\SubjectController::class, 'update'])->name('subjects.update');
        Route::delete('/subjects/{subject}', [\App\Http\Controllers\School\Academics\SubjectController::class, 'destroy'])->name('subjects.destroy');

        // Exams
        Route::get('/exams', [\App\Http\Controllers\School\Academics\ExamController::class, 'index'])->name('exams.index');
        Route::post('/exams', [\App\Http\Controllers\School\Academics\ExamController::class, 'store'])->name('exams.store');
        Route::get('/exams/{exam}', [\App\Http\Controllers\School\Academics\ExamController::class, 'show'])->name('exams.show');
        Route::put('/exams/{exam}', [\App\Http\Controllers\School\Academics\ExamController::class, 'update'])->name('exams.update');
        Route::delete('/exams/{exam}', [\App\Http\Controllers\School\Academics\ExamController::class, 'destroy'])->name('exams.destroy');
        Route::post('/exams/{exam}/publish', [\App\Http\Controllers\School\Academics\ExamController::class, 'publish'])->name('exams.publish');

        // Mark Entry
        Route::get('/mark-entry', [\App\Http\Controllers\School\Academics\MarkEntryController::class, 'index'])->name('mark-entry.index');
        Route::post('/mark-entry', [\App\Http\Controllers\School\Academics\MarkEntryController::class, 'store'])->name('mark-entry.store');
        Route::put('/mark-entry/{exam}', [\App\Http\Controllers\School\Academics\MarkEntryController::class, 'update'])->name('mark-entry.update');

        // Timetable
        Route::get('/timetable', [\App\Http\Controllers\School\Academics\TimetableController::class, 'index'])->name('timetable.index');
        Route::post('/timetable', [\App\Http\Controllers\School\Academics\TimetableController::class, 'store'])->name('timetable.store');
        Route::put('/timetable/{entry}', [\App\Http\Controllers\School\Academics\TimetableController::class, 'update'])->name('timetable.update');
        Route::delete('/timetable/{entry}', [\App\Http\Controllers\School\Academics\TimetableController::class, 'destroy'])->name('timetable.destroy');

        // Lesson Plans
        Route::get('/lesson-plans', [\App\Http\Controllers\School\Academics\LessonPlanController::class, 'index'])->name('lesson-plans.index');
        Route::post('/lesson-plans', [\App\Http\Controllers\School\Academics\LessonPlanController::class, 'store'])->name('lesson-plans.store');
        Route::put('/lesson-plans/{plan}', [\App\Http\Controllers\School\Academics\LessonPlanController::class, 'update'])->name('lesson-plans.update');
        Route::delete('/lesson-plans/{plan}', [\App\Http\Controllers\School\Academics\LessonPlanController::class, 'destroy'])->name('lesson-plans.destroy');

        // Grade Scales
        Route::get('/grade-scales', [\App\Http\Controllers\School\Academics\GradeScaleController::class, 'index'])->name('grade-scales.index');
        Route::post('/grade-scales', [\App\Http\Controllers\School\Academics\GradeScaleController::class, 'store'])->name('grade-scales.store');
        Route::put('/grade-scales/{scale}', [\App\Http\Controllers\School\Academics\GradeScaleController::class, 'update'])->name('grade-scales.update');
        Route::delete('/grade-scales/{scale}', [\App\Http\Controllers\School\Academics\GradeScaleController::class, 'destroy'])->name('grade-scales.destroy');
    });
