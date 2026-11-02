<?php

namespace App\Domain\TimeTracking\Exceptions;

use RuntimeException;

class BookingValidationException extends RuntimeException
{
    public function __construct(
        string $message,
        protected string $ruleIdentifier = 'booking_rule',
        protected ?string $field = null,
        int $code = 422
    ) {
        parent::__construct($message, $code);
    }

    public function getRuleIdentifier(): string
    {
        return $this->ruleIdentifier;
    }

    public function getField(): ?string
    {
        return $this->field;
    }
}

