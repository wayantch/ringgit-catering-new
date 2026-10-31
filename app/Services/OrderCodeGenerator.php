<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;

class OrderCodeGenerator
{
    private const UNIQUE_CODE_MIN = 100;

    private const UNIQUE_CODE_MAX = 999;

    /**
     * Statuses whose transfer codes still need to be matched against incoming payments.
     *
     * @var array<int, string>
     */
    private const UNPAID_STATUSES = ['baru', 'diproses'];

    /**
     * Next per-day sequential order number, e.g. "ORD-20261018-00001".
     *
     * Must run inside a transaction: the row lock on the last number for the day
     * makes concurrent checkouts wait instead of reading the same sequence.
     */
    public function nextOrderNumber(string $prefix, int $sequenceLength): string
    {
        $dayPrefix = $prefix.'-'.now()->format('Ymd').'-';

        $lastOrderNumber = Order::query()
            ->where('order_number', 'like', $dayPrefix.'%')
            ->lockForUpdate()
            ->orderByDesc('order_number')
            ->value('order_number');

        $sequence = $lastOrderNumber === null
            ? 1
            : ((int) substr($lastOrderNumber, strlen($dayPrefix))) + 1;

        return $dayPrefix.str_pad((string) $sequence, $sequenceLength, '0', STR_PAD_LEFT);
    }

    /**
     * Pick a 3-digit transfer code not used by any order that is still awaiting payment.
     *
     * Only unpaid orders are checked: with 900 possible codes, excluding every
     * historical order would eventually leave nothing to pick.
     *
     * @param  array<int, int>  $except
     */
    public function uniqueCode(array $except = []): int
    {
        $usedCodes = Order::query()
            ->whereIn('order_status', self::UNPAID_STATUSES)
            ->get(['unique_code', 'dp_unique_code'])
            ->flatMap(static fn (Order $order): array => [$order->unique_code, $order->dp_unique_code])
            ->merge(Payment::query()->where('status', 'pending')->pluck('unique_code'))
            ->merge($except)
            ->filter()
            ->map(static fn (mixed $code): int => (int) $code)
            ->all();

        $availableCodes = array_values(array_diff(
            range(self::UNIQUE_CODE_MIN, self::UNIQUE_CODE_MAX),
            $usedCodes,
        ));

        if ($availableCodes === []) {
            return random_int(self::UNIQUE_CODE_MIN, self::UNIQUE_CODE_MAX);
        }

        return $availableCodes[random_int(0, count($availableCodes) - 1)];
    }
}
