var app = angular.module('deviceApp', ['ui.bootstrap']);

app.controller('ClientCtrl', function ($scope, $http, $uibModal) {
    $scope.Clients = [];
    $scope.filteredClients = [];

    $scope.loadClients = function () {
        $http.get("/api/clients").then(function (response) {
            $scope.Clients = response.data;
            $scope.filteredClients = $scope.Clients;
        });
    };

    $scope.filterClients = function () {
        $http.get('/api/clients/filter', {
            params: {
                name: $scope.searchName || null,
                type: $scope.searchType || null
            }
        }).then(function (response) {
            $scope.filteredClients = response.data;
        }, function (error) {
            console.error('Error fetching filtered clients:', error);
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
                clients: function(){
                    return $scope.Clients;
                }
            }
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

app.controller('ClientModalCtrl', function ($scope, $uibModalInstance, client,clients) {
    // Initialize modal data
    $scope.ModalClient = client
        ? angular.copy(client)
        : { Name: '', Type: null, BirthDate: null };

    $scope.IsEdit = client && client.ID !== undefined;
    $scope.OriginalName = client ? client.Name : '';


    if ($scope.ModalClient.Type !== null && $scope.ModalClient.Type !== undefined){
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
            client.BirthDate = `${ d.getFullYear() } -${ (d.getMonth() + 1).toString().padStart(2, '0') } -${ d.getDate().toString().padStart(2, '0') } 00:00:00`;
        }

        // Return data to parent controller to process
        $uibModalInstance.close(client);
    };

        // Cancel button logic
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
