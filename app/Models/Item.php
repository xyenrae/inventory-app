<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Item extends Model
{
    use HasFactory, LogsActivity;

    // Define a custom log name
    const LOG_NAME = 'inventory';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'category_id',
        'room_id',
        'quantity',
        'price',
        'status'
    ];

    /**
     * Get the category of this item.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the room that owns the item.
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * Get custom description for activity log events.
     */
    public function getDescriptionForEvent(string $event)
    {
        return match ($event) {
            'created' => "Created inventory item '{$this->name}'",
            'updated' => "Updated inventory item '{$this->name}'",
            'deleted' => "Deleted inventory item '{$this->name}'",
            default => parent::getDescriptionForEvent($event),
        };
    }

    /**
     * Get the properties to be logged.
     */
    public function getLogProperties(string $event)
    {
        $properties = $this->defaultLogProperties($event);

        if ($this->category) {
            $properties['category_name'] = $this->category->name;
        }

        return $properties;
    }
}
