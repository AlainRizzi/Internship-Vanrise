var app = angular.module('deviceApp', ['ui.bootstrap']);

//app.directive('clientTypeSelector', function () {
//    return {
//        restrict: 'E',
//        scope: {
//            model: '=',     // Two-way bind to searchType or ModalClient.Type
//            mode: '@',      // 'search' or 'form'
//            isEdit: '@'     // 'true' or 'false' (passed as string)
//        },
//        template: `
//            <select class="form-control" ng-model="model" ng-options="option.id as option.name for option in options">
//                <option ng-if="showPlaceholder" disabled value="">{{ placeholderText }}</option>
//            </select>
//        `,
//        link: function (scope) {
//            const baseOptions = [
//                { id: '0', name: 'Individual' },
//                { id: '1', name: 'Organization' }
//            ];

//            scope.options = angular.copy(baseOptions);
//            scope.showPlaceholder = false;
//            scope.placeholderText = '';

//            if (scope.mode === 'search') {
//                scope.options.unshift({ id: '', name: 'All Types' });
//                scope.model = scope.model ?? '';
//            }

//            if (scope.mode === 'form') {
//                if (scope.isEdit === 'true') {
//                    // Edit mode: just show two options and prefill happens automatically
//                    scope.showPlaceholder = false;
//                } else {
//                    // Add mode: show "Select Type" placeholder
//                    scope.showPlaceholder = true;
//                    scope.placeholderText = 'Select Type';
//                    scope.model = null;
//                }
//            }
//        }
//    };
//});

//app.directive('clientTypeSelector', function () {
//    return {
//        restrict: 'E',
//        scope: {
//            model: '=',        // Binds to searchType or ModalClient.Type
//            getData: '&',      // Expression: getType or getType()
//            mode: '@',         // 'search' or 'form'
//            isEdit: '@'        // 'true' or 'false' for distinguishing add/edit
//        },
//        template: `
//            <select class="form-control"
//                    ng-model="model"
//                    ng-options="type.id as type.name for type in types">
//            </select>
//        `,
//        link: function (scope) {
//            let result;

//            try {
//                result = scope.getData(); // Should return an array
//            } catch (e) {
//                console.error('getData() error:', e);
//                scope.types = [];
//                return;
//            }

//            // Handle promise (optional, if getData is async)
//            if (result && typeof result.then === 'function') {
//                result.then(handleData);
//            } else {
//                handleData(result);
//            }

//            function handleData(data) {
//                if (!Array.isArray(data)) {
//                    console.error('getData() did not return an array:', data);
//                    scope.types = [];
//                    return;
//                }

//                // Clone
//                scope.types = angular.copy(data);

//                if (scope.mode === 'search') {
//                    scope.types.unshift({ id: null, name: 'All types' });

//                    if (scope.model === undefined) {
//                        scope.model = null;
//                    }
//                }

//                if (scope.mode === 'form' && scope.isEdit !== 'true') {
//                    scope.model = null;
//                }
//            }
//        }
//    };
//});

app.directive('clientTypeSelector', function () {
    return {
        restrict: 'E',
        scope: {
            model: '=',
            getData: '&',
            mode: '@',
            isEdit: '@'
        },
        template: `
            <select class="form-control"
                    ng-model="model"
                    ng-options="type.id as type.name for type in types">
            </select>
        `,
        link: function (scope) {
            let data = scope.getData();

            if (!Array.isArray(data)) {
                console.error('getData did not return an array:', data);
                scope.types = [];
                return;
            }

            scope.types = angular.copy(data);

            let isEditBool = (scope.isEdit === true || scope.isEdit === 'true');

            if (scope.mode === 'search') {
                scope.types.unshift({ id: null, name: 'All Types' });
                if (scope.model === undefined) {
                    scope.model = null;
                }
            }


            if (scope.mode === 'form' && !isEditBool) {
                scope.types.unshift({ id: null, name: 'Select Type' });
                scope.model = null;
            }

            if (scope.mode === 'form' && isEditBool) {
                scope.model = parseInt(scope.model);
            }
        }
    };
});


