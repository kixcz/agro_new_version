<?php

namespace App\Events;

use App\Models\CropDamageRecord;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CropDamageRecordCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $cropDamageRecord;
    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct(CropDamageRecord $cropDamageRecord)
    {
        $this->cropDamageRecord = $cropDamageRecord;
        $this->message = "New crop damage record folder created: {$cropDamageRecord->name}";
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('farmers'),
            new Channel('technicians'),
            new Channel('admin'),
            new Channel('super-admin'),
            new Channel("crop-damage.{$this->cropDamageRecord->crop_damage_record_id}"),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'crop-damage.created';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->cropDamageRecord->crop_damage_record_id,
            'name' => $this->cropDamageRecord->name,
            'recorded_date' => $this->cropDamageRecord->recorded_date,
            'notes' => $this->cropDamageRecord->notes,
            'message' => $this->message,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
