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
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique(); // e.g. 4500012345
            $table->string('title');
            $table->decimal('total_person_days', 8, 2); // e.g. 140.00
            $table->date('start_date');
            $table->date('target_end_date');
            $table->string('status')->default('active'); // active, closed
            $table->foreignId('supplier_id')->constrained('suppliers')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};

