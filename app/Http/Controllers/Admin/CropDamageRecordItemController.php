<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CropDamageRecord;
use App\Models\CropDamageRecordItem;
use App\Models\DamageType;
use App\Models\Farm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CropDamageRecordItemController extends Controller
{
    /**
     * Store a new crop damage record item.
     */
    public function store(Request $request, CropDamageRecord $cropDamageRecord)
    {
        $validated = $request->validate([
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'farm_id' => 'required|exists:farms,id',
            'commodity_name' => 'required|string|max:255',
            'variety_name' => 'required|string|max:255',
            'damage_type_id' => 'required|exists:damage_types,damage_type_id',
            'damage_severity' => 'required|in:low,medium,high',
            'status' => 'required|in:pending,verified,closed',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo_path'] = $request->file('photo')->store('crop-damage-item-photos', 'public');
        }

        $validated['crop_damage_record_id'] = $cropDamageRecord->crop_damage_record_id;

        CropDamageRecordItem::create($validated);

        return redirect()->back()->with('success', 'Crop damage record item created successfully.');
    }

    /**
     * Update crop damage record item.
     */
    public function update(Request $request, CropDamageRecordItem $cropDamageRecordItem)
    {
        $validated = $request->validate([
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'farm_id' => 'required|exists:farms,id',
            'commodity_name' => 'required|string|max:255',
            'variety_name' => 'required|string|max:255',
            'damage_type_id' => 'required|exists:damage_types,damage_type_id',
            'damage_severity' => 'required|in:low,medium,high',
            'status' => 'required|in:pending,verified,closed',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($request->hasFile('photo')) {
            // Delete old image if exists
            if ($cropDamageRecordItem->photo_path) {
                Storage::disk('public')->delete($cropDamageRecordItem->photo_path);
            }
            
            $validated['photo_path'] = $request->file('photo')->store('crop-damage-item-photos', 'public');
        }

        $cropDamageRecordItem->update($validated);

        return redirect()->back()->with('success', 'Crop damage record item updated successfully.');
    }

    /**
     * Delete crop damage record item.
     */
    public function destroy(CropDamageRecordItem $cropDamageRecordItem)
    {
        // Delete photo if exists
        if ($cropDamageRecordItem->photo_path) {
            Storage::disk('public')->delete($cropDamageRecordItem->photo_path);
        }

        $cropDamageRecordItem->delete();

        return redirect()->back()->with('success', 'Crop damage record item deleted successfully.');
    }
}
