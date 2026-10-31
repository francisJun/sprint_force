<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ChatbotController extends Controller
{
    /**
     * Stream responses from the HourRadar AI Assistant (SSE).
     * Works offline out-of-the-box with mock mode enabled by default (AI_MOCK=true).
     */
    public function stream(Request $request): StreamedResponse
    {
        $message = trim((string) $request->input('message', ''));
        $role = $request->user()?->role ?? 'consultant';

        return new StreamedResponse(function () use ($message, $role) {
            // Disable output buffering
            if (ob_get_level()) {
                ob_end_clean();
            }

            header('Content-Type: text/event-stream');
            header('Cache-Control: no-cache');
            header('Connection: keep-alive');
            header('X-Accel-Buffering: no');

            $mockResponse = $this->generateMockResponse($message, $role);
            $words = explode(' ', $mockResponse);

            foreach ($words as $word) {
                echo 'data: '.json_encode(['token' => $word.' '])."\n\n";
                flush();
                usleep(40000); // 40ms stream effect
            }

            echo "data: [DONE]\n\n";
            flush();
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
        ]);
    }

    protected function generateMockResponse(string $question, string $role): string
    {
        $q = strtolower($question);

        if (str_contains($q, 'arbzg') || str_contains($q, 'hours') || str_contains($q, 'limit')) {
            return "According to German Working Time Act (ArbZG § 3), maximum daily working time must not exceed 10 hours. HourRadar enforces this on every submission: if you already booked 8h today, you can log at most 2h more.";
        }

        if (str_contains($q, 'runway') || str_contains($q, 'budget') || str_contains($q, 'reorder')) {
            return "HourRadar calculates the purchase order runway by taking your remaining person-days and stepping forward day-by-day. It skips weekends, German public holidays, and consultant vacation blocks. If the budget exhausts within 4 weeks, an early re-order alert is triggered for Purchasing.";
        }

        if (str_contains($q, 'vacation') || str_contains($q, 'holiday')) {
            return "When consultants log planned vacation blocks, the runway algorithm automatically pauses burn consumption for those days, shifting the forecasted budget depletion date outward by the vacation duration.";
        }

        return "Hello! I am your HourRadar AI Assistant. As a {$role}, you can ask me about purchase order budgets, German ArbZG compliance limits, how to record vacation blocks, or when follow-up orders need to be placed.";
    }
}

