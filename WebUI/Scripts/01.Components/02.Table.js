'use strict';

function wuTable(parent, options) {
    let tableOptions = {
        className: options.className || '',
    };

    let tableComponent = new wuComponent(parent, {
        template: '@wuTable',
        data: tableOptions,
        virtual: options.virtual || false,
    });

    // Headers

    if (options.head) {
        let headComponent = new wuComponent(tableComponent, {
            template: '@wuTable.Head',
        });

        let headRow = new wuComponent(headComponent, {
            template: '@wuTable.Row',
            data: {
                className: '',
            }
        });

        for (let index in options.head) {
            new wuComponent(headRow, {
                template: '@wuTable.HeadCell',
                data: {
                    className: '',
                    contents: options.head[index],
                }
            });
        }
    }

    // Body

    if (options.body) {
        let bodyComponent = new wuComponent(tableComponent, {
            template: '@wuTable.Body',
        });

        for (let rowIndex in options.body) {
            let row = options.body[rowIndex];
            let rowClass = '';

            if (typeof row == 'object') {
                rowClass = row.className || '';
                row = row.items || [];
            }

            let bodyRow = new wuComponent(bodyComponent, {
                template: '@wuTable.Row',
                data: {
                    className: rowClass,
                    tag: 'tr',
                }
            });

            for (let cellIndex in row) {
                let cellContents = row[cellIndex];
                let isComponent = typeof cellContents == 'object';

                let cellComponent = new wuComponent(bodyRow, {
                    template: '@wuTable.Cell',
                    data: {
                        className: '',
                        contents: isComponent ? '' : cellContents,
                    }
                });

                if (isComponent) {
                    cellContents.MakeReal(cellComponent);
                }
            }
        }
    }

    // Foot

    if (options.foot) {
        let footComponent = new wuComponent(tableComponent, {
            template: '@wuTable.Foot',
        });

        let footRow = new wuComponent(footComponent, {
            template: '@wuTable.Row',
            data: {
                className: '',
                tag: 'tr',
            }
        });

        for (let index in options.foot) {
            let cellContents = options.foot[index];
            let isComponent = typeof cellContents == 'object';

            let cellComponent = new wuComponent(footRow, {
                template: '@wuTable.Cell',
                data: {
                    className: '',
                    contents: isComponent ? '' : cellContents,
                }
            });

            if (isComponent) {
                cellContents.MakeReal(cellComponent);
            }
        }
    }

    return tableComponent;
}
