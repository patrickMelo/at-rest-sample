'use strict';

function wuContainer(parent, options) {
    let containerOptions = {
        className: options.className || '',
    };

    return new wuComponent(parent, {
        template: '@wuContainer',
        data: containerOptions,
        virtual: options?.virtual || false,
        methods: options?.methods || {},
        events: options?.events || {},
    });
}

function wuPage(parent, options) {
    options.className = `wuPage ${options.className || ''}`;
    return new wuContainer(parent, options);
}

function wuLink(parent, options) {
    let linkOptions = {
        text: options.text || '',
        url: options.url || 'javascript:;',
        className: options.className || '',
    };

    let linkEvents = {}

    if (options.onClick) {
        linkEvents.click = options.onClick;
    }

    return new wuComponent(parent, {
        template: '@wuLink',
        data: linkOptions,
        events: linkEvents,
        virtual: options.virtual || false,
    });
}

function wuText(parent, options) {
    let textOptions = {
        contents: options.contents || '',
        className: options.className || '',
    };

    let doUpdate = function (newContents) {
        textComponent.domElement.innerHTML = newContents;
    }

    let textComponent = new wuComponent(parent, {
        template: '@wuText',
        data: textOptions,
        methods: {
            Update: doUpdate,
            ...(options.methods || {}),
        },
        virtual: options.virtual || false,
    });

    return textComponent;
}

function wuTitle(parent, options) {
    let titleOptions = {
        title: options.title || '',
        className: options.className || '',
    };

    let doUpdate = function (newTitle) {
        titleComponent.domElement.innerHTML = newTitle;
    }

    let titleComponent = new wuComponent(parent, {
        template: '@wuTitle',
        data: titleOptions,
        methods: {
            Update: doUpdate,
        },
        virtual: options.virtual || false,
    });

    return titleComponent;
}

function wuImage(parent, options) {
    let imageOptions = {
        url: options.url || '',
        className: options.className || '',
    };

    let imageComponent = new wuComponent(parent, {
        template: '@wuImage',
        data: imageOptions,
        virtual: options.virtual || false,
    });

    return imageComponent;
}