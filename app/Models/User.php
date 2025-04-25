<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes, HasRoles, LogsActivity;

    // Define a custom log name
    const LOG_NAME = 'user';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get all activities caused by the user.
     */
    public function activities()
    {
        return $this->morphMany(ActivityLog::class, 'causer');
    }

    /**
     * Get custom description for activity log events.
     */
    public function getDescriptionForEvent(string $event)
    {
        return match ($event) {
            'created' => "Created user '{$this->name}' ({$this->email})",
            'updated' => "Updated user '{$this->name}' ({$this->email})",
            'deleted' => "Deleted user '{$this->name}' ({$this->email})",
            default => parent::getDescriptionForEvent($event),
        };
    }

    /**
     * Get the properties to be logged.
     */
    public function getLogProperties(string $event)
    {
        $properties = $this->defaultLogProperties($event);

        unset($properties['attributes']['password']);
        unset($properties['old']['password']);

        $properties['roles'] = $this->roles()->pluck('name');

        return $properties;
    }
}
