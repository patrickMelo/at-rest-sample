'use strict';

function DashboardPage(parent, options) {
    let authenticationData = options.authenticationData || {};
    let customPage = options.customPage || null;
    let customParameters = options.customParameters || [];
    let isAdmin = authenticationData.User.IsAdmin == true;
    let now = new Date();

    if ((!authenticationData.RefreshLimit) || (now > authenticationData.RefreshLimit)) {
        wuState.Unset('AuthenticationData', true);
        new wuGlobalMessage('Your session expired');
        return wuRouter.Redirect('login');
    }

    // Update sessiong refresh timeout if needed

    let refreshTimeout = wuState.Get('RefreshTimeout');

    if (!refreshTimeout) {
        SetRefreshTimeout(Math.round((authenticationData.RefreshLimit - now.getTime()) / 1000) - authenticationData.RefreshWindow);
    }

    let onLogout = function (event) {
        event.preventDefault();
        wuState.Unset('AuthenticationData', true);
        wuRouter.Redirect('login');
    };

    let dashboardPage = new wuPage(parent, {
        className: `dashboardPage ${isAdmin ? 'adminDashboardPage' : ''}`,
    });

    let topBar = new wuContainer(dashboardPage, {
        className: 'dashboardBar',
    });

    let topBarContainer = new wuContainer(topBar, {
        className: 'dashboardBarContainer',
    });

    let leftContainer = new wuContainer(topBarContainer, {
        className: 'leftContainer',
    });

    if (isAdmin) {
        new wuButton(leftContainer, {
            className: 'manageUsers',
            caption: 'Users',
            onClick: () => { wuRouter.Redirect('dashboard/admin/users'); },
        });
    }

    let rightContainer = new wuContainer(topBarContainer, {
        className: 'rightContainer',
    })

    new wuButton(rightContainer, {
        className: 'loggedUserName',
        caption: authenticationData.User.Name || '???',
        onClick: () => { wuRouter.Redirect('dashboard/profile'); },
    })

    new wuButton(rightContainer, {
        className: 'logoutButton',
        caption: 'Logout',
        onClick: onLogout,
    });

    if (customPage == null) {
        let pageContainer = new wuPage(dashboardPage, {});

        if (isAdmin) {
            new AdminDashboardPage(pageContainer, authenticationData);
        } else {
            new UserDashboardPage(pageContainer, authenticationData);
        }
    } else {
        customPage(dashboardPage, authenticationData, ...customParameters);
    }

    return dashboardPage;
}

function AdminDashboardPage(parent, authenticationData) {
    if (!authenticationData.User.IsAdmin) {
        return wuRouter.Redirect('dashboard');
    }

    new wuText(parent, {
        className: 'helloText',
        contents: `Hi, ${authenticationData.User.Name}. Please, select on the top menu what you want to manage`,
    });
}

function UserDashboardPage(parent, authenticationData) {
    new wuText(parent, {
        className: 'helloText',
        contents: `Hi, ${authenticationData.User.Name}.`,
    });
}

function DashboardRouter(rootComponent) {
    let authenticationData = wuState.Get('AuthenticationData');

    if (authenticationData == null) {
        return wuRouter.Redirect('login');
    }

    return new DashboardPage(rootComponent, { authenticationData });
}