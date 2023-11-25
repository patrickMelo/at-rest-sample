'use strict';

function SetRefreshTimeout(refreshAfter) {
    wuState.Set('RefreshTimeout', window.setTimeout(() => {
        wuCore.Pull('users', {
            submodule: 'refresh',
            id: 'me',
            success: HandleLoginSuccess,
            error: (response) => {
                wuState.Unset('AuthenticationData', true);
                new wuGlobalMessage('Sua sessão expirou');
                wuRouter.Redirect('login');
            }
        });
    }, (refreshAfter + 1) * 1000));
}

function HandleLoginSuccess(response) {
    if (response.data.RefreshAfter) {
        response.data.RefreshLimit = new Date()
        response.data.RefreshLimit.setSeconds(response.data.RefreshLimit.getSeconds() + response.data.RefreshAfter + response.data.RefreshWindow);
        response.data.RefreshLimit = response.data.RefreshLimit.getTime();
        SetRefreshTimeout(response.data.RefreshAfter);
    }

    wuState.Set('AuthenticationData', response.data || '', true);
    wuCore.SetAuthToken(response.data.Token || '');
}

function LoginPage(parent) {
    let onSubmit = function (event) {
        event.preventDefault();
        loginForm.Enable(false);

        let loginEmail = document.querySelector('.loginForm input[name="LoginEmail"]').value || '';
        let loginPassword = document.querySelector('.loginForm input[name="LoginPassword"]').value || '';

        wuCore.Push('users', {
            submodule: 'login',
            id: loginEmail,
            data: {
                'Password': loginPassword,
            },
            success: (response) => {
                HandleLoginSuccess(response);
                wuRouter.Redirect('dashboard');
                new wuGlobalMessage('Logged in');
            },
            error: (response) => {
                loginForm.Enable(true);
                new wuGlobalMessage('Invalid credentials');
            }
        });
    };

    let loginPage = new wuPage(parent, {
        className: 'loginPage',
    });

    new wuTitle(loginPage, {
        title: 'PHP-at-REST Sample App'
    });

    new wuText(loginPage, {
        contents: 'Default user name and password are: admin@test.com, admin'
    });

    let loginForm = new wuForm(loginPage, {
        className: 'loginForm',
        onSubmit: onSubmit,
    });

    new wuEmailInput(loginForm, {
        name: 'LoginEmail',
        placeholder: 'E-mail',
        invalidMessage: 'Type your e-mail',
    });

    new wuPasswordInput(loginForm, {
        name: 'LoginPassword',
        placeholder: 'Password',
        invalidMessage: 'Type your password',
    });

    new wuButton(loginForm, {
        caption: 'Login',
    });

    new wuLink(loginForm, {
        className: 'recoverPassword',
        url: '#login/recover-password',
        text: 'I don\'t have a password yet/I\'ve forgot my password',
    });

    return loginPage;
}

function LoginRouter(rootComponent) {
    let authenticationData = wuState.Get('AuthenticationData');

    if (authenticationData != null) {
        return wuRouter.Redirect('dashboard');
    }

    return new LoginPage(rootComponent);
}

function RecoverPasswordPage(parent) {
    let onSubmit = function (event) {
        event.preventDefault();
        recoverPasswordForm.Enable(false);

        let loginEmail = document.querySelector('.recoverPasswordForm input[name="RecoverPasswordEmail"]').value || '';

        wuCore.Push('users', {
            submodule: 'recover-password',
            id: loginEmail,
            success: (response) => {
                new wuGlobalMessage('A recovery password e-mail was sent');
                recoverPasswordForm.Enable(true);
            },
            error: (response) => {
                new wuGlobalMessage('The recovery password e-mail could not be sent');
                recoverPasswordForm.Enable(true);
            }
        });
    };

    let recoverPasswordPage = new wuPage(parent, {
        className: 'recoverPasswordPage',
    });

    new wuTitle(recoverPasswordPage, {
        title: 'PHP-at-REST Sample App'
    });


    let recoverPasswordForm = new wuForm(recoverPasswordPage, {
        className: 'recoverPasswordForm',
        onSubmit: onSubmit,
    });

    new wuText(recoverPasswordForm, {
        contents: 'Type in your account e-mail. A recovery password e-mail will be sent to this address.',
    })

    new wuEmailInput(recoverPasswordForm, {
        name: 'RecoverPasswordEmail',
        placeholder: 'E-mail',
        invalidMessage: 'Type your e-mail',
    });

    new wuButton(recoverPasswordForm, {
        caption: 'Send',
    });

    new wuLink(recoverPasswordForm, {
        url: '#login',
        text: 'Back',
    });

    return recoverPasswordPage;
}

function RecoverPasswordRouter(rootComponent) {
    return new RecoverPasswordPage(rootComponent);
}

function RecoverPasswordPageStep2(parent, recoveryToken) {
    let onSubmit = function (event) {
        event.preventDefault();
        recoverPasswordForm.Enable(false);


        let newPassword = document.querySelector('.recoverPasswordFormStep2 input[name="RecoverPasswordNewPassword"]').value || '';

        wuCore.Push('users', {
            submodule: 'recover-password',
            id: wuCore.meID,
            data: {
                'Token': recoveryToken,
                'Password': newPassword,
            },
            success: (response) => {
                new wuGlobalMessage('Password changed successfully');
                wuRouter.Redirect('login');
            },
            error: (response) => {
                new wuGlobalMessage('Could not change your password');
                recoverPasswordForm.Enable(true);
            }
        });
    };

    let recoverPasswordPage = new wuPage(parent, {
        className: 'recoverPasswordPageStep2',
    });

    let recoverPasswordForm = new wuForm(recoverPasswordPage, {
        className: 'recoverPasswordFormStep2',
        onSubmit: onSubmit,
    });

    new wuText(recoverPasswordForm, {
        contents: 'Type your new password below',
    })

    new wuPasswordInput(recoverPasswordForm, {
        name: 'RecoverPasswordNewPassword',
        placeholder: 'New Password',
        invalidMessage: 'Type your new password',
    });

    new wuPasswordInput(recoverPasswordForm, {
        name: 'RecoverPasswordConfirmPassword',
        placeholder: 'Confirm your new password',
        match: 'RecoverPasswordNewPassword',
        invalidMessage: 'The passwords do not match',
    });

    new wuButton(recoverPasswordForm, {
        caption: 'Send',
    });

    return recoverPasswordPage;
}

function RecoverPasswordRouterStep2(rootComponent, recoveryToken) {
    return new RecoverPasswordPageStep2(rootComponent, recoveryToken);
}