app.controller('ClientCtrl', function ($scope, $http, $uibModal) {
    if (!sessionStorage.getItem('username')) {
        window.location.href = '/Account/Login';
    }
    $scope.Clients = [];
    $scope.filteredClients = [];
    $scope.getType = function () {
        return [
            { id: 0, name: 'Individual' },
            { id: 1, name: 'Organization' }
        ];
    };

    $scope.loadClients = function () {
        $http.get("/api/clients").then(function (response) {
            $scope.Clients = response.data;
            $scope.filteredClients = $scope.Clients;

            // Fetch reservation status for each client
            $scope.Clients.forEach(function (client) {

                /*                console.log(client);*/
                $http.get('/api/clients/HasActiveReservation/' + client.ID)
                    .then(function (res) {
                        client.hasActiveReservation = res.data;
                        /*                            console.log(client.hasActiveReservation);*/
                    });
            });
        });
    };

    $scope.filterClients = function () {
        $scope.filteredClients = $scope.Clients.filter(function (c) {
            var nameMatch = !$scope.searchName || c.Name.toLowerCase().includes($scope.searchName.toLowerCase());
            var typeMatch = $scope.searchType === undefined || $scope.searchType === null || c.Type == $scope.searchType;
            return nameMatch && typeMatch;
        });
    };

    $scope.deleteClient = function (client) {
        if (!confirm("Are you sure you want to delete this client?")) return;

        $http.delete('/api/clients/' + client.ID)
            .then($scope.loadClients)
            .catch(function (error) {
                if (error.data && error.data.Message) {
                    alert("Cannot delete client: They have active phone number reservations.");
                } else {
                    console.error('Delete failed:', error);
                    alert("An unexpected error occurred while deleting.");
                }
            });
    };

    $scope.reservePhoneNumber = function (client) {
        $scope.currentClient = client;
        $scope.isUnreserve = false;
        $scope.reservation = {};

        // Load available phone numbers
        $http.get('/api/phonenumbers').then(function (res) {
            $scope.phoneNumbers = res.data;
            $('#reservationModal').modal('show');
        });
    };

    $scope.unreservePhoneNumber = function (client) {
        $scope.currentClient = client;
        $scope.isUnreserve = true;
        $scope.reservation = {};

        // Load phone numbers currently reserved by this client
        $http.get('/api/phonenumbers/reserved/' + client.ID).then(function (res) {
            $scope.reservedPhoneNumbers = res.data;
            $('#reservationModal').modal('show');
        });
    };

    $scope.saveReservation = function () {
        var dto = {
            ClientID: $scope.currentClient.ID,
            PhoneNumberID: $scope.reservation.PhoneNumberID
        };

        var url = $scope.isUnreserve ? '/api/clients/unreserve' : '/api/clients/reserve';

        $http.post(url, dto).then(function () {
            $('#reservationModal').modal('hide');
            $scope.loadClients(); // Refresh table
        }, function (err) {
            alert(err.data?.Message || "Reservation error");
        });
    };

    $scope.openReserveModal = function (client) {
        $uibModal.open({
            templateUrl: 'reserveModal.html',
            controller: 'ReserveModalController',
            resolve: {
                client: function () {
                    return client;
                }
            }
        }).result.then(function () {
            $scope.loadClients(); // reload if needed
        });
    };

    $scope.openUnreserveModal = function (client) {
        $uibModal.open({
            templateUrl: 'unreserveModal.html',
            controller: 'UnreserveModalController',
            resolve: {
                client: function () {
                    return client;
                }
            }
        }).result.then(function () {
            $scope.loadClients(); // reload if needed
        });
    };

    $scope.openModal = function (client) {
        var modalInstance = $uibModal.open({
            templateUrl: 'clientModal.html',
            controller: 'ClientModalCtrl',
            resolve: {
                client: function () {
                    return angular.copy(client);
                },
                clients: function () {
                    return $scope.Clients;
                },
                getType: function () {
                    return $scope.getType;
                }
            },
            scope: $scope
        });

        modalInstance.result.then(function (modalClient) {
            if (modalClient.ID) {
                $http.put("/api/clients/" + modalClient.ID, modalClient).then($scope.loadClients);
            } else {
                $http.post("/api/clients", modalClient).then($scope.loadClients);
            }
        });
    };

    $scope.loadClients();

});

