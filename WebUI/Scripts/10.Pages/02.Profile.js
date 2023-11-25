'use strict';

function ProfilePage(parent, authenticationData) {
    let pushChanges = function (data) {
        profileForm.Enable(false);
        profilePasswordForm.Enable(false);

        wuCore.Push('users', {
            submodule: 'profile',
            id: 'me',
            data,
            success: (response) => {
                new wuGlobalMessage('Changes saved successfully');

                if (data.Name) {
                    let authenticationData = wuState.Get('AuthenticationData');

                    authenticationData.User.Name = data.Name;

                    wuState.Set('AuthenticationData', authenticationData, true);
                    wuRouter.Redirect('dashboard/profile');
                } else {
                    profileForm.Enable(true);
                    profilePasswordForm.Enable(true);
                }
            },
            error: (response) => {
                new wuGlobalMessage('Could not save your changes');

                profileForm.Enable(true);
                profilePasswordForm.Enable(true);
            }
        });
    };

    let saveChanges = function (event) {
        event.preventDefault();

        let profileName = document.querySelector('.profileForm input[name="ProfileName"]').value || '';

        pushChanges({
            'Name': profileName,
        });
    };

    let savePasswordChanges = function (event) {
        event.preventDefault();

        let profilePassword = document.querySelector('.profilePasswordForm input[name="ProfilePassword"]').value || '';
        let profileNewPassword = document.querySelector('.profilePasswordForm input[name="ProfileNewPassword"]').value || '';

        pushChanges({
            'Password': profilePassword,
            'NewPassword': profileNewPassword,
        });
    };

    let profilePage = new wuPage(parent, {
        className: 'profilePage',
    });

    new wuTitle(profilePage, {
        title: 'Profile',
    });

    let profileForm = new wuForm(profilePage, {
        className: 'profileForm',
        onSubmit: saveChanges,
    });

    new wuTitle(profilePage, {
        title: 'Change Password',
    });

    let profilePasswordForm = new wuForm(profilePage, {
        className: 'profilePasswordForm',
        onSubmit: savePasswordChanges,
    });

    wuCore.Pull('users', {
        submodule: 'profile',
        id: 'me',
        success: (response) => {
            createForm(response.data);
        },
        error: (response) => {
            new wuGlobalMessage('Could not load your profile data');
        }
    });

    let createForm = function (user) {
        let handleDisabledInputCreate = function (element) {
            element.readOnly = true;
            element.disabled = true;
        }

        new wuNameInput(profileForm, {
            name: 'ProfileName',
            placeholder: 'Name',
            value: user.Name,
            invalidMessage: 'Type your name',
        });

        new wuEmailInput(profileForm, {
            name: 'ProfileEmail',
            placeholder: 'E-mail',
            value: user.Email,
            invalidMessage: 'Type your e-mail',
            events: {
                create: handleDisabledInputCreate,
            }
        });

        new wuButton(profileForm, {
            caption: 'Save Changes',
        });

        new wuPasswordInput(profilePasswordForm, {
            name: 'ProfilePassword',
            placeholder: 'Current Password',
            invalidMessage: 'Type your current password',
        });

        new wuPasswordInput(profilePasswordForm, {
            name: 'ProfileNewPassword',
            placeholder: 'New Password',
            invalidMessage: 'Type your new password',
        });

        new wuPasswordInput(profilePasswordForm, {
            name: 'ProfileConfirmNewPassword',
            placeholder: 'Confirm New Password',
            match: 'ProfileNewPassword',
            invalidMessage: 'The passwords do not match',
        });

        new wuButton(profilePasswordForm, {
            caption: 'Change Password',
        });

        new wuLink(profilePage, {
            className: 'backProfile',
            url: '#dashboard',
            text: 'Back',
        });
    }

    return profilePage;
}

function ProfileRouter(rootComponent) {
    let authenticationData = wuState.Get('AuthenticationData');

    if (authenticationData == null) {
        return wuRouter.Redirect('login');
    }

    return new DashboardPage(rootComponent, {
        authenticationData,
        customPage: ProfilePage,
    });
}
