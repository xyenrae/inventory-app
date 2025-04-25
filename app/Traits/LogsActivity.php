<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

trait LogsActivity
{
    /**
     * Boot the trait.
     */
    protected static function bootLogsActivity()
    {
        static::created(function (Model $model) {
            $model->logActivity('created');
        });

        static::updated(function (Model $model) {
            $model->logActivity('updated');
        });

        static::deleted(function (Model $model) {
            $model->logActivity('deleted');
        });
    }

    /**
     * Log activity for this model.
     */
    public function logActivity(string $event)
    {
        $logName = $this->getLogName();
        $description = $this->getDescriptionForEvent($event);
        $properties = $this->getLogProperties($event);

        ActivityLog::create([
            'log_name' => $logName,
            'description' => $description,
            'subject_type' => get_class($this),
            'subject_id' => $this->getKey(),
            'causer_type' => Auth::user() ? get_class(Auth::user()) : null,
            'causer_id' => Auth::id(),
            'properties' => $properties,
        ]);
    }

    /**
     * Default implementation for getting log name.
     */
    public function getLogName()
    {
        return defined('static::LOG_NAME') ? static::LOG_NAME : strtolower(class_basename($this));
    }

    /**
     * Default description if not overridden in model.
     */
    public function getDescriptionForEvent(string $event)
    {
        return "{$event} " . strtolower(class_basename($this));
    }

    /**
     * Default getter that can be overridden in models.
     */
    public function getLogProperties(string $event)
    {
        return $this->defaultLogProperties($event);
    }

    /**
     * Base/default property builder used internally or by model override.
     */
    protected function defaultLogProperties(string $event)
    {
        $properties = [
            'attributes' => $this->getAttributes(),
        ];

        if ($event === 'updated') {
            $properties['old'] = $this->getOriginal();
        }

        return $properties;
    }

    /**
     * Get all activity logs related to this model.
     */
    public function activities()
    {
        return ActivityLog::where('subject_type', get_class($this))
            ->where('subject_id', $this->getKey())
            ->latest()
            ->get();
    }
}
