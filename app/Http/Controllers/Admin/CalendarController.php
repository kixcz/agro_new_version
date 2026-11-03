<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\CropDamageRecord;
use App\Models\CropMonitoringItem;
use App\Models\DistributionRecord;
use App\Models\Task;
use App\Models\TechnicianReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    /**
     * Display the calendar view.
     */
    public function index(Request $request): Response
    {
        $month = $request->get('month', now()->format('Y-m'));
        $startDate = \Carbon\Carbon::parse($month . '-01')->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        // Get all tasks for the month
        $tasks = Task::with(['assignedTo'])
            ->whereBetween('due_date', [$startDate, $endDate])
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'type' => 'task',
                    'task_type' => $task->task_type,
                    'status' => $task->status,
                    'priority' => $task->priority,
                    'date' => $task->due_date->format('Y-m-d'),
                    'start_time' => null,
                    'end_time' => null,
                    'assigned_to' => $task->assignedTo->full_name ?? 'Unassigned',
                    'url' => route('admin.tasks.show', $task->id),
                ];
            });

        // Get technician reports for the month
        $reports = TechnicianReport::with(['technician'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get()
            ->map(function ($report) {
                return [
                    'id' => $report->id,
                    'title' => ucfirst(str_replace('_', ' ', $report->report_type)) . ' Report',
                    'type' => 'report',
                    'report_type' => $report->report_type,
                    'status' => $report->status,
                    'date' => $report->created_at->format('Y-m-d'),
                    'start_time' => $report->evidence_data['activity_started_at'] ?? null,
                    'end_time' => $report->evidence_data['activity_completed_at'] ?? null,
                    'assigned_to' => $report->technician->full_name ?? 'Unknown',
                    'url' => route('admin.technician-reports.show', $report->id),
                ];
            });

        // Combine and sort all events
        $events = $tasks->concat($reports)->sortBy('date')->values();

        // Get statistics for the month
        $stats = [
            'total_tasks' => Task::whereBetween('due_date', [$startDate, $endDate])->count(),
            'completed_tasks' => Task::whereBetween('due_date', [$startDate, $endDate])
                ->where('status', 'verified')
                ->count(),
            'pending_tasks' => Task::whereBetween('due_date', [$startDate, $endDate])
                ->whereIn('status', ['pending', 'assigned', 'in_progress'])
                ->count(),
            'overdue_tasks' => Task::where('due_date', '<', now())
                ->whereIn('status', ['pending', 'assigned', 'in_progress'])
                ->count(),
            'total_reports' => TechnicianReport::whereBetween('created_at', [$startDate, $endDate])->count(),
            'verified_reports' => TechnicianReport::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'verified')
                ->count(),
        ];

        // ── Productivity data ──────────────────────────────────────────
        $tasksInMonth = Task::whereBetween('due_date', [$startDate, $endDate])->get();
        $reportsInMonth = TechnicianReport::whereBetween('created_at', [$startDate, $endDate])->get();

        // Task status distribution
        $taskStatusDist = $tasksInMonth->groupBy('status')->map(fn($g) => $g->count())->map(fn($count, $status) => [
            'name' => ucfirst(str_replace('_', ' ', $status)),
            'count' => $count,
        ])->values()->toArray();

        // Report status distribution
        $reportStatusDist = $reportsInMonth->groupBy('status')->map(fn($g) => $g->count())->map(fn($count, $status) => [
            'name' => ucfirst(str_replace('_', ' ', $status)),
            'count' => $count,
        ])->values()->toArray();

        // Weekly breakdown (4-5 weeks in month)
        $weeklyData = [];
        $weekStart = $startDate->copy();
        $weekNum = 1;
        while ($weekStart->lte($endDate)) {
            $weekEnd = $weekStart->copy()->addDays(6)->min($endDate);
            $weekTasks = Task::whereBetween('due_date', [$weekStart, $weekEnd])->count();
            $weekCompleted = Task::whereBetween('due_date', [$weekStart, $weekEnd])->where('status', 'verified')->count();
            $weekReports = TechnicianReport::whereBetween('created_at', [$weekStart, $weekEnd])->count();
            $weeklyData[] = [
                'name' => "Week {$weekNum}",
                'tasks' => $weekTasks,
                'completed' => $weekCompleted,
                'reports' => $weekReports,
            ];
            $weekStart = $weekEnd->copy()->addDay();
            $weekNum++;
        }

        // Task type distribution
        $taskTypeDist = $tasksInMonth->groupBy('task_type')->map(fn($g) => $g->count())->map(fn($count, $type) => [
            'name' => ucfirst(str_replace('_', ' ', $type ?? 'general')),
            'count' => $count,
        ])->values()->toArray();

        // Daily activity (tasks due per day)
        $dailyActivity = [];
        $dayCursor = $startDate->copy();
        while ($dayCursor->lte($endDate)) {
            $dateStr = $dayCursor->format('Y-m-d');
            $dailyActivity[] = [
                'name' => $dayCursor->format('M d'),
                'count' => Task::where('due_date', $dateStr)->count(),
            ];
            $dayCursor->addDay();
        }

        // Completion rate
        $completionRate = $stats['total_tasks'] > 0
            ? round(($stats['completed_tasks'] / $stats['total_tasks']) * 100)
            : 0;

        // Generate narrative
        $monthLabel = $startDate->format('F Y');
        $narrative = "In {$monthLabel}, ";
        $narrative .= "{$stats['total_tasks']} tasks were scheduled across the month with a {$completionRate}% completion rate. ";
        if ($stats['completed_tasks'] > 0) {
            $narrative .= "{$stats['completed_tasks']} tasks were successfully verified. ";
        }
        if ($stats['overdue_tasks'] > 0) {
            $narrative .= "There are {$stats['overdue_tasks']} overdue tasks requiring attention. ";
        }
        $narrative .= "Technicians filed {$stats['total_reports']} reports, of which {$stats['verified_reports']} were verified.";

        return Inertia::render('admin/calendar', [
            'events' => $events,
            'stats' => $stats,
            'currentMonth' => $month,
            'filters' => $request->only(['type', 'status', 'technician_id']),
            'productivity' => [
                'task_status_dist' => $taskStatusDist,
                'report_status_dist' => $reportStatusDist,
                'weekly_data' => $weeklyData,
                'task_type_dist' => $taskTypeDist,
                'daily_activity' => $dailyActivity,
                'completion_rate' => $completionRate,
                'narrative' => $narrative,
            ],
        ]);
    }

    /**
     * Return all office activities for the quick-access header calendar modal.
     */
    public function events(Request $request): JsonResponse
    {
        $month = $request->get('month', now()->format('Y-m'));
        try {
            $startDate = \Carbon\Carbon::parse($month . '-01')->startOfMonth();
        } catch (\Throwable $e) {
            $startDate = now()->startOfMonth();
            $month = $startDate->format('Y-m');
        }
        $endDate = $startDate->copy()->endOfMonth();

        $events = collect();

        // 1. Scheduled Tasks
        $tasks = Task::with(['assignedTo'])
            ->whereBetween('due_date', [$startDate, $endDate])
            ->get()
            ->map(function ($task) {
                return [
                    'uid' => 'task-' . $task->id,
                    'id' => $task->id,
                    'title' => $task->title,
                    'subtitle' => ucfirst(str_replace('_', ' ', $task->task_type ?? 'Field Task')),
                    'category' => 'task',
                    'category_label' => 'Field Task',
                    'status' => $task->status ?? 'pending',
                    'priority' => $task->priority ?? 'normal',
                    'date' => $task->due_date ? $task->due_date->format('Y-m-d') : now()->format('Y-m-d'),
                    'time' => null,
                    'actor' => $task->assignedTo->full_name ?? 'Unassigned',
                    'url' => '/admin/tasks/' . $task->id,
                ];
            });
        $events = $events->concat($tasks);

        // 2. Technician Reports
        $reports = TechnicianReport::with(['technician'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get()
            ->map(function ($report) {
                return [
                    'uid' => 'report-' . $report->id,
                    'id' => $report->id,
                    'title' => ucfirst(str_replace('_', ' ', $report->report_type ?? 'Field')) . ' Report',
                    'subtitle' => 'Technician Field Submission',
                    'category' => 'report',
                    'category_label' => 'Technician Report',
                    'status' => $report->status ?? 'submitted',
                    'priority' => 'normal',
                    'date' => $report->created_at ? $report->created_at->format('Y-m-d') : now()->format('Y-m-d'),
                    'time' => $report->created_at ? $report->created_at->format('h:i A') : null,
                    'actor' => $report->technician->full_name ?? 'Field Technician',
                    'url' => '/admin/technician-reports/' . $report->id,
                ];
            });
        $events = $events->concat($reports);

        // 3. Distribution Records (Program Allocations / Releases)
        $distributions = DistributionRecord::with(['allocationType'])
            ->whereBetween('release_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->get()
            ->map(function ($dist) {
                return [
                    'uid' => 'distribution-' . $dist->id,
                    'id' => $dist->id,
                    'title' => $dist->distribution_name ?: 'Input Distribution Release',
                    'subtitle' => ($dist->allocationType?->name ?? 'Allocation') . ' • Qty: ' . number_format((float) $dist->total_quantity, 2),
                    'category' => 'distribution',
                    'category_label' => 'Distribution',
                    'status' => 'released',
                    'priority' => 'normal',
                    'date' => $dist->release_date ? $dist->release_date->format('Y-m-d') : now()->format('Y-m-d'),
                    'time' => null,
                    'actor' => ucfirst($dist->source_type ?? 'Office'),
                    'url' => '/admin/distribution-records/' . $dist->id . '/items',
                ];
            });
        $events = $events->concat($distributions);

        // 4. Crop Monitoring Entries
        $monitoringItems = CropMonitoringItem::with(['folder.commodity', 'updater'])
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('observation_date', [$startDate, $endDate])
                  ->orWhere(function ($q2) use ($startDate, $endDate) {
                      $q2->whereNull('observation_date')
                         ->whereBetween('created_at', [$startDate, $endDate]);
                  });
            })
            ->get()
            ->map(function ($item) {
                $obsDate = $item->observation_date ?? $item->created_at;
                $commodityName = $item->folder?->commodity?->name;
                $folderName = $item->folder?->folder_name ?? 'Crop Monitoring';
                return [
                    'uid' => 'monitoring-' . $item->crop_monitoring_item_id,
                    'id' => $item->crop_monitoring_item_id,
                    'title' => $item->item_name ?: 'Crop Monitoring Inspection',
                    'subtitle' => $commodityName ? "{$folderName} ({$commodityName})" : $folderName,
                    'category' => 'monitoring',
                    'category_label' => 'Crop Monitoring',
                    'status' => 'logged',
                    'priority' => 'normal',
                    'date' => $obsDate ? $obsDate->format('Y-m-d') : now()->format('Y-m-d'),
                    'time' => $obsDate ? $obsDate->format('h:i A') : null,
                    'actor' => $item->updater?->full_name ?? 'Office Staff',
                    'url' => $item->folder_id ? '/admin/monitoring-folders/' . $item->folder_id : '/admin/monitoring-folders',
                ];
            });
        $events = $events->concat($monitoringItems);

        // 5. Crop Damage Records
        $damageRecords = CropDamageRecord::withCount('items')
            ->whereBetween('recorded_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->get()
            ->map(function ($dmg) {
                return [
                    'uid' => 'damage-' . $dmg->crop_damage_record_id,
                    'id' => $dmg->crop_damage_record_id,
                    'title' => $dmg->name ?: 'Crop Damage Assessment',
                    'subtitle' => ($dmg->items_count ?? 0) . ' affected farm record(s)',
                    'category' => 'damage',
                    'category_label' => 'Crop Damage',
                    'status' => 'recorded',
                    'priority' => 'high',
                    'date' => $dmg->recorded_date ? $dmg->recorded_date->format('Y-m-d') : now()->format('Y-m-d'),
                    'time' => null,
                    'actor' => 'Damage Assessment Team',
                    'url' => '/admin/crop-damage-records/' . $dmg->crop_damage_record_id,
                ];
            });
        $events = $events->concat($damageRecords);

        // 6. Office Announcements
        $announcements = Announcement::with(['creator'])
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('published_at', [$startDate, $endDate])
                  ->orWhere(function ($q2) use ($startDate, $endDate) {
                      $q2->whereNull('published_at')
                         ->whereBetween('created_at', [$startDate, $endDate]);
                  });
            })
            ->get()
            ->map(function ($ann) {
                $pubDate = $ann->published_at ?? $ann->created_at;
                return [
                    'uid' => 'announcement-' . $ann->id,
                    'id' => $ann->id,
                    'title' => $ann->title,
                    'subtitle' => 'Office Announcement',
                    'category' => 'announcement',
                    'category_label' => 'Announcement',
                    'status' => $ann->is_active ? 'active' : 'archived',
                    'priority' => $ann->priority ?? 'normal',
                    'date' => $pubDate ? $pubDate->format('Y-m-d') : now()->format('Y-m-d'),
                    'time' => $pubDate ? $pubDate->format('h:i A') : null,
                    'actor' => $ann->creator?->full_name ?? 'Admin Office',
                    'url' => '/admin/announcements',
                ];
            });
        $events = $events->concat($announcements);

        $sortedEvents = $events->sortBy([
            ['date', 'asc'],
            ['category', 'asc'],
        ])->values();

        return response()->json([
            'month' => $month,
            'month_label' => $startDate->format('F Y'),
            'events' => $sortedEvents,
            'counts' => [
                'all' => $sortedEvents->count(),
                'task' => $tasks->count(),
                'report' => $reports->count(),
                'distribution' => $distributions->count(),
                'monitoring' => $monitoringItems->count(),
                'damage' => $damageRecords->count(),
                'announcement' => $announcements->count(),
            ],
        ]);
    }
}
