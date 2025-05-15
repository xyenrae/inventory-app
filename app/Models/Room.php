<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    use HasFactory, LogsActivity;

    // Define a custom log name
    const LOG_NAME = 'rooms';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'location',
        'description',
        'status',
    ];

    /**
     * Get the items for the room.
     */
    public function items(): HasMany
    {
        return $this->hasMany(Item::class);
    }

    /**
     * Get custom description for activity log events.
     */
    public function getDescriptionForEvent(string $event)
    {
        return match ($event) {
            'created' => "Created room '{$this->name}'",
            'updated' => "Updated room '{$this->name}'",
            'deleted' => "Deleted room '{$this->name}'",
            default => parent::getDescriptionForEvent($event),
        };
    }

    /**
     * Get the properties to be logged.
     */
    public function getLogProperties(string $event)
    {
        $properties = $this->defaultLogProperties($event);

        $properties['location'] = $this->location;

        return $properties;
    }
}
