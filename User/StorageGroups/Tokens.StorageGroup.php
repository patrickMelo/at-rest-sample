<?php

namespace atREST\User\StorageGroups;

use atREST\Modules\StorageGroup;

class Tokens extends StorageGroup {

    // Constants

    const GroupName         = 'Tokens';
    const IDPropertyName    = 'Token';
    const PullProperties    = array('Token', 'Type', 'Payload');

    const RecoveryToken = 1;

    // Protected Methods

    protected function SetUp() {
        $this->AddIntegerRule('Type', true, false, self::RecoveryToken, self::RecoveryToken, self::RecoveryToken);
        $this->AddTextRule('Payload', true, false);
    }
}