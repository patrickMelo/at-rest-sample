<?php

namespace atREST\User\StorageGroups;

use atREST\Modules\StorageGroup;

class Users extends StorageGroup
{

    // Constants

    const GroupName         = 'Users';
    const PullProperties    = array('Id', 'Name', 'Email', 'Password', 'Status');
    const DefaultOrder      = array('Name');

    const Inactive  = 0;
    const Active    = 1;

    const Normal   = 0;
    const Admin    = 999;

    // Protected Methods

    protected function SetUp()
    {
        $this->AddTextRule('Name', true, true, null, '/^(.*){3,50}$/i');
        $this->AddTextRule('Email', true, true, null, '/^[a-z][a-z0-9\-\_\.\+]+\@[a-z0-9\-\_\.]+\.[a-z]{2,20}$/i');
        $this->AddTextRule('Password', true, true, null, '/^(.*){8,64}$/');
        $this->AddIntegerRule('Status', true, true, 0, 0, 1);
        $this->AddIntegerRule('Level', true, true, 0, 0, 999);
        $this->AddUnique('Email');
    }

    protected function TransformPropertiesIn(array &$objectProperties)
    {
        if (isset($objectProperties['Password'])) {
            $objectProperties['Password'] = hash('sha512', $objectProperties['Password']);
        }

        return true;
    }

    protected function CheckPassword(array $objectProperties, $checkValue)
    {
        return isset($objectProperties['Password']) ? hash('sha512', $checkValue) == $objectProperties['Password'] : false;
    }
}
