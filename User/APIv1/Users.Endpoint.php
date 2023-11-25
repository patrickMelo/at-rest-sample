<?php

namespace atREST\User\APIv1;

use atREST\Core;
use atREST\HTTP;
use atREST\API;
use atREST\Modules\Storage;
use atREST\Modules\StorageEndpoint;
use atREST\Modules\SecureEndpointWrapper;
use atREST\Modules\WebUI;
use atREST\User\StorageGroups\Users as UsersGroup;

class Users extends SecureEndpointWrapper
{
    const BypassSecurity = array('PushLogin', 'PushRecoverPassword');
}

class InsecureUsers extends StorageEndpoint
{
    const GroupName         = 'Users';
    const PullProperties    = array('Id', 'Name', 'Email', 'Level', 'Status');
    const PushProperties    = array('Name', 'Email', 'Password', 'Level', 'Status');
    const UpdateProperties  = array('Name', 'Email', 'Password', 'Level', 'Status');
    const SearchProperties  = array('Name', 'Email');

    const CanDelete = false;

    public function Pull(array $requestData, $uniqueID = null)
    {
        $this->CheckAuthenticatedUser();
        return parent::Pull($requestData, $uniqueID);
    }

    protected function AfterPull(array $requestData, $uniqueID, &$pulledData)
    {
        if (empty($uniqueID)) {
            foreach ($pulledData['Items'] as &$currentUser) {
                $currentUser['IsAdmin'] = $currentUser['Level'] == UsersGroup::Admin;
                unset($currentUser['Level']);
            }
            unset($currentUser);
        } else {
            $pulledData['IsAdmin'] = $pulledData['Level'] == UsersGroup::Admin;
            unset($pulledData['Level']);
        }

        return HTTP::OK;
    }

    protected function BeforePush(array &$requestData, array &$allowedProperties)
    {
        $requestData['Level'] = $requestData['IsAdmin'] ? UsersGroup::Admin : UsersGroup::Normal;
        unset($requestData['IsAdmin']);
        $requestData['Password'] = Storage::GenerateID('newuserpassword');
        return HTTP::OK;
    }

    public function Push(array $requestData, $uniqueID = null)
    {
        $this->CheckAuthenticatedUser();
        return parent::Push($requestData, $uniqueID);
    }

    protected function BeforeUpdate(array &$requestData, string $uniqueID, array &$allowedProperties)
    {
        if (isset($requestData['IsAdmin'])) {
            $requestData['Level'] = $requestData['IsAdmin'] ? UsersGroup::Admin : UsersGroup::Normal;
            unset($requestData['IsAdmin']);
        }

        return HTTP::OK;
    }

    protected function AfterUpdate($requestData, $uniqueID)
    {
        $professionalUpdateData = array();

        if (isset($requestData['Name'])) {
            $professionalUpdateData['Name'] = $requestData['Name'];
        }

        if (isset($requestData['Email'])) {
            $professionalUpdateData['Email'] = $requestData['Email'];
        }

        if (count($professionalUpdateData) > 0) {
            $professionalsGroup = $this->GetGroup('Professionals');

            if (!$professionalId = $professionalsGroup->FindOne(array('Id'), array('UserId' => $uniqueID))) {
                return HTTP::OK;
            }

            if (!$professionalsGroup->Update($professionalId['Id'], $professionalUpdateData)) {
                return HTTP::InternalServerError;
            }
        }

        return HTTP::OK;
    }

    public function Update(array $requestData, $uniqueID = null)
    {
        $this->CheckAuthenticatedUser();
        return parent::Update($requestData, $uniqueID);
    }

    public function PushLogin(array $requestData, $uniqueID = null, $submoduleID = null)
    {
        // Authorize the user.

        $userEmail = $uniqueID;
        $loginPassword = API::GetValue('Password');

        if (!$userData = $this->storageGroup->FindOne(array('Id', 'Name', 'Password', 'Level', 'Status'), array('Email' => $userEmail))) {
            return HTTP::Unauthorized;
        }

        if (!$this->storageGroup->Check($userData, 'Password', $loginPassword) || ($userData['Status'] != UsersGroup::Active)) {
            return HTTP::Unauthorized;
        }

        // Generate the authorization token and send it to the client.

        $authorizationModule = Core::Module('Authorization');

        $loginData = array(
            'Token' => $authorizationModule->Authorize($userData['Id']),
            'RefreshAfter' => $authorizationModule->TokenLifetime() - $authorizationModule->RefreshWindow(),
            'RefreshWindow' => $authorizationModule->RefreshWindow(),
            'User' => array(
                'Name' => $userData['Name'],
                'IsAdmin' => $userData['Level'] == UsersGroup::Admin,
            ),
        );

        API::Respond(HTTP::OK, $loginData);
    }

