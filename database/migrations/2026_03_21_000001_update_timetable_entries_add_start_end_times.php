<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('timetable_entries', function (Blueprint $table) {
            $table->foreignId('stream_id')->nullable()->after('grade_class_id')->constrained('streams')->nullOnDelete();
            $table->time('start_time')->nullable()->after('day_of_week');
            $table->time('end_time')->nullable()->after('start_time');
        });

        // Migrate existing data: populate start_time and end_time from time_slot and duration
        $driver = DB::getDriverName();
        if ($driver === 'sqlite') {
            DB::statement("UPDATE timetable_entries SET start_time = time_slot, end_time = time(time_slot, '+' || (duration * 60) || ' seconds') WHERE time_slot IS NOT NULL");
        } else {
            DB::statement("UPDATE timetable_entries SET start_time = time_slot, end_time = ADDTIME(time_slot, SEC_TO_TIME(duration * 60)) WHERE time_slot IS NOT NULL");
        }

        Schema::table('timetable_entries', function (Blueprint $table) {
            $table->time('start_time')->nullable(false)->change();
            $table->time('end_time')->nullable(false)->change();
        });

        // Expand day_of_week enum to include saturday (MySQL only; SQLite ignores enum constraints)
        if ($driver !== 'sqlite') {
            DB::statement("ALTER TABLE timetable_entries MODIFY COLUMN day_of_week ENUM('monday','tuesday','wednesday','thursday','friday','saturday') NOT NULL");
        }
    }

    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver !== 'sqlite') {
            DB::statement("ALTER TABLE timetable_entries MODIFY COLUMN day_of_week ENUM('monday','tuesday','wednesday','thursday','friday') NOT NULL");
        }

        Schema::table('timetable_entries', function (Blueprint $table) {
            $table->dropForeign(['stream_id']);
            $table->dropColumn(['stream_id', 'start_time', 'end_time']);
        });
    }
};
