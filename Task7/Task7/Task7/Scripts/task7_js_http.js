var app = angular.module('deviceApp', ['ui.bootstrap', 'navbarShared']);

app.controller('DeviceCtrl', function ($scope, $http, $uibModal) {
    if (!sessionStorage.getItem('username')) {
        window.location.href = '/Account/Login';
    }
    $scope.devices = [];
    $scope.filteredDevices = [];
    $scope.deviceName = "";

    // Load all devices
    $scope.loadDevices = function () {
        $http.get("/api/devices/getall")
            .then(function (response) {
                $scope.devices = response.data;
                $scope.filteredDevices = $scope.devices;
            }, function (error) {
                console.error("Error loading devices:", error);
            });
    };

    // Search devices using GET filter
    $scope.searchDevices = function () {
        const filter = $scope.deviceName;
        const url = filter ? "/api/devices/filter?name=" + encodeURIComponent(filter) : "/api/devices/getall";

        $http.get(url)
            .then(function (response) {
                $scope.filteredDevices = response.data;
            }, function (error) {
                console.error("Search failed:", error);
            });
    };

    // Open modal for add/edit
    $scope.openModal = function (device) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'deviceModal.html',
            controller: 'ModalInstanceCtrl',
            resolve: {
                device: function () {
                    return angular.copy(device); // undefined for add
                },
                devices: function () {
                    return $scope.devices;
                }
            }
        });

        modalInstance.result.then(function (resultDevice) {
            if (resultDevice.id) {
                $http.put("/api/devices/update", resultDevice)
                    .then($scope.loadDevices)
                    .catch(function (err) {
                        console.error("Update failed:", err);
                    });
            } else {
                $http.post("/api/devices/add", resultDevice)
                    .then($scope.loadDevices)
                    .catch(function (err) {
                        console.error("Add failed:", err);
                    });
            }
        });
    };

    // Load initial data
    $scope.loadDevices();
});

// Modal controller
app.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, device, devices) {
    $scope.modalDevice = device || {};
    $scope.originalName = device ? device.name : "";
    $scope.isEdit = !!device;
    $scope.errorMessage = '';
    $scope.allDevices = devices; // Injected full list

    $scope.save = function () {
        const name = $scope.modalDevice.name?.trim();

        if (!name) {
            $scope.errorMessage = "Device name cannot be empty.";
            return;
        }

        // Check for duplicate name
        const duplicate = $scope.allDevices.some(function (d) {
            return d.name === name && d.id !== $scope.modalDevice.id;
        });

        if (duplicate) {
            $scope.errorMessage = "Device name already exists.";
            return;
        }

        $scope.errorMessage = '';
        $uibModalInstance.close($scope.modalDevice);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});