    public function PullRefresh(array $requestData, $uniqueID = null)
    {
        if ($uniqueID != API::MeID) {
            return HTTP::NotFound;
        }

        $authorizationModule = Core::Module('Authorization');

        if (!$newToken = $authorizationModule->Refresh()) {
            return HTTP::Unauthorized;
        }

        $userId = $authorizationModule->AuthorizedID();

        if (!$userData = $this->storageGroup->Pull($userId, array('Id', 'Name', 'Password', 'Level', 'Status'))) {
            return HTTP::Unauthorized;
        }

        $refreshData = array(
            'Token' => $newToken,
            'RefreshAfter' => $authorizationModule->TokenLifetime() - $authorizationModule->RefreshWindow(),
            'RefreshWindow' => $authorizationModule->RefreshWindow(),
            'User' => array(
                'Name' => $userData['Name'],
                'IsAdmin' => $userData['Level'] == UsersGroup::Admin,
            ),
        );

        API::Respond(HTTP::OK, $refreshData);
    }

    public function PullProfile(array $requestData, $uniqueID = null)
    {
        if ($uniqueID != API::MeID) {
            return HTTP::NotFound;
        }

        return parent::Pull($requestData, Core::Module('Authorization')->AuthorizedID());
    }

    public function PushProfile(array $requestData, $uniqueID = null)
    {
        if ($uniqueID != API::MeID) {
            return HTTP::NotFound;
        }

        $userId = Core::Module('Authorization')->AuthorizedID();

        if (!$userData = $this->storageGroup->Pull($userId, array('Id', 'Name', 'Password', 'Level', 'Status'))) {
            return HTTP::Unauthorized;
        }

        $updateData = array();

        // Update Password

        $currentPassword = API::GetValue('Password');
        $newPassword = API::GetValue('NewPassword');

        if (!empty($currentPassword) && !empty($newPassword)) {
            if (!$this->storageGroup->Check($userData, 'Password', $currentPassword) || ($userData['Status'] != UsersGroup::Active)) {
                return HTTP::Unauthorized;
            }

            $updateData['Password'] = $newPassword;
        }

        // Update Profile

        $newName = API::GetValue('Name');

        if (!empty($newName)) {
            $updateData['Name'] = $newName;
        }

        if (count($updateData) > 0) {
            API::Assert($this->storageGroup->Update($userId, $updateData));
        }

        API::Respond(HTTP::OK);
    }

    public function PushRecoverPassword(array $requestData, $uniqueID = null, $submoduleID = null)
    {
        $userEmail = $uniqueID;

        if ($userEmail == API::MeID) {
            return $this->RecoverPasswordStep2(API::GetValue('Token'), API::GetValue('Password'));
        }

        if (!$userData = $this->storageGroup->FindOne(array('Id', 'Name', 'Status'), array('Email' => $userEmail))) {
            return HTTP::NotFound;
        }

        if ($userData['Status'] != UsersGroup::Active) {
            return HTTP::NotFound;
        }

        // Generate, save and send the recovery token.

        $tokenData = null;
        $authorizationModule = Core::Module('Authorization');
        $recoveryToken = $authorizationModule->CreateToken($userData['Id'], $authorizationModule->TokenLifetime(), null, $tokenData);

        if (!$tokensGroup = $this->GetGroup('Tokens')) {
            return HTTP::InternalServerError;
        }

        $tokenData = array(
            'Type' => $tokensGroup::RecoveryToken,
            'Payload' => $recoveryToken,
        );

        if (!$tokenID = $tokensGroup->Push($tokenData)) {
            return HTTP::InternalServerError;
        }

        $emailTemplate = Core::Module('Template');
        $emailTemplate->Load('RecoverPasswordEmail');

        $emailTemplate->Set(array(
            'recoveryLink' => WebUI::URL('login/recover-password/' . $tokenID)
        ));

        $emailSent = Core::Module('Email')
            ->From('at-rest@test.com', 'PHP-at-REST Sample App')
            ->AddRecipient($userEmail, $userData['Name'])
            ->Send('Recover Password', $emailTemplate->Contents());

        API::Respond($emailSent ? HTTP::OK : HTTP::InternalServerError);
    }

    private function RecoverPasswordStep2(string $tokenID, string $newPassword)
    {
        if (!$tokensGroup = $this->GetGroup('Tokens')) {
            return HTTP::InternalServerError;
        }

        if (!$tokenData = $tokensGroup->Pull($tokenID)) {
            return HTTP::Unauthorized;
        }

        $authorizationModule = Core::Module('Authorization');
        $tokenPayload = null;

        if (!$tokenData = $authorizationModule->ValidateToken($tokenData['Payload'], $tokenPayload)) {
            return HTTP::Unauthorized;
        }

        // Token OK, delete token and save new password.

        API::Assert($tokensGroup->Delete($tokenID));
        API::Assert($this->storageGroup->Update($tokenData['ID'], array('Password' => $newPassword)));

        API::Respond(HTTP::OK, array($tokenData, $tokenPayload));
    }

    private function CheckAuthenticatedUser()
    {
        $userId = Core::Module('Authorization')->AuthorizedID();

        if (!$userData = $this->storageGroup->Pull($userId, array('Level'))) {
            API::Respond(HTTP::Unauthorized);
        }

        if ($userData['Level'] != UsersGroup::Admin) {
            API::Respond(HTTP::Unauthorized);
        }
    }
}