app.controller('ClientModalCtrl', function ($scope, $uibModalInstance, client, clients) {
    // Initialize modal data
    $scope.ModalClient = client
        ? angular.copy(client)
        : { Name: '', Type: null, BirthDate: null };

    $scope.IsEdit = client && client.ID !== undefined;
    $scope.OriginalName = client ? client.Name : '';


    if ($scope.ModalClient.Type !== null && $scope.ModalClient.Type !== undefined) {
        $scope.ModalClient.Type = $scope.ModalClient.Type?.toString();
    }
    // If birthdate exists, parse it
    if ($scope.ModalClient.BirthDate) {
        $scope.ModalClient.BirthDate = new Date($scope.ModalClient.BirthDate);
    }

    // Called when Type changes
    $scope.onTypeChange = function () {
        // If it's Organization, remove the birthdate
        if ($scope.ModalClient.Type === 1) {
            $scope.ModalClient.BirthDate = null;
        }
    };

    // Call it once on load in case we're editing
    $scope.onTypeChange();

    // Save button logic
    $scope.save = function () {
        const client = angular.copy($scope.ModalClient);

        // Validate name
        if (!client.Name || client.Name.trim() === "") {
            alert("Client name cannot be empty.");
            return;
        }

        // Validate type
        if (client.Type === undefined || client.Type === null || client.Type === "") {
            alert("Please select a client type.");
            return;
        }

        const typeInt = parseInt(client.Type);

        // Validate birthdate for Individual
        if (typeInt === 0 && !client.BirthDate) {
            alert("BirthDate is required for Individual clients.");
            return;
        }

        // Remove birthdate for Organization
        if (typeInt === 1) {
            client.BirthDate = null;
        }

        // Prevent duplicate name + type (excluding self in edit)
        const name = client.Name.trim().toLowerCase();
        const duplicate = clients.some(function (c) {
            if ($scope.IsEdit && c.ID === client.ID) return false;
            return c.Name.trim().toLowerCase() === name && c.Type == typeInt;
        });

        if (duplicate) {
            alert("Duplicate client name for the same type is not allowed.");
            return;
        }

        if (client.BirthDate instanceof Date) {
            const d = client.BirthDate;
            client.BirthDate = `${d.getFullYear()} -${(d.getMonth() + 1).toString().padStart(2, '0')} -${d.getDate().toString().padStart(2, '0')} 00:00:00`;
        }

        // Return data to parent controller to process
        $uibModalInstance.close(client);
    };

    // Cancel button logic
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

app.controller('ReserveModalController', function ($scope, $http, $uibModalInstance, client) {
    $scope.client = client;
    $scope.reservation = {};
    $scope.errorMessage = '';

    // Load all phone numbers (only ones not currently reserved)
    $http.get('/api/clients/GetAvailablePhoneNumbers')
        .then(function (response) {
            $scope.phoneNumbers = response.data;
        });

    $scope.save = function () {
        if (!$scope.reservation.PhoneNumberID) {
            $scope.errorMessage = 'Please select a phone number.';
            return;
        }

        const data = {
            ClientID: client.ID,
            PhoneNumberID: $scope.reservation.PhoneNumberID,
            BED: new Date().toISOString(),
            EED: null
        };

        $http.post('/api/clients/reserve', data)
            .then(function () {
                $uibModalInstance.close();
            })
            .catch(function (err) {
                $scope.errorMessage = 'Reservation failed: ' + (err.data?.Message || err.statusText);
            });
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

app.controller('UnreserveModalController', function ($scope, $http, $uibModalInstance, client) {
    $scope.client = client;
    $scope.reservation = {};
    $scope.errorMessage = '';

    // Load currently active reservations for this client
    $http.get('/api/clients/GetReservedPhoneNumbers/' + client.ID)
        .then(function (response) {
            $scope.reservedNumbers = response.data;
        });

    $scope.confirmUnreserve = function () {
        if (!$scope.reservation.PhoneNumberID) {
            $scope.errorMessage = 'Please select a phone number.';
            return;
        }

        // Backend will handle finding the active reservation and updating EED
        $http.post('/api/clients/unreserve', {
            ClientID: client.ID,
            PhoneNumberID: $scope.reservation.PhoneNumberID,
            EED: new Date().toISOString()
        }).then(function () {
            $uibModalInstance.close();
        }).catch(function (err) {
            $scope.errorMessage = 'Unreserve failed: ' + (err.data?.Message || err.statusText);
        });
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
