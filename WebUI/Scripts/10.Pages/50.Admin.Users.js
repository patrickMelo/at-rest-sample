'use strict';

function UserAdminPage(parent, authenticationData) {
    let userAdminPage = new wuPage(parent, {
        className: 'userAdmin',
    });

    let usersContainer = new wuContainer(userAdminPage, {
        className: 'usersContainer',
    });

    new wuTitle(usersContainer, {
        title: 'Manage Users',
    });

    let onAdd = function (event) {
        userInformationBox.Add();
    }

    new wuButton(usersContainer, {
        className: 'addRecord',
        caption: 'New User',
        onClick: onAdd,
    });

    let filtersContainer = new wuContainer(usersContainer, { className: 'filtersContainer' });
    let tableOffset = 0;
    const itemsPerPage = 10;

    let updateTable = function () {
        let parameters = {
            OrderBy: orderSelect.boundElement.value,
            LimitBy: itemsPerPage,
            OffsetBy: tableOffset,
        };

        if (typeFilterSelect.boundElement.value != '') {
            parameters['Level'] = typeFilterSelect.boundElement.value;
        }

        if (searchInput.boundElement.value != '') {
            parameters['Search'] = searchInput.boundElement.value;
        }

        wuCore.Pull('users', {
            parameters,
            success: (response) => {
                createTable(response.data);
            },
            error: (response) => {
                new wuGlobalMessage('Could not load the users table');
            }
        });
    };

    let searchInput = new wuSearchInput(filtersContainer, {
        name: 'UserSearchBox',
        placeholder: 'Search by name or e-mail',
        events: {
            search: updateTable,
        },
    });

    let typeFilterSelect = new wuSelect(filtersContainer, {
        name: 'UserTypeFilter',
        defaultText: 'Filter by type',
        items: [
            { text: 'Users', value: '0' },
            { text: 'Administrators', value: '999' },
        ],
        events: {
            change: updateTable,
        }
    });

    let orderSelect = new wuSelect(filtersContainer, {
        name: 'OrderBy',
        defaultText: 'Order by name',
        defaultValue: 'Name',
        items: [
            { text: 'Order by e-mail', value: 'Email' },
        ],
        events: {
            change: updateTable,
        }
    });

    let userInformationBox = new UserAdminInformationBox(usersContainer, updateTable);

    let onEdit = function (event) {
        event.preventDefault();
        let userId = this.wuComponent.userId;

        wuCore.Pull('users', {
            id: userId,
            success: (response) => {
                userInformationBox.Edit(response.data);
            },
            error: (response) => {
                new wuGlobalMessage('Could not load the user data');
            }
        });
    };

    let usersTable = null;
    let pageSelector = null;

    let changePage = function (newOffset) {
        tableOffset = newOffset;
        updateTable();
    };

    let createTable = (data) => {
        let tableBody = [];

        for (let userIndex in data.Items) {
            let currentUser = data.Items[userIndex];

            let editLink = new wuLink(null, {
                className: 'editUser',
                text: currentUser.Name,
                onClick: onEdit,
                virtual: true,
            });

            editLink.userId = currentUser.Id;

            tableBody.push({
                className: '',
                items: [
                    editLink,
                    currentUser.Email,
                    currentUser.IsAdmin ? 'Yes' : 'No',
                    currentUser.Status == 1 ? 'Active' : 'Inactive'
                ],
            });
        }

        if (usersTable) {
            usersTable.Destroy();
        }

        usersTable = new wuTable(usersContainer, {
            head: ['Name', 'E-mail', 'Administrator', 'Status'],
            body: tableBody,
            foot: ['', '', 'Total', data.Total],
            className: 'usersTable',
        });

        if (pageSelector != null) {
            pageSelector.Destroy();
        }

        pageSelector = new wuPageSelector(usersContainer, {
            totalItems: data.Total,
            itemsPerPage,
            currentOffset: tableOffset,
            events: {
                change: changePage,
            }
        });
    }

    updateTable();
    return userAdminPage;
}

