'use strict';

function wuStateClass() {
    this.objects = {};
}

wuStateClass.prototype.SetUp = function (appPrefix) {
    this.appPrefix = `${appPrefix || 'wuState'}_`;

    // Load all persisted data.

    let appPrefixLength = this.appPrefix.length;

    for (let itemIndex = 0; itemIndex < window.localStorage.length; itemIndex++) {
        let itemKey = window.localStorage.key(itemIndex);

        if (itemKey.substr(0, appPrefixLength) == this.appPrefix) {
            let itemData = window.localStorage.getItem(itemKey);

            try {
                this.objects[itemKey.substr(appPrefixLength)] = JSON.parse(itemData);
            } catch (jsonException) {
                this.objects[itemKey.substr(appPrefixLength)] = itemData;
            }
        }
    }
}

wuStateClass.prototype.Set = function (name, data, makePersistent) {
    this.objects[name] = data;

    if (makePersistent === true) {
        window.localStorage.setItem(`${this.appPrefix}${name}`, typeof data == 'string' ? data : JSON.stringify(data));
    }
}

wuStateClass.prototype.Unset = function (name, makePersistent) {
    this.objects[name] = null;

    if (makePersistent === true) {
        window.localStorage.removeItem(`${this.appPrefix}${name}`);
    }
}

wuStateClass.prototype.Get = function (name, defaultData) {
    return this.objects[name] || defaultData || null;
}

window.wuState = new wuStateClass();