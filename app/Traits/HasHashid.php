<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * @mixin Model
 *
 * @property-read string $hashid
 *
 * @method static \Illuminate\Database\Eloquent\Builder query()
 */
trait HasHashid
{
    public function getHashidAttribute(): string
    {
        $key = $this->getKey();

        if ($key === null) {
            return '';
        }

        return self::encodeId($key);
    }

    public static function encodeId(int|string $id): string
    {
        return app('hashids')->encode($id);
    }

    public static function decodeHashid(string $hashid): ?int
    {
        $decoded = app('hashids')->decode($hashid);

        return ! empty($decoded) ? (int) $decoded[0] : null;
    }

    public static function findByHashid(string $hashid): static
    {
        $id = self::decodeHashid($hashid);

        if (! $id) {
            throw (new ModelNotFoundException)->setModel(static::class);
        }

        return static::query()->findOrFail($id);
    }

    public static function findByHashidOrNull(string $hashid): ?static
    {
        $id = self::decodeHashid($hashid);

        return $id ? static::query()->find($id) : null;
    }

    public function getRouteKey(): string
    {
        return $this->hashid;
    }

    public function getRouteKeyName(): string
    {
        return $this->getKeyName();
    }

    public function resolveRouteBinding($value, $field = null)
    {
        $id = self::decodeHashid((string) $value);

        if (! $id) {
            return null;
        }

        return static::query()->where($this->getKeyName(), $id)->first();
    }

    public function resolveRouteBindingQuery($query, $value, $field = null)
    {
        $id = self::decodeHashid((string) $value);

        if ($id) {
            return $query->where($this->getKeyName(), $id);
        }

        return $query->where($this->getKeyName(), 0);
    }

    public function initializeHasHashid(): void
    {
        $this->appends = array_values(array_unique(array_merge($this->appends, ['hashid'])));
    }

    public function resolveChildRouteBinding($childType, $value, $field)
    {
        return parent::resolveChildRouteBinding($childType, $value, $field);
    }
}
