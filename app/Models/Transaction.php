<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    // Define a custom log name
    const LOG_NAME = 'transaction';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'item_id',
        'user_id',
        'type',
        'quantity',
        'from_room_id',
        'to_room_id',
        'reference_number',
        'notes',
        'transaction_date',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'transaction_date' => 'datetime',
    ];

    /**
     * Get the item associated with the transaction.
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    /**
     * Get the user who performed the transaction.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the source room for the transaction.
     */
    public function fromRoom(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'from_room_id');
    }

    /**
     * Get the destination room for the transaction.
     */
    public function toRoom(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'to_room_id');
    }

    /**
     * Get custom description for activity log events.
     */
    public function getDescriptionForEvent(string $event)
    {
        $type = $this->type === 'in' ? 'added to' : 'removed from';
        $itemName = $this->item ? $this->item->name : 'unknown item';

        return match ($event) {
            'created' => "{$this->quantity} of '{$itemName}' {$type} inventory",
            'updated' => "Updated transaction for '{$itemName}'",
            'deleted' => "Deleted transaction for '{$itemName}'",
            default => parent::getDescriptionForEvent($event),
        };
    }

    /**
     * Get the properties to be logged.
     */
    public function getLogProperties(string $event)
    {
        $properties = $this->defaultLogProperties($event);

        if ($this->item) {
            $properties['item_name'] = $this->item->name;
        }

        if ($this->fromRoom) {
            $properties['from_room_name'] = $this->fromRoom->name;
        }

        if ($this->toRoom) {
            $properties['to_room_name'] = $this->toRoom->name;
        }

        return $properties;
    }
}
