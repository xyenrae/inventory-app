<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Category extends Model
{
    use HasFactory, LogsActivity;

    // Define a custom log name
    const LOG_NAME = 'category';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'description',
        'status'
    ];

    /**
     * Get the items in this category.
     */
    public function items()
    {
        return $this->hasMany(Item::class);
    }

    /**
     * Get custom description for activity log events.
     */
    public function getDescriptionForEvent(string $event)
    {
        return match ($event) {
            'created' => "Created category '{$this->name}'",
            'updated' => "Updated category '{$this->name}'",
            'deleted' => "Deleted category '{$this->name}'",
            default => parent::getDescriptionForEvent($event),
        };
    }
}
