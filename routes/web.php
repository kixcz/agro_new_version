<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('auth/login');
})->name('home');

// Public QR Code Scan Routes (No authentication required)
Route::get('/farmer/profile/{lfid}', [App\Http\Controllers\PublicFarmerProfileController::class, 'show'])->name('public.farmer.profile');
Route::get('/farm/profile/{fid}', [App\Http\Controllers\PublicFarmProfileController::class, 'show'])->name('public.farm.profile');
Route::get('/farm-parcel/profile/{fpid}', [App\Http\Controllers\PublicFarmParcelProfileController::class, 'show'])->name('public.farm-parcel.profile');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function (\Illuminate\Http\Request $request) {
        $user = auth()->user();
        
        // Redirect based on user role
        if ($user->role && $user->role->name === 'super admin') {
            return app(\App\Http\Controllers\Admin\DashboardAnalyticsController::class)->index($request, 'super_admin/dashboard');
        } elseif ($user->role && $user->role->name === 'admin') {
            return app(\App\Http\Controllers\Admin\DashboardAnalyticsController::class)->index($request);
        } elseif ($user->role && $user->role->name === 'farmer') {
            return Inertia::render('farmer/dashboard');
        } else {
            return Inertia::render('technician/dashboard');
        }
    })->name('dashboard');

    // Farmer Login Routes
    Route::get('farmer-login', [App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'showFarmerLogin'])->name('farmer.login');
    Route::post('farmer-login', [App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'farmerLogin'])->name('farmer.login.store');

    // Admin Routes
    Route::prefix('admin')->middleware(['auth', 'audit-log'])->group(function () {
        Route::get('/categories', [App\Http\Controllers\Admin\CategoryController::class, 'index'])->name('admin.categories');
        Route::post('/categories', [App\Http\Controllers\Admin\CategoryController::class, 'store'])->name('admin.categories.store');
        Route::put('/categories/{category}', [App\Http\Controllers\Admin\CategoryController::class, 'update'])->name('admin.categories.update');
        Route::delete('/categories/{category}', [App\Http\Controllers\Admin\CategoryController::class, 'destroy'])->name('admin.categories.destroy');

        Route::get('/commodities', [App\Http\Controllers\Admin\CommodityController::class, 'index'])->name('admin.commodities');
        Route::post('/commodities', [App\Http\Controllers\Admin\CommodityController::class, 'store'])->name('admin.commodities.store');
        Route::put('/commodities/{commodity}', [App\Http\Controllers\Admin\CommodityController::class, 'update'])->name('admin.commodities.update');
        Route::delete('/commodities/{commodity}', [App\Http\Controllers\Admin\CommodityController::class, 'destroy'])->name('admin.commodities.destroy');

        Route::get('/varieties', [App\Http\Controllers\Admin\VarietyController::class, 'index'])->name('admin.varieties');
        Route::post('/varieties', [App\Http\Controllers\Admin\VarietyController::class, 'store'])->name('admin.varieties.store');
        Route::put('/varieties/{variety}', [App\Http\Controllers\Admin\VarietyController::class, 'update'])->name('admin.varieties.update');
        Route::delete('/varieties/{variety}', [App\Http\Controllers\Admin\VarietyController::class, 'destroy'])->name('admin.varieties.destroy');

        // Farmer Routes
        Route::get('/farmers', [App\Http\Controllers\Admin\FarmerController::class, 'index'])->name('admin.farmers');
        Route::get('/farmers/{farmer}', [App\Http\Controllers\Admin\FarmerController::class, 'show'])->name('admin.farmers.show');
        Route::post('/farmers', [App\Http\Controllers\Admin\FarmerController::class, 'store'])->name('admin.farmers.store');
        Route::put('/farmers/{farmer}', [App\Http\Controllers\Admin\FarmerController::class, 'update'])->name('admin.farmers.update');
        Route::delete('/farmers/{farmer}', [App\Http\Controllers\Admin\FarmerController::class, 'destroy'])->name('admin.farmers.destroy');

        // Points Management Routes
        Route::get('/points-management', [App\Http\Controllers\Admin\PointsManagementController::class, 'index'])->name('admin.points-management');
        Route::post('/points/award', [App\Http\Controllers\Admin\PointsManagementController::class, 'awardPoints'])->name('admin.points.award');

        // Point Rules Routes
        Route::get('/point-rules', [App\Http\Controllers\Admin\PointRulesController::class, 'index'])->name('admin.point-rules');
        Route::post('/point-rules', [App\Http\Controllers\Admin\PointRulesController::class, 'store'])->name('admin.point-rules.store');
        Route::put('/point-rules/{pointRule}', [App\Http\Controllers\Admin\PointRulesController::class, 'update'])->name('admin.point-rules.update');
        Route::delete('/point-rules/{pointRule}', [App\Http\Controllers\Admin\PointRulesController::class, 'destroy'])->name('admin.point-rules.destroy');
        Route::post('/point-rules/{pointRule}/toggle', [App\Http\Controllers\Admin\PointRulesController::class, 'toggle'])->name('admin.point-rules.toggle');

        // Reward Redemptions Routes
        Route::get('/reward-redemptions', [App\Http\Controllers\Admin\RewardRedemptionsController::class, 'index'])->name('admin.reward-redemptions');
        Route::get('/reward-redemptions/{rewardRedemption}', [App\Http\Controllers\Admin\RewardRedemptionsController::class, 'show'])->name('admin.reward-redemptions.show');
        Route::post('/reward-redemptions/{rewardRedemption}/approve', [App\Http\Controllers\Admin\RewardRedemptionsController::class, 'approve'])->name('admin.reward-redemptions.approve');
        Route::post('/reward-redemptions/{rewardRedemption}/reject', [App\Http\Controllers\Admin\RewardRedemptionsController::class, 'reject'])->name('admin.reward-redemptions.reject');

        // Activity Log Routes
        Route::get('/activity-log', [App\Http\Controllers\Admin\ActivityLogController::class, 'index'])->name('admin.activity-log');
        Route::get('/activity-log/export', [App\Http\Controllers\Admin\ActivityLogController::class, 'exportCsv'])->name('admin.activity-log.export');

        // Farm Routes
        Route::get('/farms', [App\Http\Controllers\Admin\FarmController::class, 'index'])->name('admin.farms');
        Route::get('/farms/{farm}', [App\Http\Controllers\Admin\FarmController::class, 'show'])->name('admin.farms.show');

        // Program Routes
        Route::get('/programs', [App\Http\Controllers\Admin\ProgramController::class, 'index'])->name('admin.programs');
        Route::post('/programs', [App\Http\Controllers\Admin\ProgramController::class, 'store'])->name('admin.programs.store');
        Route::put('/programs/{program}', [App\Http\Controllers\Admin\ProgramController::class, 'update'])->name('admin.programs.update');
        Route::delete('/programs/{program}', [App\Http\Controllers\Admin\ProgramController::class, 'destroy'])->name('admin.programs.destroy');

        // Funding Source Routes
        Route::get('/funding-sources', [App\Http\Controllers\Admin\FundingSourceController::class, 'index'])->name('admin.funding-sources');
        Route::post('/funding-sources', [App\Http\Controllers\Admin\FundingSourceController::class, 'store'])->name('admin.funding-sources.store');
        Route::put('/funding-sources/{fundingSource}', [App\Http\Controllers\Admin\FundingSourceController::class, 'update'])->name('admin.funding-sources.update');
        Route::delete('/funding-sources/{fundingSource}', [App\Http\Controllers\Admin\FundingSourceController::class, 'destroy'])->name('admin.funding-sources.destroy');

        // Assistance Category Routes
        Route::get('/assistance-categories', [App\Http\Controllers\Admin\AssistanceCategoryController::class, 'index'])->name('admin.assistance-categories');
        Route::get('/assistance-categories/form-data', [App\Http\Controllers\Admin\AssistanceCategoryController::class, 'getFormData'])->name('admin.assistance-categories.form-data');
        Route::post('/assistance-categories', [App\Http\Controllers\Admin\AssistanceCategoryController::class, 'store'])->name('admin.assistance-categories.store');
        Route::put('/assistance-categories/{assistanceCategory}', [App\Http\Controllers\Admin\AssistanceCategoryController::class, 'update'])->name('admin.assistance-categories.update');
        Route::delete('/assistance-categories/{assistanceCategory}', [App\Http\Controllers\Admin\AssistanceCategoryController::class, 'destroy'])->name('admin.assistance-categories.destroy');

        // Eligible Barangays Routes
        Route::get('/eligible-barangays', [App\Http\Controllers\Admin\EligibleBarangayController::class, 'index'])->name('admin.eligible-barangays');
        Route::get('/eligible-barangays/form-data', [App\Http\Controllers\Admin\EligibleBarangayController::class, 'getFormData'])->name('admin.eligible-barangays.form-data');
        Route::post('/eligible-barangays', [App\Http\Controllers\Admin\EligibleBarangayController::class, 'store'])->name('admin.eligible-barangays.store');
        Route::delete('/eligible-barangays/{eligibleBarangay}', [App\Http\Controllers\Admin\EligibleBarangayController::class, 'destroy'])->name('admin.eligible-barangays.destroy');

        // Distribution Records Routes (Master List)
        Route::get('/distribution-records', [App\Http\Controllers\Admin\DistributionRecordController::class, 'index'])->name('admin.distribution-records');
        Route::post('/distribution-records', [App\Http\Controllers\Admin\DistributionRecordController::class, 'store'])->name('admin.distribution-records.store');
        Route::put('/distribution-records/{distributionRecord}', [App\Http\Controllers\Admin\DistributionRecordController::class, 'update'])->name('admin.distribution-records.update');
        Route::delete('/distribution-records/{distributionRecord}', [App\Http\Controllers\Admin\DistributionRecordController::class, 'destroy'])->name('admin.distribution-records.destroy');

        // Distribution Record Items Routes (Detailed List)
        Route::get('/distribution-records/{distributionRecord}/items', [App\Http\Controllers\Admin\DistributionRecordItemController::class, 'index'])->name('admin.distribution-records.items');
        Route::post('/distribution-record-items', [App\Http\Controllers\Admin\DistributionRecordItemController::class, 'store'])->name('admin.distribution-record-items.store');
        Route::put('/distribution-record-items/{distributionRecordItem}', [App\Http\Controllers\Admin\DistributionRecordItemController::class, 'update'])->name('admin.distribution-record-items.update');
        Route::delete('/distribution-record-items/{distributionRecordItem}', [App\Http\Controllers\Admin\DistributionRecordItemController::class, 'destroy'])->name('admin.distribution-record-items.destroy');
        Route::get('/distribution-records/{distributionRecord}/export-csv', [App\Http\Controllers\Admin\DistributionRecordItemController::class, 'exportCsv'])->name('admin.distribution-records.export-csv');

        // Acknowledgements Routes
        Route::post('/acknowledgements', [App\Http\Controllers\Admin\AcknowledgementController::class, 'store'])->name('admin.acknowledgements.store');
        Route::put('/acknowledgements/{acknowledgement}', [App\Http\Controllers\Admin\AcknowledgementController::class, 'update'])->name('admin.acknowledgements.update');
        Route::delete('/acknowledgements/{acknowledgement}', [App\Http\Controllers\Admin\AcknowledgementController::class, 'destroy'])->name('admin.acknowledgements.destroy');

        // Eligibility Rules Routes
        Route::get('/eligibility-rules', [App\Http\Controllers\Admin\EligibilityRuleController::class, 'index'])->name('admin.eligibility-rules');
        Route::get('/eligibility-rules/form-data', [App\Http\Controllers\Admin\EligibilityRuleController::class, 'getFormData'])->name('admin.eligibility-rules.form-data');
        Route::post('/eligibility-rules', [App\Http\Controllers\Admin\EligibilityRuleController::class, 'store'])->name('admin.eligibility-rules.store');
        Route::put('/eligibility-rules/{eligibilityRule}', [App\Http\Controllers\Admin\EligibilityRuleController::class, 'update'])->name('admin.eligibility-rules.update');
        Route::delete('/eligibility-rules/{eligibilityRule}', [App\Http\Controllers\Admin\EligibilityRuleController::class, 'destroy'])->name('admin.eligibility-rules.destroy');

        // Distribution Records Routes
        Route::get('/distribution-records', [App\Http\Controllers\Admin\DistributionRecordController::class, 'index'])->name('admin.distribution-records');
        Route::get('/distribution-records/form-data', [App\Http\Controllers\Admin\DistributionRecordController::class, 'getFormData'])->name('admin.distribution-records.form-data');
        Route::post('/distribution-records', [App\Http\Controllers\Admin\DistributionRecordController::class, 'store'])->name('admin.distribution-records.store');
        Route::put('/distribution-records/{distributionRecord}', [App\Http\Controllers\Admin\DistributionRecordController::class, 'update'])->name('admin.distribution-records.update');
        Route::delete('/distribution-records/{distributionRecord}', [App\Http\Controllers\Admin\DistributionRecordController::class, 'destroy'])->name('admin.distribution-records.destroy');

        // Allocation Policies Routes
        Route::get('/allocation-policies', [App\Http\Controllers\Admin\AllocationPolicyController::class, 'index'])->name('admin.allocation-policies');
        Route::get('/allocation-policies/form-data', [App\Http\Controllers\Admin\AllocationPolicyController::class, 'getFormData'])->name('admin.allocation-policies.form-data');
        Route::post('/allocation-policies', [App\Http\Controllers\Admin\AllocationPolicyController::class, 'store'])->name('admin.allocation-policies.store');
        Route::put('/allocation-policies/{allocationPolicy}', [App\Http\Controllers\Admin\AllocationPolicyController::class, 'update'])->name('admin.allocation-policies.update');
        Route::delete('/allocation-policies/{allocationPolicy}', [App\Http\Controllers\Admin\AllocationPolicyController::class, 'destroy'])->name('admin.allocation-policies.destroy');

        // Organization Routes
        Route::get('/organizations', [App\Http\Controllers\Admin\OrganizationController::class, 'index'])->name('admin.organizations');
        Route::post('/organizations', [App\Http\Controllers\Admin\OrganizationController::class, 'store'])->name('admin.organizations.store');
        Route::put('/organizations/{organization}', [App\Http\Controllers\Admin\OrganizationController::class, 'update'])->name('admin.organizations.update');
        Route::delete('/organizations/{organization}', [App\Http\Controllers\Admin\OrganizationController::class, 'destroy'])->name('admin.organizations.destroy');

        // Damage Category Routes
        Route::get('/damage-categories', [App\Http\Controllers\Admin\DamageCategoryController::class, 'index'])->name('admin.damage-categories');
        Route::post('/damage-categories', [App\Http\Controllers\Admin\DamageCategoryController::class, 'store'])->name('admin.damage-categories.store');
        Route::put('/damage-categories/{damageCategory}', [App\Http\Controllers\Admin\DamageCategoryController::class, 'update'])->name('admin.damage-categories.update');
        Route::delete('/damage-categories/{damageCategory}', [App\Http\Controllers\Admin\DamageCategoryController::class, 'destroy'])->name('admin.damage-categories.destroy');

        // Damage Type Routes
        Route::get('/damage-types', [App\Http\Controllers\Admin\DamageTypeController::class, 'index'])->name('admin.damage-types');
        Route::post('/damage-types', [App\Http\Controllers\Admin\DamageTypeController::class, 'store'])->name('admin.damage-types.store');
        Route::put('/damage-types/{damageType}', [App\Http\Controllers\Admin\DamageTypeController::class, 'update'])->name('admin.damage-types.update');
        Route::delete('/damage-types/{damageType}', [App\Http\Controllers\Admin\DamageTypeController::class, 'destroy'])->name('admin.damage-types.destroy');

        // Crop Damage Records Routes (Folders)
        Route::get('/crop-damage-records', [App\Http\Controllers\Admin\CropDamageRecordController::class, 'index'])->name('admin.crop-damage-records');
        Route::get('/crop-damage-records/{cropDamageRecord}', [App\Http\Controllers\Admin\CropDamageRecordController::class, 'show'])->name('admin.crop-damage-records.show');
        Route::post('/crop-damage-records', [App\Http\Controllers\Admin\CropDamageRecordController::class, 'store'])->name('admin.crop-damage-records.store');
        Route::put('/crop-damage-records/{cropDamageRecord}', [App\Http\Controllers\Admin\CropDamageRecordController::class, 'update'])->name('admin.crop-damage-records.update');
        Route::delete('/crop-damage-records/{cropDamageRecord}', [App\Http\Controllers\Admin\CropDamageRecordController::class, 'destroy'])->name('admin.crop-damage-records.destroy');

        // Crop Damage Record Items Routes (Files inside folders)
        Route::post('/crop-damage-records/{cropDamageRecord}/items', [App\Http\Controllers\Admin\CropDamageRecordItemController::class, 'store'])->name('admin.crop-damage-record-items.store');
        Route::put('/crop-damage-record-items/{cropDamageRecordItem}', [App\Http\Controllers\Admin\CropDamageRecordItemController::class, 'update'])->name('admin.crop-damage-record-items.update');
        Route::delete('/crop-damage-record-items/{cropDamageRecordItem}', [App\Http\Controllers\Admin\CropDamageRecordItemController::class, 'destroy'])->name('admin.crop-damage-record-items.destroy');

        // Crop Monitoring Categories Routes
        Route::get('/monitoring-categories', [App\Http\Controllers\Admin\CropMonitoringCategoryController::class, 'index'])->name('admin.monitoring-categories.index');
        Route::post('/monitoring-categories', [App\Http\Controllers\Admin\CropMonitoringCategoryController::class, 'store'])->name('admin.monitoring-categories.store');
        Route::put('/monitoring-categories/{category}', [App\Http\Controllers\Admin\CropMonitoringCategoryController::class, 'update'])->name('admin.monitoring-categories.update');
        Route::delete('/monitoring-categories/{category}', [App\Http\Controllers\Admin\CropMonitoringCategoryController::class, 'destroy'])->name('admin.monitoring-categories.destroy');

        // Crop Monitoring Folders Routes
        Route::get('/monitoring-folders', [App\Http\Controllers\Admin\CropMonitoringFolderController::class, 'index'])->name('admin.monitoring-folders.index');
        Route::get('/monitoring-folders/{cropMonitoringFolder}', [App\Http\Controllers\Admin\CropMonitoringFolderController::class, 'show'])->name('admin.monitoring-folders.show');
        Route::post('/monitoring-folders', [App\Http\Controllers\Admin\CropMonitoringFolderController::class, 'store'])->name('admin.monitoring-folders.store');
        Route::put('/monitoring-folders/{folder}', [App\Http\Controllers\Admin\CropMonitoringFolderController::class, 'update'])->name('admin.monitoring-folders.update');
        Route::delete('/monitoring-folders/{folder}', [App\Http\Controllers\Admin\CropMonitoringFolderController::class, 'destroy'])->name('admin.monitoring-folders.destroy');

        // Crop Monitoring Items (Timeline Entries) Routes
        Route::post('/monitoring-folders/{folder}/items', [App\Http\Controllers\Admin\CropMonitoringItemController::class, 'store'])->name('admin.monitoring-items.store');
        Route::put('/monitoring-items/{item}', [App\Http\Controllers\Admin\CropMonitoringItemController::class, 'update'])->name('admin.monitoring-items.update');
        Route::delete('/monitoring-items/{item}', [App\Http\Controllers\Admin\CropMonitoringItemController::class, 'destroy'])->name('admin.monitoring-items.destroy');

        // Unit of Measure Routes
        Route::get('/unit-of-measures', [App\Http\Controllers\Admin\UnitOfMeasureController::class, 'index'])->name('admin.unit-of-measures');
        Route::post('/unit-of-measures', [App\Http\Controllers\Admin\UnitOfMeasureController::class, 'store'])->name('admin.unit-of-measures.store');
        Route::put('/unit-of-measures/{unitOfMeasure}', [App\Http\Controllers\Admin\UnitOfMeasureController::class, 'update'])->name('admin.unit-of-measures.update');
        Route::delete('/unit-of-measures/{unitOfMeasure}', [App\Http\Controllers\Admin\UnitOfMeasureController::class, 'destroy'])->name('admin.unit-of-measures.destroy');

        // Allocation Type Routes
        Route::get('/allocation-types', [App\Http\Controllers\Admin\AllocationTypeController::class, 'index'])->name('admin.allocation-types');
        Route::get('/allocation-types/form-data', [App\Http\Controllers\Admin\AllocationTypeController::class, 'getFormData'])->name('admin.allocation-types.form-data');
        Route::post('/allocation-types', [App\Http\Controllers\Admin\AllocationTypeController::class, 'store'])->name('admin.allocation-types.store');
        Route::put('/allocation-types/{allocationType}', [App\Http\Controllers\Admin\AllocationTypeController::class, 'update'])->name('admin.allocation-types.update');
        Route::delete('/allocation-types/{allocationType}', [App\Http\Controllers\Admin\AllocationTypeController::class, 'destroy'])->name('admin.allocation-types.destroy');

        // Farmer Eligibility Routes
        Route::get('/farmer-eligibilities', [App\Http\Controllers\Admin\FarmerEligibilityController::class, 'index'])->name('admin.farmer-eligibilities');
        Route::post('/farmer-eligibilities', [App\Http\Controllers\Admin\FarmerEligibilityController::class, 'store'])->name('admin.farmer-eligibilities.store');
        Route::put('/farmer-eligibilities/{farmerEligibility}', [App\Http\Controllers\Admin\FarmerEligibilityController::class, 'update'])->name('admin.farmer-eligibilities.update');
        Route::delete('/farmer-eligibilities/{farmerEligibility}', [App\Http\Controllers\Admin\FarmerEligibilityController::class, 'destroy'])->name('admin.farmer-eligibilities.destroy');

        // Announcement Routes
        Route::get('/announcements', [App\Http\Controllers\Admin\AnnouncementController::class, 'index'])->name('admin.announcements');
        Route::post('/announcements', [App\Http\Controllers\Admin\AnnouncementController::class, 'store'])->name('admin.announcements.store');
        Route::put('/announcements/{announcement}', [App\Http\Controllers\Admin\AnnouncementController::class, 'update'])->name('admin.announcements.update');
        Route::delete('/announcements/{announcement}', [App\Http\Controllers\Admin\AnnouncementController::class, 'destroy'])->name('admin.announcements.destroy');

        // Calendar Route
        Route::get('/calendar', [App\Http\Controllers\Admin\CalendarController::class, 'index'])->name('admin.calendar');
        Route::get('/calendar/events', [App\Http\Controllers\Admin\CalendarController::class, 'events'])->name('admin.calendar.events');

        // Task Management Routes
        Route::middleware(['permission:tasks.view'])->group(function () {
            Route::get('/tasks', [App\Http\Controllers\Admin\TaskManagementController::class, 'index'])->name('admin.tasks');
            Route::get('/tasks/create', [App\Http\Controllers\Admin\TaskManagementController::class, 'create'])->name('admin.tasks.create');
            Route::post('/tasks', [App\Http\Controllers\Admin\TaskManagementController::class, 'store'])->name('admin.tasks.store');
            Route::get('/tasks/{task}', [App\Http\Controllers\Admin\TaskManagementController::class, 'show'])->name('admin.tasks.show');
            Route::get('/tasks/{task}/edit', [App\Http\Controllers\Admin\TaskManagementController::class, 'edit'])->name('admin.tasks.edit');
            Route::put('/tasks/{task}', [App\Http\Controllers\Admin\TaskManagementController::class, 'update'])->name('admin.tasks.update');
            Route::post('/tasks/{task}/verify', [App\Http\Controllers\Admin\TaskManagementController::class, 'verify'])->name('admin.tasks.verify');
            Route::post('/tasks/{task}/reject', [App\Http\Controllers\Admin\TaskManagementController::class, 'reject'])->name('admin.tasks.reject');
        });

        // Technician Reports Routes
        Route::middleware(['permission:reports.view'])->group(function () {
            Route::get('/technician-reports', [App\Http\Controllers\Admin\TechnicianReportController::class, 'index'])->name('admin.technician-reports');
            Route::get('/technician-reports/analytics', [App\Http\Controllers\Admin\TechnicianReportController::class, 'analytics'])->name('admin.technician-reports.analytics');
            Route::get('/technician-reports/{report}', [App\Http\Controllers\Admin\TechnicianReportController::class, 'show'])->name('admin.technician-reports.show');
            Route::post('/technician-reports/{report}/verify', [App\Http\Controllers\Admin\TechnicianReportController::class, 'verify'])->name('admin.technician-reports.verify');
            Route::post('/technician-reports/{report}/reject', [App\Http\Controllers\Admin\TechnicianReportController::class, 'reject'])->name('admin.technician-reports.reject');
            Route::post('/technician-reports/bulk-verify', [App\Http\Controllers\Admin\TechnicianReportController::class, 'bulkVerify'])->name('admin.technician-reports.bulk-verify');
        });
    });

    // Super Admin Routes
    Route::prefix('super-admin')->middleware(['super-admin', 'audit-log'])->group(function () {
        Route::get('/users', [App\Http\Controllers\SuperAdmin\UserManagementController::class, 'index'])->name('super-admin.users');
        Route::get('/users/{user}', [App\Http\Controllers\SuperAdmin\UserManagementController::class, 'show'])->name('super-admin.users.show');
        Route::post('/users/{user}/status', [App\Http\Controllers\SuperAdmin\UserManagementController::class, 'updateStatus'])->name('super-admin.users.status');
        Route::post('/users', [App\Http\Controllers\SuperAdmin\UserManagementController::class, 'store'])->name('super-admin.users.store');
        Route::put('/users/{user}', [App\Http\Controllers\SuperAdmin\UserManagementController::class, 'update'])->name('super-admin.users.update');
        Route::post('/users/{user}/role', [App\Http\Controllers\SuperAdmin\UserManagementController::class, 'updateRole'])->name('super-admin.users.role');
        Route::post('/users/{user}/territory', [App\Http\Controllers\SuperAdmin\UserManagementController::class, 'assignTerritory'])->name('super-admin.users.territory');
        
        // Role Management Routes (Privilege Management)
        Route::get('/roles', [App\Http\Controllers\SuperAdmin\RoleManagementController::class, 'index'])->name('super-admin.roles');
        Route::get('/roles/create', [App\Http\Controllers\SuperAdmin\RoleManagementController::class, 'create'])->name('super-admin.roles.create');
        Route::post('/roles', [App\Http\Controllers\SuperAdmin\RoleManagementController::class, 'store'])->name('super-admin.roles.store');
        Route::get('/roles/{role}', [App\Http\Controllers\SuperAdmin\RoleManagementController::class, 'show'])->name('super-admin.roles.show');
        Route::get('/roles/{role}/edit', [App\Http\Controllers\SuperAdmin\RoleManagementController::class, 'edit'])->name('super-admin.roles.edit');
        Route::put('/roles/{role}', [App\Http\Controllers\SuperAdmin\RoleManagementController::class, 'update'])->name('super-admin.roles.update');
        Route::delete('/roles/{role}', [App\Http\Controllers\SuperAdmin\RoleManagementController::class, 'destroy'])->name('super-admin.roles.destroy');
        
        // User Privilege Management Routes
        Route::get('/privileges', [App\Http\Controllers\SuperAdmin\PrivilegeManagementController::class, 'index'])->name('super-admin.privileges');
        Route::get('/privileges/{user}', [App\Http\Controllers\SuperAdmin\PrivilegeManagementController::class, 'show'])->name('super-admin.privileges.show');
        Route::post('/privileges/{user}/assign', [App\Http\Controllers\SuperAdmin\PrivilegeManagementController::class, 'assign'])->name('super-admin.privileges.assign');
        Route::post('/privileges/{user}/bulk-assign', [App\Http\Controllers\SuperAdmin\PrivilegeManagementController::class, 'bulkAssign'])->name('super-admin.privileges.bulk-assign');
        Route::delete('/privileges/{user}/{privilege}', [App\Http\Controllers\SuperAdmin\PrivilegeManagementController::class, 'remove'])->name('super-admin.privileges.remove');
        
        // Session Monitoring Routes
        Route::get('/sessions', [App\Http\Controllers\SuperAdmin\SessionController::class, 'index'])->name('super-admin.sessions');
        Route::delete('/sessions/{session}', [App\Http\Controllers\SuperAdmin\SessionController::class, 'destroy'])->name('super-admin.sessions.destroy');
        Route::post('/sessions/user/{userId}/terminate-all', [App\Http\Controllers\SuperAdmin\SessionController::class, 'terminateUserSessions'])->name('super-admin.sessions.terminate-user');
        Route::post('/sessions/terminate-others', [App\Http\Controllers\SuperAdmin\SessionController::class, 'terminateAllOtherSessions'])->name('super-admin.sessions.terminate-others');

        // Crop Library Routes
        Route::get('/categories', [App\Http\Controllers\Admin\CategoryController::class, 'index'])->name('super-admin.categories');
        Route::post('/categories', [App\Http\Controllers\Admin\CategoryController::class, 'store'])->name('super-admin.categories.store');
        Route::put('/categories/{category}', [App\Http\Controllers\Admin\CategoryController::class, 'update'])->name('super-admin.categories.update');
        Route::delete('/categories/{category}', [App\Http\Controllers\Admin\CategoryController::class, 'destroy'])->name('super-admin.categories.destroy');

        Route::get('/commodities', [App\Http\Controllers\Admin\CommodityController::class, 'index'])->name('super-admin.commodities');
        Route::post('/commodities', [App\Http\Controllers\Admin\CommodityController::class, 'store'])->name('super-admin.commodities.store');
        Route::put('/commodities/{commodity}', [App\Http\Controllers\Admin\CommodityController::class, 'update'])->name('super-admin.commodities.update');
        Route::delete('/commodities/{commodity}', [App\Http\Controllers\Admin\CommodityController::class, 'destroy'])->name('super-admin.commodities.destroy');

        Route::get('/varieties', [App\Http\Controllers\Admin\VarietyController::class, 'index'])->name('super-admin.varieties');
        Route::post('/varieties', [App\Http\Controllers\Admin\VarietyController::class, 'store'])->name('super-admin.varieties.store');
        Route::put('/varieties/{variety}', [App\Http\Controllers\Admin\VarietyController::class, 'update'])->name('super-admin.varieties.update');
        Route::delete('/varieties/{variety}', [App\Http\Controllers\Admin\VarietyController::class, 'destroy'])->name('super-admin.varieties.destroy');

        // Programs & Assistance Routes
        Route::get('/programs', [App\Http\Controllers\Admin\ProgramController::class, 'index'])->name('super-admin.programs');
        Route::post('/programs', [App\Http\Controllers\Admin\ProgramController::class, 'store'])->name('super-admin.programs.store');
        Route::put('/programs/{program}', [App\Http\Controllers\Admin\ProgramController::class, 'update'])->name('super-admin.programs.update');
        Route::delete('/programs/{program}', [App\Http\Controllers\Admin\ProgramController::class, 'destroy'])->name('super-admin.programs.destroy');

        Route::get('/funding-sources', [App\Http\Controllers\Admin\FundingSourceController::class, 'index'])->name('super-admin.funding-sources');
        Route::post('/funding-sources', [App\Http\Controllers\Admin\FundingSourceController::class, 'store'])->name('super-admin.funding-sources.store');
        Route::put('/funding-sources/{fundingSource}', [App\Http\Controllers\Admin\FundingSourceController::class, 'update'])->name('super-admin.funding-sources.update');
        Route::delete('/funding-sources/{fundingSource}', [App\Http\Controllers\Admin\FundingSourceController::class, 'destroy'])->name('super-admin.funding-sources.destroy');

        Route::get('/assistance-categories', [App\Http\Controllers\Admin\AssistanceCategoryController::class, 'index'])->name('super-admin.assistance-categories');
        Route::get('/assistance-categories/form-data', [App\Http\Controllers\Admin\AssistanceCategoryController::class, 'getFormData'])->name('super-admin.assistance-categories.form-data');
        Route::post('/assistance-categories', [App\Http\Controllers\Admin\AssistanceCategoryController::class, 'store'])->name('super-admin.assistance-categories.store');
        Route::put('/assistance-categories/{assistanceCategory}', [App\Http\Controllers\Admin\AssistanceCategoryController::class, 'update'])->name('super-admin.assistance-categories.update');
        Route::delete('/assistance-categories/{assistanceCategory}', [App\Http\Controllers\Admin\AssistanceCategoryController::class, 'destroy'])->name('super-admin.assistance-categories.destroy');

        Route::get('/allocation-types', [App\Http\Controllers\Admin\AllocationTypeController::class, 'index'])->name('super-admin.allocation-types');
        Route::get('/allocation-types/form-data', [App\Http\Controllers\Admin\AllocationTypeController::class, 'getFormData'])->name('super-admin.allocation-types.form-data');
        Route::post('/allocation-types', [App\Http\Controllers\Admin\AllocationTypeController::class, 'store'])->name('super-admin.allocation-types.store');
        Route::put('/allocation-types/{allocationType}', [App\Http\Controllers\Admin\AllocationTypeController::class, 'update'])->name('super-admin.allocation-types.update');
        Route::delete('/allocation-types/{allocationType}', [App\Http\Controllers\Admin\AllocationTypeController::class, 'destroy'])->name('super-admin.allocation-types.destroy');

        Route::get('/eligibility-rules', [App\Http\Controllers\Admin\EligibilityRuleController::class, 'index'])->name('super-admin.eligibility-rules');
        Route::get('/eligibility-rules/form-data', [App\Http\Controllers\Admin\EligibilityRuleController::class, 'getFormData'])->name('super-admin.eligibility-rules.form-data');
        Route::post('/eligibility-rules', [App\Http\Controllers\Admin\EligibilityRuleController::class, 'store'])->name('super-admin.eligibility-rules.store');
        Route::put('/eligibility-rules/{eligibilityRule}', [App\Http\Controllers\Admin\EligibilityRuleController::class, 'update'])->name('super-admin.eligibility-rules.update');
        Route::delete('/eligibility-rules/{eligibilityRule}', [App\Http\Controllers\Admin\EligibilityRuleController::class, 'destroy'])->name('super-admin.eligibility-rules.destroy');

        Route::get('/allocation-policies', [App\Http\Controllers\Admin\AllocationPolicyController::class, 'index'])->name('super-admin.allocation-policies');
        Route::get('/allocation-policies/form-data', [App\Http\Controllers\Admin\AllocationPolicyController::class, 'getFormData'])->name('super-admin.allocation-policies.form-data');
        Route::post('/allocation-policies', [App\Http\Controllers\Admin\AllocationPolicyController::class, 'store'])->name('super-admin.allocation-policies.store');
        Route::put('/allocation-policies/{allocationPolicy}', [App\Http\Controllers\Admin\AllocationPolicyController::class, 'update'])->name('super-admin.allocation-policies.update');
        Route::delete('/allocation-policies/{allocationPolicy}', [App\Http\Controllers\Admin\AllocationPolicyController::class, 'destroy'])->name('super-admin.allocation-policies.destroy');

        // Damage Logs Routes
        Route::get('/damage-categories', [App\Http\Controllers\Admin\DamageCategoryController::class, 'index'])->name('super-admin.damage-categories');
        Route::post('/damage-categories', [App\Http\Controllers\Admin\DamageCategoryController::class, 'store'])->name('super-admin.damage-categories.store');
        Route::put('/damage-categories/{damageCategory}', [App\Http\Controllers\Admin\DamageCategoryController::class, 'update'])->name('super-admin.damage-categories.update');
        Route::delete('/damage-categories/{damageCategory}', [App\Http\Controllers\Admin\DamageCategoryController::class, 'destroy'])->name('super-admin.damage-categories.destroy');

        Route::get('/damage-types', [App\Http\Controllers\Admin\DamageTypeController::class, 'index'])->name('super-admin.damage-types');
        Route::post('/damage-types', [App\Http\Controllers\Admin\DamageTypeController::class, 'store'])->name('super-admin.damage-types.store');
        Route::put('/damage-types/{damageType}', [App\Http\Controllers\Admin\DamageTypeController::class, 'update'])->name('super-admin.damage-types.update');
        Route::delete('/damage-types/{damageType}', [App\Http\Controllers\Admin\DamageTypeController::class, 'destroy'])->name('super-admin.damage-types.destroy');

        // Crop Monitoring Routes
        Route::get('/monitoring-categories', [App\Http\Controllers\Admin\CropMonitoringCategoryController::class, 'index'])->name('super-admin.monitoring-categories');
        Route::post('/monitoring-categories', [App\Http\Controllers\Admin\CropMonitoringCategoryController::class, 'store'])->name('super-admin.monitoring-categories.store');
        Route::put('/monitoring-categories/{category}', [App\Http\Controllers\Admin\CropMonitoringCategoryController::class, 'update'])->name('super-admin.monitoring-categories.update');
        Route::delete('/monitoring-categories/{category}', [App\Http\Controllers\Admin\CropMonitoringCategoryController::class, 'destroy'])->name('super-admin.monitoring-categories.destroy');

        // Supporting Infrastructure Routes
        Route::get('/organizations', [App\Http\Controllers\Admin\OrganizationController::class, 'index'])->name('super-admin.organizations');
        Route::post('/organizations', [App\Http\Controllers\Admin\OrganizationController::class, 'store'])->name('super-admin.organizations.store');
        Route::put('/organizations/{organization}', [App\Http\Controllers\Admin\OrganizationController::class, 'update'])->name('super-admin.organizations.update');
        Route::delete('/organizations/{organization}', [App\Http\Controllers\Admin\OrganizationController::class, 'destroy'])->name('super-admin.organizations.destroy');

        Route::get('/unit-of-measures', [App\Http\Controllers\Admin\UnitOfMeasureController::class, 'index'])->name('super-admin.unit-of-measures');
        Route::post('/unit-of-measures', [App\Http\Controllers\Admin\UnitOfMeasureController::class, 'store'])->name('super-admin.unit-of-measures.store');
        Route::put('/unit-of-measures/{unitOfMeasure}', [App\Http\Controllers\Admin\UnitOfMeasureController::class, 'update'])->name('super-admin.unit-of-measures.update');
        Route::delete('/unit-of-measures/{unitOfMeasure}', [App\Http\Controllers\Admin\UnitOfMeasureController::class, 'destroy'])->name('super-admin.unit-of-measures.destroy');

        Route::get('/farmer-eligibilities', [App\Http\Controllers\Admin\FarmerEligibilityController::class, 'index'])->name('super-admin.farmer-eligibilities');
        Route::post('/farmer-eligibilities', [App\Http\Controllers\Admin\FarmerEligibilityController::class, 'store'])->name('super-admin.farmer-eligibilities.store');
        Route::put('/farmer-eligibilities/{farmerEligibility}', [App\Http\Controllers\Admin\FarmerEligibilityController::class, 'update'])->name('super-admin.farmer-eligibilities.update');
        Route::delete('/farmer-eligibilities/{farmerEligibility}', [App\Http\Controllers\Admin\FarmerEligibilityController::class, 'destroy'])->name('super-admin.farmer-eligibilities.destroy');

        // Formula Types Routes
        Route::get('/formula-types', [App\Http\Controllers\SuperAdmin\FormulaTypeController::class, 'index'])->name('super-admin.formula-types');
        Route::post('/formula-types', [App\Http\Controllers\SuperAdmin\FormulaTypeController::class, 'store'])->name('super-admin.formula-types.store');
        Route::put('/formula-types/{formulaType}', [App\Http\Controllers\SuperAdmin\FormulaTypeController::class, 'update'])->name('super-admin.formula-types.update');
        Route::delete('/formula-types/{formulaType}', [App\Http\Controllers\SuperAdmin\FormulaTypeController::class, 'destroy'])->name('super-admin.formula-types.destroy');

        // Audit Logs Routes
        Route::get('/audit-logs', [App\Http\Controllers\SuperAdmin\AuditLogController::class, 'index'])->name('super-admin.audit-logs');
        Route::get('/audit-logs/{auditLog}', [App\Http\Controllers\SuperAdmin\AuditLogController::class, 'show'])->name('super-admin.audit-logs.show');
    });

    // Farmer Routes
    Route::prefix('farmer')->middleware('farmer')->group(function () {
        Route::get('/dashboard', [App\Http\Controllers\Farmer\FarmerDashboardController::class, 'index'])->name('farmer.dashboard');
        Route::get('/profile', [App\Http\Controllers\Farmer\FarmerProfileController::class, 'show'])->name('farmer.profile');
        Route::get('/farms', [App\Http\Controllers\Farmer\FarmerFarmController::class, 'index'])->name('farmer.farms');
        Route::get('/farms/{farm}', [App\Http\Controllers\Farmer\FarmerFarmController::class, 'show'])->name('farmer.farms.show');
        
        // Crop Damage Reports
        Route::get('/crop-damage', [App\Http\Controllers\Farmer\FarmerCropDamageController::class, 'index'])->name('farmer.crop-damage');
        Route::post('/crop-damage', [App\Http\Controllers\Farmer\FarmerCropDamageController::class, 'store'])->name('farmer.crop-damage.store');
        Route::get('/crop-damage/{cropDamage}', [App\Http\Controllers\Farmer\FarmerCropDamageController::class, 'show'])->name('farmer.crop-damage.show');
        
        // Allocations
        Route::get('/allocations', [App\Http\Controllers\Farmer\FarmerAllocationController::class, 'index'])->name('farmer.allocations');
        Route::get('/allocations/eligible', [App\Http\Controllers\Farmer\FarmerAllocationController::class, 'eligible'])->name('farmer.allocations.eligible');
        
        // Announcements
        Route::get('/announcements', [App\Http\Controllers\Farmer\FarmerAnnouncementController::class, 'index'])->name('farmer.announcements');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
