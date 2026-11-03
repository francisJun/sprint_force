<?php

namespace App\Http\Controllers;

use App\Domain\Budget\Services\RunwayForecastService;
use App\Models\PurchaseOrder;
use App\Models\TimeBooking;
use App\Models\VacationBlock;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected RunwayForecastService $runwayService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        // 1. Super Admin Platform Overseer Experience
        if ($user->isSuperAdmin()) {
            $stats = [
                'total_users' => \App\Models\User::count(),
                'role_counts' => [
                    'super_admin' => \App\Models\User::where('role', 'super_admin')->count(),
                    'project_lead' => \App\Models\User::where('role', 'project_lead')->count(),
                    'purchasing' => \App\Models\User::where('role', 'purchasing')->count(),
                    'consultant' => \App\Models\User::where('role', 'consultant')->count(),
                ],
                'total_orders' => PurchaseOrder::count(),
                'active_orders' => PurchaseOrder::where('status', 'active')->count(),
                'total_booked_hours' => round((float) TimeBooking::where('status', 'approved')->sum('hours'), 1),
                'arbzg_notices_count' => TimeBooking::where('requires_compensatory_rest', true)->count(),
                'suppliers_count' => \App\Models\Supplier::count(),
            ];

            return Inertia::render('dashboard', [
                'user' => [
                    'name' => $user->name,
                    'role' => $user->role,
                ],
                'stats' => $stats,
                'orders' => $this->getOrdersWithRunway(),
                'pendingBookings' => $this->getPendingBookings(),
                'recentUsers' => \App\Models\User::with('supplier')->latest()->take(5)->get()->map(fn ($u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => $u->role,
                    'supplier_name' => $u->supplier?->name,
                    'created_at' => $u->created_at?->format('Y-m-d'),
                ]),
            ]);
        }

        // 2. Consultant Experience (Unified single-page workstation)
        if ($user->isConsultant()) {
            $assignedOrders = $user->assignedPurchaseOrders()
                ->where('purchase_orders.status', 'active')
                ->with('supplier')
                ->get()
                ->map(fn ($order) => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'title' => $order->title,
                    'total_person_days' => (float) $order->total_person_days,
                    'remaining_person_days' => $order->remainingPersonDays(),
                    'supplier_name' => $order->supplier->name,
                ]);

            $bookings = TimeBooking::where('user_id', $user->id)
                ->with('purchaseOrder')
                ->orderByDesc('date')
                ->get()
                ->map(fn ($b) => [
                    'id' => $b->id,
                    'date' => $b->date->toDateString(),
                    'hours' => (float) $b->hours,
                    'description' => $b->description,
                    'status' => $b->status,
                    'rejection_reason' => $b->rejection_reason,
                    'order_number' => $b->purchaseOrder->order_number,
                    'order_title' => $b->purchaseOrder->title,
                ]);

            $vacations = VacationBlock::where('user_id', $user->id)
                ->orderByDesc('start_date')
                ->take(10)
                ->get()
                ->map(fn ($v) => [
                    'id' => $v->id,
                    'start_date' => $v->start_date->toDateString(),
                    'end_date' => $v->end_date->toDateString(),
                    'status' => $v->status,
                ]);

            return Inertia::render('dashboard', [
                'user' => [
                    'name' => $user->name,
                    'role' => $user->role,
                ],
                'assignedOrders' => $assignedOrders,
                'bookings' => $bookings,
                'vacations' => $vacations,
            ]);
        }

        // 2. Purchasing Overview Cockpit (Data Minimization: omit consultant personal timesheet details)
        if ($user->isPurchasing()) {
            return Inertia::render('dashboard', [
                'user' => [
                    'name' => $user->name,
                    'role' => $user->role,
                ],
                'orders' => $this->getOrdersWithRunway(),
                'pendingBookings' => [],
            ]);
        }

        // 3. Client Project Lead Overview Cockpit
        return Inertia::render('dashboard', [
            'user' => [
                'name' => $user->name,
                'role' => $user->role,
            ],
            'orders' => $this->getOrdersWithRunway(),
            'pendingBookings' => $this->getPendingBookings(),
        ]);
    }

    /**
     * Dedicated Orders & Runway Burndown View
     */
    public function orders(Request $request): Response
    {
        $user = $request->user();
        if (! $user->isProjectLead() && ! $user->isPurchasing() && ! $user->isSuperAdmin()) {
            abort(403, 'Access denied: Order runway view requires Project Lead, Purchasing, or Super Admin privileges.');
        }

        return Inertia::render('orders/index', [
            'user' => [
                'name' => $user->name,
                'role' => $user->role,
            ],
            'orders' => $this->getOrdersWithRunway(),
        ]);
    }

    /**
     * Dedicated Proof of Work Sign-off & Timesheet Approvals View
     */
    public function approvals(Request $request): Response
    {
        $user = $request->user();
        if (! $user->isProjectLead() && ! $user->isSuperAdmin()) {
            abort(403, 'Access denied: Timesheet approvals view requires Project Lead or Super Admin privileges.');
        }

        return Inertia::render('approvals/index', [
            'user' => [
                'name' => $user->name,
                'role' => $user->role,
            ],
            'pendingBookings' => $this->getPendingBookings(),
            'orders' => $this->getOrdersWithRunway(),
        ]);
    }

    /**
     * Dedicated Purchasing Framework Orders View
     */
    public function purchasingOrders(Request $request): Response
    {
        $user = $request->user();
        if (! $user->isPurchasing() && ! $user->isSuperAdmin()) {
            abort(403, 'Access denied: Framework orders view requires Purchasing or Super Admin privileges.');
        }

        return Inertia::render('purchasing/orders', [
            'user' => [
                'name' => $user->name,
                'role' => $user->role,
            ],
            'orders' => $this->getOrdersWithRunway(),
        ]);
    }

    /**
     * Dedicated Vendor Invoice Reconciliation View
     */
    public function purchasingInvoices(Request $request): Response
    {
        $user = $request->user();
        if (! $user->isPurchasing() && ! $user->isSuperAdmin()) {
            abort(403, 'Access denied: Invoice reconciliation view requires Purchasing or Super Admin privileges.');
        }

        return Inertia::render('purchasing/invoices', [
            'user' => [
                'name' => $user->name,
                'role' => $user->role,
            ],
            'orders' => $this->getOrdersWithRunway(),
        ]);
    }

    private function getOrdersWithRunway()
    {
        return PurchaseOrder::with(['supplier', 'assignedConsultants', 'timeBookings'])
            ->orderBy('order_number')
            ->get()
            ->map(function ($order) {
                $runway = $this->runwayService->calculate($order);

                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'title' => $order->title,
                    'supplier_name' => $order->supplier->name,
                    'total_person_days' => (float) $order->total_person_days,
                    'used_person_days' => $runway['used_person_days'],
                    'remaining_person_days' => $runway['remaining_person_days'],
                    'average_weekly_burn_pd' => $runway['average_weekly_burn_pd'],
                    'forecasted_end_date' => $runway['forecasted_end_date'],
                    'target_end_date' => $runway['target_end_date'],
                    'status_traffic_light' => $runway['status_traffic_light'],
                    'needs_reorder_alert' => $runway['needs_reorder_alert'],
                    'days_until_reorder_deadline' => $runway['days_until_reorder_deadline'],
                    'reorder_deadline_date' => $runway['reorder_deadline_date'],
                    'vacation_days_affecting_runway' => $runway['vacation_days_affecting_runway'],
                    'consultants_count' => $order->assignedConsultants->count(),
                    'start_date' => $order->start_date ? $order->start_date->toDateString() : null,
                    'burndown_series' => $runway['burndown_series'],
                ];
            });
    }

    private function getPendingBookings(bool $anonymize = false)
    {
        return TimeBooking::where('status', 'submitted')
            ->with(['user', 'purchaseOrder'])
            ->orderBy('date')
            ->get()
            ->map(fn ($b) => [
                'id' => $b->id,
                'consultant_name' => $anonymize ? 'Anonymized Consultant' : $b->user->name,
                'order_number' => $b->purchaseOrder->order_number,
                'order_title' => $b->purchaseOrder->title,
                'date' => $b->date->toDateString(),
                'hours' => (float) $b->hours,
                'description' => $anonymize ? '[Anonymized description]' : $b->description,
            ]);
    }
}
