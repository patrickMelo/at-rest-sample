'use strict';

function wuButton(parent, options) {
    let buttonOptions = {
        caption: options.caption || 'Button',
        className: options.className || '',
    };

    let buttonEvents = {};

    if (options.onClick) {
        buttonEvents.click = options.onClick;
    }

    return new wuComponent(parent, {
        template: '@wuButton',
        data: buttonOptions,
        events: buttonEvents,
        virtual: options.virtual || false,
    });
}

function wuCheckbox(parent, options) {
    let checkboxOptions = {
        name: options.name || '',
        label: options.label || 'Checkbox',
        className: options.className || '',
        checked: options.checked == true ? 'checked="checked"' : '',
    };

    let checkboxEvents = {};

    if (options.onClick) {
        checkboxEvents.click = options.onClick;
    }

    let methodUpdate = function (isChecked) {
        this.boundElement.checked = isChecked;
    }

    return new wuComponent(parent, {
        template: '@wuCheckbox',
        data: checkboxOptions,
        events: checkboxEvents,
        virtual: options.virtual || false,
        bindSelector: 'input',
        methods: {
            'Update': methodUpdate,
        },
    });
}

function wuSelect(parent, options) {
    let selectOptions = {
        name: options.name || '',
        className: options.className || '',
        invalidMessage: options.invalidMessage || '',
    };

    let selectFocus = function (event) {
        event.target.classList.remove('wuInvalid');
    };

    let selectEvents = {
        focus: selectFocus,
        ...(options.events || {}),
    };

    let methodSetValid = function (valid) {
        if (valid) {
            this.boundElement.classList.remove('wuInvalid');
        } else {
            this.boundElement.classList.add('wuInvalid');
        }
    };

    let selectedValue = options.value || '';

    let addOption = function (component, item) {
        let option = new Option(item.text, item.value);

        if (item.value == selectedValue) {
            option.selected = true;
        }

        component.boundElement.options.add(option);
    }

    let methodUpdate = function (items) {
        let length = this.boundElement.options.length;

        for (let index = length - 1; index >= 0; index--) {
            this.boundElement.options.remove(index);
        }

        if (options.defaultText) {
            addOption(this, {
                text: options.defaultText,
                value: options.defaultValue || '',
            });
        }

        for (let index in items) {
            addOption(this, items[index]);
        }

        this.SetValid(true);
    }

    let methodUpdateSelected = function (newValue) {
        let length = this.boundElement.options.length;

        for (let index = 0; index < length; index++) {
            let option = this.boundElement.options[index];
            option.selected = option.value == newValue;
        }

        this.SetValid(true);
    }

    let selectComponent = new wuComponent(parent, {
        template: '@wuSelect',
        data: selectOptions,
        events: selectEvents,
        bindSelector: 'select',
        virtual: options.virtual || false,
        methods: {
            'SetValid': methodSetValid,
            'Update': methodUpdate,
            'UpdateSelected': methodUpdateSelected,
            ...(options.methods || {}),
        },
    });


    selectComponent.Update(options.items || {});
    return selectComponent;
}

function wuTextInput(parent, options) {
    let inputOptions = {
        name: options.name || '',
        className: options.className || '',
        placeholder: options.placeholder || '',
        value: options.value || '',
        regex: options.regex || '',
        match: options.match || '',
        invalidMessage: options.invalidMessage || '',
    };

    let inputFocus = function (event) {
        event.target.classList.remove('wuInvalid');
    };

    let inputEvents = {
        focus: inputFocus,
        ...(options.events || {}),
    };

    let methodSetValid = function (valid) {
        if (valid) {
            this.boundElement.classList.remove('wuInvalid');
        } else {
            this.boundElement.classList.add('wuInvalid');
        }
    };

    let methodUpdate = function (newValue) {
        this.boundElement.value = newValue;
        this.SetValid(true);
    }

    return new wuComponent(parent, {
        template: '@wuTextInput',
        data: inputOptions,
        events: inputEvents,
        bindSelector: 'input',
        virtual: options.virtual || false,
        methods: {
            'SetValid': methodSetValid,
            'Update': methodUpdate,
            ...(options.methods || {}),
        },
    });
}

