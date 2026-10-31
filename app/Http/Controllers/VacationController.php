<?php

namespace App\Http\Controllers;

use App\Models\VacationBlock;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class VacationController extends Controller
{
    /**
     * Store a new planned vacation block.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
        ]);

        VacationBlock::create([
            'user_id' => $user->id,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'status' => 'planned',
        ]);

        return back()->with('success', 'Vacation block recorded. Runway forecast updated.');
    }

    /**
     * Delete a vacation block.
     */
    public function destroy(Request $request, VacationBlock $vacationBlock): RedirectResponse
    {
        if ($vacationBlock->user_id !== $request->user()->id && ! $request->user()->isProjectLead()) {
            abort(403);
        }

        $vacationBlock->delete();

        return back()->with('success', 'Vacation block removed.');
    }
}

