'use strict';

function wuPageSelector(parent, options) {
    let totalItems = 0;
    let itemsPerPage = 10;
    let currentOffset = 0;
    let totalPages = 0;
    let currentPage = 1;
    let doChange = options.events?.change || null;

    let methodUpdate = function (options) {
        if (options.totalItems != undefined) {
            totalItems = options.totalItems;
        }

        if (options.currentOffset != undefined) {
            currentOffset = options.currentOffset;
        }

        itemsPerPage = options.itemsPerPage || itemsPerPage;
        totalPages = Math.ceil(totalItems / itemsPerPage);
        currentPage = Math.ceil(currentOffset / itemsPerPage) + 1;

        generateSelector();
    }

    let containerComponent = new wuContainer(parent, {
        className: `wuPageSelectorContainer ${options.className || ''}`,
        virtual: options.virtual || false,
        methods: {
            'Update': methodUpdate,
        },
    });


    let buttonsContainer = null;

    let handleChange = function (event) {
        if (!doChange) {
            return;
        }

        doChange(this.pageOffset);
    };

    let createButton = function (pageNumber) {
        let newButton = new wuButton(buttonsContainer, {
            className: pageNumber == currentPage ? 'current' : '',
            caption: pageNumber,
            onClick: handleChange,
        });

        newButton.boundElement.pageOffset = (pageNumber - 1) * itemsPerPage;

        if (pageNumber == currentPage) {
            newButton.boundElement.setAttribute('disabled', '');
        }
    }

    let generateSelector = function () {
        if (buttonsContainer != null) {
            buttonsContainer.Destroy();
        }

        buttonsContainer = new wuContainer(containerComponent, {
            className: 'wuPageSelectorButtons',
        });

        for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
            createButton(pageNumber);
        }
    }

    methodUpdate(options);

    return containerComponent;
}