function wuPasswordInput(parent, options) {
    let inputOptions = {
        name: options.name || '',
        className: options.className || '',
        placeholder: options.placeholder || '',
        regex: options.regex || '',
        match: options.match || '',
        invalidMessage: options.invalidMessage || '',
    };

    if ((inputOptions.regex == '') && (inputOptions.match == '')) {
        inputOptions.regex = '^.{3,100}$';
    }

    let inputFocus = function (event) {
        event.target.classList.remove('wuInvalid');
    };

    let inputEvents = {
        focus: inputFocus,
        ...(options.events || {}),
    };

    let methodSetValid = function (valid) {
        if (valid) {
            this.boundElement.classList.remove('wuInvalid');
        } else {
            this.boundElement.classList.add('wuInvalid');
        }
    };

    return new wuComponent(parent, {
        template: '@wuPasswordInput',
        data: inputOptions,
        events: inputEvents,
        bindSelector: 'input',
        virtual: options.virtual || false,
        methods: {
            'SetValid': methodSetValid,
            ...(options.methods || {}),
        },
    });
}

function wuEmailInput(parent, options) {
    return new wuTextInput(parent, {
        ...options, regex: '^[a-z][a-z0-9\\.\\_\\-\\+]+@[a-z0-9\\.\\_\\-]+\\.[a-z]{2,10}$',
    });
}

function wuNameInput(parent, options) {
    return new wuTextInput(parent, {
        ...options, regex: '^.{3,50}$',
    });
}

function wuYearInput(parent, options) {
    return new wuTextInput(parent, {
        ...options, regex: '^20[2-9][0-9]$',
    });
}

function wuMoneyInput(parent, options) {
    return new wuTextInput(parent, {
        ...options, regex: '^[0-9]+,?[0-9]{0,2}$',
    });
}

function wuSearchInput(parent, options) {
    let doSearch = options.events?.search || null;
    let searchTimeout = null;
    let lastSearch = '';

    let handleSearch = function (event) {
        if (!doSearch) {
            return;
        }

        if (searchTimeout) {
            window.clearTimeout(searchTimeout);
        }

        searchTimeout = window.setTimeout(function () {
            if (event.target.value == lastSearch) {
                return;
            }

            lastSearch = event.target.value;
            doSearch();
        }, 500);
    };

    return new wuTextInput(parent, {
        name: options.name || '',
        className: options.className || '',
        placeholder: options.placeholder || '',
        value: options.value || '',
        regex: options.regex || '',
        match: options.match || '',
        invalidMessage: options.invalidMessage || '',
        events: {
            keydown: handleSearch,
            ...(options.events || {}),
        },
        virtual: options.virtual || false,
        methods: options.methods || {},
    });
}

