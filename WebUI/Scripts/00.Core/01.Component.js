'use strict';

function wuComponent(parent, options) {
    const self = this;

    this.createDOMElement = () => {
        let templateHtml = self.template;

        if (templateHtml.charAt(0) == '@') {
            let templateName = templateHtml.substr(1);
            let templateElement = document.querySelector('script[type="x-webui/template"][data-id="' + templateName + '"]');

            if (!templateElement) {
                console.error(`WebUI: template "${templateName}" not found.`);
                return null;
            }

            templateHtml = templateElement.innerHTML.trim();
        }

        let element = new wuTemplate(templateHtml).GetElement(options.data || {});
        self.boundElement = element;

        if (options.bindSelector) {
            self.boundElement = element.querySelector(options.bindSelector);
        }

        self.boundElement.wuComponent = this;

        if ('create' in self.events) {
            self.events['create'](self.boundElement);
        }

        for (let event in self.events) {
            if (event != 'create') {
                self.boundElement.addEventListener(event, self.events[event]);
            }
        }

        return element;
    };

    this.insertDOMElement = () => {
        if (this.virtual === true) {
            return;
        }

        if (self.parent) {
            self.parent.domElement.appendChild(self.domElement);
        } else {
            document.body.appendChild(self.domElement);
        }
    }

    this.removeDOMElement = () => {
        if (this.virtual === true) {
            return;
        }

        if (self.parent) {
            self.parent.domElement.removeChild(self.domElement);
        } else {
            document.body.removeChild(self.domElement);
        }
    }

    this.parent = parent;
    this.template = options.template || '';
    this.events = options.events || {};
    this.domElement = this.createDOMElement();
    this.virtual = options.virtual || false;
    this.options = options;

    let childMethods = options.methods || {};

    for (let methodName in childMethods) {
        this[methodName] = childMethods[methodName].bind(this)
    }

    if (!this.domElement) {
        return;
    }

    this.insertDOMElement();
}

wuComponent.prototype.MakeReal = function (parent) {
    if (this.virtual !== true) {
        return;
    }

    this.parent = parent;
    this.virtual = false;
    this.insertDOMElement();
}

wuComponent.prototype.GetParent = function () {
    return this.parent;
}

wuComponent.prototype.Destroy = function () {
    this.removeDOMElement();
}

wuComponent.prototype.GetTemplate = function () {
    return this.template;
}

function wuTemplate(templateText) {
    this.templateText = templateText;
    this.templateSupported = 'content' in document.createElement('template');

    this.getElementUsingTemplate = (templateHtml) => {
        const templateElement = document.createElement('template');
        templateElement.innerHTML = templateHtml;
        return templateElement.content.cloneNode(true).firstChild;
    }

    this.getElementUsingFallback = (templateHtml) => {
        const tagRegex = /<([a-z]+)/gmi;
        const tagMatches = tagRegex.exec(templateHtml);

        if (!tagMatches) {
            return null;
        }

        let documentContext = document.implementation.createHTMLDocument('');

        let tempNode = documentContext.createElement(tagMatches[1]);
        tempNode.outerHTML = templateHtml;

        let documentFragment = documentContext.createDocumentFragment();
        documentFragment.appendChild(tempNode);

        return documentFragment.firstChild;
    }
}

wuTemplate.prototype.GetElement = function (data) {
    let templateHtml = this.templateText;

    for (let name in data) {
        templateHtml = templateHtml.replace(new RegExp(`{${name}}`, 'gm'), data[name]);
    }

    return this.templateSupported ? this.getElementUsingTemplate(templateHtml) : this.getElementUsingFallback(templateHtml);
}