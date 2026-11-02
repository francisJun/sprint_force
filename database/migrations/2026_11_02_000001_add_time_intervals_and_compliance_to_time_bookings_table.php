<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('time_bookings', function (Blueprint $table) {
            $table->time('start_time')->nullable()->after('date');
            $table->time('end_time')->nullable()->after('start_time');
            $table->boolean('requires_compensatory_rest')->default(false)->after('hours');
            $table->boolean('special_authorization')->default(false)->after('requires_compensatory_rest');
            $table->text('statutory_notes')->nullable()->after('rejection_reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('time_bookings', function (Blueprint $table) {
            $table->dropColumn([
                'start_time',
                'end_time',
                'requires_compensatory_rest',
                'special_authorization',
                'statutory_notes',
            ]);
        });
    }
};

