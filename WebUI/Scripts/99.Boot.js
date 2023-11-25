'use strict';

wuState.SetUp('wkrh_wtl');

let rootTemplate = '<div id="wuRoot"></div>';
let rootComponent = new wuComponent(null, { template: rootTemplate });

let loadIndicator = new wuLoadIndicator(null);

let authenticationData = wuState.Get('AuthenticationData');

let leftPad = (number, length, char) => {
    char = char || '0';
    let numberString = number + '';
    return numberString.length >= length ? numberString : new Array(length - numberString.length + 1).join(char) + numberString;
}

let toTime = (timestamp) => {
    if (!timestamp) {
        return '';
    }

    let minutes = Math.floor(timestamp / 60);
    let hours = Math.floor(minutes / 60);
    minutes = minutes % 60;

    return `${leftPad(hours, 2)}:${leftPad(minutes, 2)}`;
}

let haveIntl = !!(typeof Intl == 'object' && Intl && typeof Intl.NumberFormat == 'function');

let formatMoney = (value) => {
    if (!value) {
        return '-';
    }

    if (haveIntl) {
        var formatter = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });

        return formatter.format(value);
    }

    let floatValue = parseFloat(value.toString().replace(',', '.'));
    return `R$ ${floatValue.toFixed(2).replace('.', ',')}`
}

wuCore.SetGlobal('RequestCounter', 0);
wuCore.SetAuthToken(authenticationData ? authenticationData.Token : '');

wuCore.SetGlobal('RequestStartedCallback', () => {
    let requestCounter = wuCore.GetGlobal('RequestCounter');

    if (requestCounter <= 0) {
        loadIndicator.Show();
    }

    wuCore.SetGlobal('RequestCounter', ++requestCounter);
});

wuCore.SetGlobal('RequestFinishedCallback', () => {
    let requestCounter = wuCore.GetGlobal('RequestCounter');
    requestCounter--;

    if (requestCounter <= 0) {
        requestCounter = 0;
        loadIndicator.Hide();
    }

    wuCore.SetGlobal('RequestCounter', requestCounter);
});

wuRouter.SetUp(rootComponent, 'login');
wuRouter.Add('dashboard', DashboardRouter);
wuRouter.Add('login', LoginRouter);
wuRouter.Add('login/recover-password', RecoverPasswordRouter);
wuRouter.Add('^login/recover-password/([A-Za-z0-9\\/\\+\\=]+)', RecoverPasswordRouterStep2);
wuRouter.Add('dashboard/profile', ProfileRouter);
wuRouter.Add('dashboard/admin/users', UserAdminRouter);
wuRouter.Run();