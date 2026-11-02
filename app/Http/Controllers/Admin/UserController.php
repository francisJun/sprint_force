<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\TimeBooking;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of users, platform governance stats, and the permission matrix.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $roleFilter = $request->query('role');

        $usersQuery = User::query()
            ->with('supplier')
            ->when($search, function ($query, $term) {
                $query->where(function ($q) use ($term) {
                    $q->where('name', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%");
                });
            })
            ->when($roleFilter, function ($query, $role) {
                $query->where('role', $role);
            })
            ->orderBy('name');

        $users = $usersQuery->paginate(15)->withQueryString()->through(fn ($u) => [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'role' => $u->role,
            'supplier_id' => $u->supplier_id,
            'supplier_name' => $u->supplier?->name,
            'created_at' => $u->created_at?->format('Y-m-d'),
        ]);

        $roleCounts = [
            'super_admin' => User::where('role', 'super_admin')->count(),
            'project_lead' => User::where('role', 'project_lead')->count(),
            'purchasing' => User::where('role', 'purchasing')->count(),
            'consultant' => User::where('role', 'consultant')->count(),
        ];

        $stats = [
            'total_users' => User::count(),
            'role_counts' => $roleCounts,
            'total_orders' => PurchaseOrder::count(),
            'active_orders' => PurchaseOrder::where('status', 'active')->count(),
            'total_booked_hours' => round((float) TimeBooking::where('status', 'approved')->sum('hours'), 1),
            'arbzg_notices_count' => TimeBooking::where('requires_compensatory_rest', true)->count(),
            'suppliers_count' => Supplier::count(),
        ];

        // Authoritative permissions matrix based on docs/roles-and-privacy.md
        $permissionsMatrix = [
            [
                'action' => 'Manage users, roles & system permissions',
                'super_admin' => true,
                'project_lead' => false,
                'purchasing' => false,
                'consultant' => false,
            ],
            [
                'action' => 'Oversee platform-wide governance metrics',
                'super_admin' => true,
                'project_lead' => false,
                'purchasing' => false,
                'consultant' => false,
            ],
            [
                'action' => 'Approve or reject consultant timesheets',
                'super_admin' => true,
                'project_lead' => true,
                'purchasing' => false,
                'consultant' => false,
            ],
            [
                'action' => 'View un-anonymized names on bookings',
                'super_admin' => true,
                'project_lead' => true,
                'purchasing' => false,
                'consultant' => false,
            ],
            [
                'action' => 'Monitor order burn rates & runway dates',
                'super_admin' => true,
                'project_lead' => true,
                'purchasing' => true,
                'consultant' => false,
            ],
            [
                'action' => 'Trigger follow-up purchase order re-orders',
                'super_admin' => true,
                'project_lead' => true,
                'purchasing' => true,
                'consultant' => false,
            ],
            [
                'action' => 'Book daily working hours (ArbZG validated)',
                'super_admin' => false,
                'project_lead' => false,
                'purchasing' => false,
                'consultant' => true,
            ],
            [
                'action' => 'Record planned consultant vacation blocks',
                'super_admin' => false,
                'project_lead' => false,
                'purchasing' => false,
                'consultant' => true,
            ],
            [
                'action' => 'Access embedded streaming AI assistant',
                'super_admin' => true,
                'project_lead' => true,
                'purchasing' => true,
                'consultant' => true,
            ],
        ];

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => [
                'search' => $search ?? '',
                'role' => $roleFilter ?? '',
            ],
            'stats' => $stats,
            'suppliers' => Supplier::orderBy('name')->get(['id', 'name']),
            'permissionsMatrix' => $permissionsMatrix,
        ]);
    }

    /**
     * Store a newly created user with assigned role and optional supplier.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'string', Rule::in(['super_admin', 'project_lead', 'purchasing', 'consultant'])],
            'supplier_id' => [
                'nullable',
                'integer',
                'exists:suppliers,id',
                Rule::requiredIf(fn () => $request->input('role') === 'consultant'),
            ],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'supplier_id' => $validated['role'] === 'consultant' ? $validated['supplier_id'] : null,
            'email_verified_at' => now(),
        ]);

        return back()->with('success', "User '{$user->name}' created successfully.");
    }

    /**
     * Update an existing user's name, email, role, or supplier.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['required', 'string', Rule::in(['super_admin', 'project_lead', 'purchasing', 'consultant'])],
            'supplier_id' => [
                'nullable',
                'integer',
                'exists:suppliers,id',
                Rule::requiredIf(fn () => $request->input('role') === 'consultant'),
            ],
        ]);

        // Lockout safeguard: Prevent demoting the last Super Admin
        if ($user->isSuperAdmin() && $validated['role'] !== 'super_admin') {
            $superAdminCount = User::where('role', 'super_admin')->count();
            if ($superAdminCount <= 1) {
                return back()->withErrors([
                    'role' => 'Cannot demote the last remaining Super Admin on the platform.',
                ]);
            }
        }

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->role = $validated['role'];
        $user->supplier_id = $validated['role'] === 'consultant' ? $validated['supplier_id'] : null;

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return back()->with('success', "User '{$user->name}' updated successfully.");
    }

    /**
     * Delete a user with safeguard against self-deletion and last Super Admin deletion.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        // Lockout safeguard 1: Cannot delete self
        if ($request->user()->id === $user->id) {
            return back()->withErrors([
                'error' => 'You cannot delete your own account while logged in.',
            ]);
        }

        // Lockout safeguard 2: Cannot delete the last Super Admin
        if ($user->isSuperAdmin()) {
            $superAdminCount = User::where('role', 'super_admin')->count();
            if ($superAdminCount <= 1) {
                return back()->withErrors([
                    'error' => 'Cannot delete the last remaining Super Admin on the platform.',
                ]);
            }
        }

        $userName = $user->name;
        $user->delete();

        return back()->with('success', "User '{$userName}' deleted successfully.");
    }
}

