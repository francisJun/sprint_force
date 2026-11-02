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
        Schema::create('time_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained('purchase_orders')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('date');
            $table->decimal('hours', 4, 2); // e.g. 7.50
            $table->text('description');
            $table->string('status')->default('submitted'); // submitted, approved, rejected
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'date']);
            $table->index(['purchase_order_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('time_bookings');
    }
};

