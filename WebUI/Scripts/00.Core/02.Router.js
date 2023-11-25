'use strict';

function wuRouterClass() {
    this.routes = [];
    this.routeComponent = null;
}

wuRouterClass.prototype.SetUp = function (rootComponent, defaultPath) {
    this.defaultPath = defaultPath;
    this.rootComponent = rootComponent;
    this.isRunning = false;

    window.addEventListener('hashchange', this.Update.bind(this), false);
}

wuRouterClass.prototype.Add = function (pathExpression, componentFactory) {
    this.routes.push({
        useRegex: pathExpression.charAt(0) == '^',
        pathExpression: pathExpression.charAt(0) == '^' ? new RegExp(pathExpression, 'g') : pathExpression,
        componentFactory,
    });
}

wuRouterClass.prototype.Run = function () {
    this.isRunning = true;
    this.Update(false);
}

wuRouterClass.prototype.Reload = function (waitTime) {
    window.setTimeout(() => {
        this.isRunning = true;
        this.Update(true);
    }, waitTime || 0);
}

wuRouterClass.prototype.Update = function (isReload) {
    if (!this.isRunning) {
        return;
    }

    let path = window.location.hash.substr(1);

    if (path == '') {
        path = this.defaultPath;

        if (!isReload) {
            history.pushState({}, '', `#${this.defaultPath}`);
        }
    }

    let routeFound = false;
    let params = [];

    for (let index in this.routes) {
        let route = this.routes[index];

        if (route.useRegex) {
            let matches = Array.from(path.matchAll(route.pathExpression));

            if (matches.length > 0) {
                routeFound = true;
                params = matches[0].slice(1);
            }
        } else {
            routeFound = route.pathExpression == path;
        }

        if (routeFound) {
            if (this.routeComponent != null) {
                this.routeComponent.Destroy();
                this.routeComponent = null;
            }

            return this.routeComponent = route.componentFactory(this.rootComponent, ...params);
        }
    }
}

wuRouterClass.prototype.Redirect = function (path) {
    history.pushState({}, '', `#${path}`);
    return this.Update();
}

window.wuRouter = new wuRouterClass();