function wuMaskedInput(parent, options) {
    let mask = options.mask || '';
    let cleanLength = mask.replace(/[^_]/g, '').length;
    let lastWasDigit = false;

    let removeMask = (maskedValue) => {
        return maskedValue.replace(/[^\d]/g, '');
    };

    let applyMask = (value, oldStart, oldEnd) => {
        let valueIndex = 0;
        let maskedValue = '';
        let newStart = oldStart;
        let newEnd = oldEnd;

        if (value.length > 0) {
            for (let maskIndex in mask) {
                if (mask[maskIndex] == '_') {
                    maskedValue += value[valueIndex] || ' ';
                    valueIndex++;
                } else {
                    maskedValue += mask[maskIndex];

                    if (lastWasDigit && (maskIndex == oldStart)) {
                        newStart++;
                        newEnd++;
                    }
                }
            }
        }

        return {
            maskedValue, newStart, newEnd
        };
    };

    let filterInput = function (event) {
        lastWasDigit = false;

        if ((event.key.length > 1) || (event.ctrlKey) || (event.altKey)) {
            return;
        }

        if (event.key.match(/[\d]/)) {
            lastWasDigit = true;
        } else {
            event.preventDefault();
        }

        let input = event.target;

        if ((removeMask(input.value).length == cleanLength) && (input.selectionStart == input.selectionEnd)) {
            event.preventDefault();
        }
    };

    let handleChange = function (event) {
        let input = event.target;
        let start = input.selectionStart;
        let end = input.selectionEnd;

        let applyResult = applyMask(removeMask(input.value), start, end);

        input.value = applyResult.maskedValue;
        input.selectionStart = applyResult.newStart;
        input.selectionEnd = applyResult.newEnd;
    };

    return new wuTextInput(parent, {
        name: options.name || '',
        className: options.className || '',
        placeholder: options.placeholder || '',
        value: options.value || '',
        regex: options.regex || '',
        match: options.match || '',
        invalidMessage: options.invalidMessage || '',
        events: {
            click: handleChange,
            keyup: handleChange,
            keydown: filterInput,
            ...(options.events || {}),
        },
        virtual: options.virtual || false,
        methods: options.methods || {},
    });
}

function wuForm(parent, options) {
    let formOptions = {
        className: options.className || '',
    };

    let userSubmit = options.onSubmit || null;

    let validateForm = function (form) {
        let inputsOK = true;

        try {
            let inputs = form.querySelectorAll('input');

            for (let index = 0; index < inputs.length; index++) {
                let input = inputs[index];
                let inputOK = true;
                let inputRegEx = input.getAttribute('data-regex') || '';
                let inputMatch = input.getAttribute('data-match') || '';

                if (inputRegEx != '') {
                    inputRegEx = new RegExp(inputRegEx, 'im');
                    inputOK = inputRegEx.test(input.value);
                } else if (inputMatch != '') {
                    let matchInput = form.querySelector(`input[name="${inputMatch}"]`);

                    if (matchInput) {
                        inputOK = input.value == matchInput.value;
                    } else {
                        inputOK = false;
                    }
                }
                if (inputOK) {
                    input.classList.remove('wuInvalid');
                } else {
                    input.classList.add('wuInvalid');
                    inputsOK = false;
                }
            };

            let selects = form.querySelectorAll('select');

            for (let index = 0; index < selects.length; index++) {
                let select = selects[index];

                if (select.value == '') {
                    select.classList.add('wuInvalid');
                    inputsOK = false;
                } else {
                    select.classList.remove('wuInvalid');
                }
            }
        } catch (unknownError) {
            console.error(unknownError);
            inputsOK = false;
        }

        return inputsOK;
    };

    let submitForm = function (event) {
        event.preventDefault();

        if (!userSubmit) {
            return;
        }

        var form = event.target;

        if (!validateForm(form)) {
            return;
        }

        var formData = {};
        var inputs = form.querySelectorAll('input');

        for (let index = 0; index < inputs.length; index++) {
            let input = inputs[index];
            let submit = input.getAttribute('data-submit') || '';

            input.classList.remove('wuInvalid');

            if (submit == 'no') {
                continue
            }

            formData[input.name] = input.value;
        }

        userSubmit(event, formData);
    };

    let methodEnable = function (doEnable) {
        var inputs = this.domElement.querySelectorAll('input, button, select');

        for (let index = 0; index < inputs.length; index++) {
            let input = inputs[index];

            if (doEnable) {
                let wasDisabled = input.getAttribute('data-wu-disabled');

                if (wasDisabled != '1') {
                    input.removeAttribute('disabled');
                }
            } else {
                input.setAttribute('data-wu-disabled', input.hasAttribute('disabled') ? '1' : '0');
                input.setAttribute('disabled', '');
            }
        }
    }

    let formEvents = {
        submit: submitForm,
    };

    return new wuComponent(parent, {
        template: '@wuForm',
        data: formOptions,
        events: formEvents,
        methods: {
            'Enable': methodEnable,
        },
        virtual: options.virtual || false,
    });
}