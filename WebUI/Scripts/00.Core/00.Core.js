'use strict';

function wuCoreClass(apiVersion = 1) {
    this.apiBase = `${window.location.origin}${window.location.pathname}?api=/api/v${apiVersion}`;
    this.imagesBase = `${window.location.origin}${window.location.pathname}/WebUI/Images/`;
    this.globals = {};
    this.authToken = '';
    this.meID = 'me';
}

wuCoreClass.prototype.Pull = function (endpointName, pullOptions = {}) {
    let pullParameters = pullOptions.parameters || null;
    let uniqueId = pullOptions.id || '';
    let submoduleName = pullOptions.submodule || '';
    let submoduleUniqueId = pullOptions.submoduleId || '';
    let successCallback = pullOptions.success || null;
    let errorCallback = pullOptions.error || null;

    return new wuRequest('GET', endpointName)
        .SetUniqueId(uniqueId)
        .SetSubmodule(submoduleName, submoduleUniqueId)
        .SetParameters(pullParameters)
        .Execute(null, successCallback, errorCallback);
}

wuCoreClass.prototype.Push = function (endpointName, pushOptions = {}) {
    let pushData = pushOptions.data || null;
    let pushParameters = pushOptions.parameters || null;
    let uniqueId = pushOptions.id || '';
    let submoduleName = pushOptions.submodule || '';
    let submoduleUniqueId = pushOptions.submoduleId || '';
    let successCallback = pushOptions.success || null;
    let errorCallback = pushOptions.error || null;

    return new wuRequest('POST', endpointName)
        .SetUniqueId(uniqueId)
        .SetSubmodule(submoduleName, submoduleUniqueId)
        .SetParameters(pushParameters)
        .Execute(pushData, successCallback, errorCallback);
}

wuCoreClass.prototype.Update = function (endpointName, updateOptions = {}) {
    let updateData = updateOptions.data || null;
    let updateParameters = updateOptions.parameters || null;
    let uniqueId = updateOptions.id || '';
    let submoduleName = updateOptions.submodule || '';
    let submoduleUniqueId = updateOptions.submoduleId || '';
    let successCallback = updateOptions.success || null;
    let errorCallback = updateOptions.error || null;

    return new wuRequest('PATCH', endpointName)
        .SetUniqueId(uniqueId)
        .SetSubmodule(submoduleName, submoduleUniqueId)
        .SetParameters(updateParameters)
        .Execute(updateData, successCallback, errorCallback);
}

wuCoreClass.prototype.Upload = function (endpointName, uploadOptions = {}) {
    let uploadData = uploadOptions.data || null;
    let uploadParameters = uploadOptions.parameters || null;
    let uniqueId = uploadOptions.id || '';
    let submoduleName = uploadOptions.submodule || '';
    let submoduleUniqueId = uploadOptions.submoduleId || '';
    let successCallback = uploadOptions.success || null;
    let errorCallback = uploadOptions.error || null;

    return new wuRequest('PUT', endpointName)
        .SetUniqueId(uniqueId)
        .SetSubmodule(submoduleName, submoduleUniqueId)
        .SetParameters(uploadParameters)
        .Execute(uploadData, successCallback, errorCallback);
}

wuCoreClass.prototype.Delete = function (endpointName, deleteOptions = {}) {
    let deleteParameters = deleteOptions.parameters || null;
    let uniqueId = deleteOptions.id || '';
    let submoduleName = deleteOptions.submodule || '';
    let submoduleUniqueId = deleteOptions.submoduleId || '';
    let successCallback = deleteOptions.success || null;
    let errorCallback = deleteOptions.error || null;

    return new wuRequest('DELETE', endpointName)
        .SetUniqueId(uniqueId)
        .SetSubmodule(submoduleName, submoduleUniqueId)
        .SetParameters(deleteParameters)
        .Execute(null, successCallback, errorCallback);
}

wuCoreClass.prototype.SetAuthToken = function (tokenString) {
    this.authToken = tokenString;
}

wuCoreClass.prototype.GetAuthToken = function () {
    return this.authToken;
}

wuCoreClass.prototype.SetGlobal = function (name, value) {
    this.globals[name] = value;
}

