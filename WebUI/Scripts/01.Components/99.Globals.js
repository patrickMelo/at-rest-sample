'use strict';

function wuGlobalMessage(text, options) {
    let containerComponent = wuCore.GetGlobal('globalMessagesContainer');

    if (!containerComponent) {
        containerComponent = new wuComponent(null, {
            template: '@wuGlobalMessageContainer'
        });

        wuCore.SetGlobal('globalMessagesContainer', containerComponent);
    }

    options = options || {};

    let messageOptions = {
        className: options.className || '',
        text,
    }

    let messageComponent = new wuComponent(containerComponent, {
        template: '@wuGlobalMessage',
        data: messageOptions,
    });

    window.setTimeout(() => {
        messageComponent.domElement.classList.add('hidden');

        window.setTimeout(() => {
            messageComponent.Destroy();
        }, 250);
    }, 3000);

    return messageComponent;
}

function wuLoadIndicator(parent, options) {
    options = options || {};

    let indicatorOptions = {
        className: options.className || '',
    }

    let doShow = function () {
        this.domElement.classList.add('visible');
    }

    let doHide = function () {
        this.domElement.classList.remove('visible');
    }

    return new wuComponent(parent, {
        template: '@wuLoadIndicator',
        data: indicatorOptions,
        methods: {
            'Show': doShow,
            'Hide': doHide,
        }
    });
}