function UserAdminInformationBox(parent, updateTable) {
    let currentUserData = undefined;

    let doAdd = function () {
        boxTitle.Update('New User');
        nameInput.Update('');
        emailInput.Update('');
        adminCheckbox.Update(false);
        statusCheckbox.Update(true);

        currentUserData = undefined;
        this.Show();
    };

    let doEdit = function (userData) {
        boxTitle.Update('Edit User');
        nameInput.Update(userData.Name || '');
        emailInput.Update(userData.Email || '');
        adminCheckbox.Update(userData.IsAdmin || false);
        statusCheckbox.Update(userData.Status == 1);

        currentUserData = userData;
        this.Show();
    }

    let doShow = function () {
        this.boundElement.classList.add('visible');
        nameInput.boundElement.focus();
    };

    let doHide = function () {
        this.boundElement.classList.remove('visible');
    };

    let containerOverlay = new wuContainer(parent, {
        className: 'informationBoxContainerOverlay hidden',
        methods: {
            Add: doAdd,
            Edit: doEdit,
            Show: doShow,
            Hide: doHide,
        },
    });

    let boxContainer = new wuContainer(containerOverlay, {
        className: 'informationBoxContainer',
    })

    let boxTitle = new wuTitle(boxContainer, {
        title: ''
    });

    new wuButton(boxContainer, {
        className: 'closeButton',
        caption: 'X',
        onClick: doHide.bind(containerOverlay),
    });

    let doSave = function (event) {
        event.preventDefault();
        userForm.Enable(false);

        let userData = {
            Name: nameInput.boundElement.value,
            Email: emailInput.boundElement.value,
            Status: statusCheckbox.boundElement.checked ? 1 : 0,
            IsAdmin: adminCheckbox.boundElement.checked,
        };

        let doPush = function (pushData) {
            wuCore.Push('users', {
                data: pushData,
                success: (response) => {
                    new wuGlobalMessage('New user created successfully');
                    containerOverlay.Hide();
                    updateTable();
                    userForm.Enable(true);
                },
                error: (response) => {
                    new wuGlobalMessage('Could not create the new user');
                    userForm.Enable(true);
                }
            })
        }

        let doUpdate = function (updateData) {
            wuCore.Update('users', {
                id: currentUserData.Id,
                data: updateData,
                success: (response) => {
                    new wuGlobalMessage('Changes saved successfully');
                    containerOverlay.Hide();
                    updateTable();
                    userForm.Enable(true);
                },
                error: (response) => {
                    new wuGlobalMessage('Could not save changes');
                    userForm.Enable(true);
                }
            })
        }

        if (!currentUserData) {
            doPush(userData);
        } else {
            doUpdate(userData);
        }
    };

    let userForm = new wuForm(boxContainer, {
        onSubmit: doSave,
    });

    let nameInput = new wuNameInput(userForm, {
        name: 'UserName',
        placeholder: 'Name',
        invalidMessage: 'Type the user name',
    });

    let emailInput = new wuEmailInput(userForm, {
        name: 'UserEmail',
        placeholder: 'E-mail',
        invalidMessage: 'Type the user e-mail',
    });

    let adminCheckbox = new wuCheckbox(userForm, {
        name: 'UserAdmin',
        label: 'Is Administrator',
    });

    let statusCheckbox = new wuCheckbox(userForm, {
        name: 'UserStatus',
        label: 'Is Atctive',
    });

    new wuButton(userForm, {
        caption: 'Save',
    });

    return containerOverlay;
}

function UserAdminRouter(rootComponent) {
    let authenticationData = wuState.Get('AuthenticationData');

    if (authenticationData == null) {
        return wuRouter.Redirect('login');
    }

    return new DashboardPage(rootComponent, {
        authenticationData,
        customPage: UserAdminPage,
    });
}