wuCoreClass.prototype.GetGlobal = function (name) {
    return this.globals[name] || null;
}

wuCoreClass.prototype.ImageUrl = function (imagePath) {
    return `${this.imagesBase}${imagePath}`;
}

/** WebUI Request **/

function wuRequest(method, endpointName) {
    this.method = method;
    this.endpointName = endpointName;
    this.requestStarted = wuCore.GetGlobal('RequestStartedCallback');
    this.requestFinished = wuCore.GetGlobal('RequestFinishedCallback');
}

wuRequest.prototype.SetUniqueId = function (uniqueId) {
    this.uniqueId = uniqueId;
    return this;
}

wuRequest.prototype.SetSubmodule = function (submoduleName, submoduleUniqueId) {
    this.submoduleName = submoduleName;
    this.submoduleUniqueId = submoduleUniqueId;
    return this;
}

wuRequest.prototype.SetParameters = function (parameters) {
    this.parameters = parameters;
    return this;
}

wuRequest.prototype.GetUrl = function () {
    var requestUrl = `${wuCore.apiBase}/${this.endpointName.toLowerCase()}`;

    if (this.uniqueId != '') {
        requestUrl += `/${window.encodeURIComponent(this.uniqueId)}`;
    }

    if (this.submoduleName != '') {
        requestUrl += `/${this.submoduleName.toLowerCase()}`;
    }

    if (this.submoduleUniqueId != '') {
        requestUrl += `/${window.encodeURIComponent(this.submoduleUniqueId)}`;
    }

    if (typeof this.parameters == 'object') {
        requestUrl += '?';

        for (name in this.parameters) {
            requestUrl += `${window.encodeURIComponent(name)}=${window.encodeURIComponent(this.parameters[name])}&`;
        }
    }

    return requestUrl;
}

wuRequest.prototype.Execute = function (requestData, successCallback = null, errorCallback = null) {
    function downloadListener(event) {
        if (this.readyState != XMLHttpRequest.DONE) {
            return;
        }

        if (this.wuRequest.requestFinished) {
            this.wuRequest.requestFinished();
        }

        if ((this.status < 200) || (this.status > 299)) {
            if (errorCallback) {
                errorCallback(new wuResponse(this.status, null));
                return;
            }
        }

        let responseData;

        try {
            responseData = this.responseText == '' ? {} : JSON.parse(this.responseText);

            if (successCallback) {
                successCallback(new wuResponse(this.status, responseData));
            }
        } catch (jsonException) {
            console.error(jsonException);

            if (errorCallback) {
                errorCallback(new wuResponse(-1, null));
            }
        }
    }

    function progressListener(event) {
        //console.log(event);
    }

    function errorListener(event) {
        //console.error(event);
    }

    function abortListener(event) {
        //console.error(event);
    }

    function uploadListener(event) {
        //console.log(event);
    }

    function uploadProgressListener(event) {
        //console.log(event);
    }

    function uploadErrorListener(event) {
        //console.error(event);
    }

    function uploadAbortListener(event) {
        //console.error(event);
    }

    var requestBody = null;

    if (requestData != undefined) {
        requestBody = JSON.stringify(requestData)
    }

    var httpRequest = new XMLHttpRequest();

    httpRequest.wuRequest = this;

    httpRequest.addEventListener('load', downloadListener);
    httpRequest.addEventListener('progress', progressListener);
    httpRequest.addEventListener('error', errorListener);
    httpRequest.addEventListener('abort', abortListener);

    httpRequest.upload.addEventListener('load', uploadListener);
    httpRequest.upload.addEventListener('progress', uploadProgressListener);
    httpRequest.upload.addEventListener('error', uploadErrorListener);
    httpRequest.upload.addEventListener('abort', uploadAbortListener);

    httpRequest.open(this.method, this.GetUrl());

    httpRequest.setRequestHeader('Content-Type', 'application/json');
    httpRequest.setRequestHeader('X-Auth-Token', wuCore.GetAuthToken());

    httpRequest.send(requestBody);

    if (this.requestStarted) {
        this.requestStarted();
    }
}

/** WebUI Response **/

function wuResponse(status, data) {
    this.status = status;
    this.data = data;
}

window.wuCore = new wuCoreClass();
