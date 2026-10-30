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
        // 1. Suppliers table
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('contact_email')->nullable();
            $table->timestamps();
        });

        // 2. Add role and supplier_id to users table
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('consultant')->after('email'); // 'consultant', 'project_lead', 'purchasing'
            $table->foreignId('supplier_id')->nullable()->after('role')->constrained('suppliers')->nullOnDelete();
        });

        // 3. Purchase Orders table
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

        // 4. Purchase Order Assignments (which consultants are assigned to which order)
        Schema::create('purchase_order_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained('purchase_orders')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['purchase_order_id', 'user_id']);
        });

        // 5. Time Bookings table
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

        // 6. Vacation Blocks table
        Schema::create('vacation_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->string('status')->default('planned'); // planned, approved
            $table->timestamps();

            $table->index(['user_id', 'start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vacation_blocks');
        Schema::dropIfExists('time_bookings');
        Schema::dropIfExists('purchase_order_assignments');
        Schema::dropIfExists('purchase_orders');

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('supplier_id');
            $table->dropColumn('role');
        });

        Schema::dropIfExists('suppliers');
    }
};

