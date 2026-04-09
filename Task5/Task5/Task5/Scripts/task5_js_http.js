var app = angular.module('deviceApp', ['ui.bootstrap']);

app.controller('DeviceCtrl', function ($scope, $http, $uibModal) {
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
                }
            }
        });

        modalInstance.result.then(function (resultDevice) {
            if (!resultDevice || !resultDevice.name.trim()) {
                alert("Device name cannot be blank.");
                return;
            }

            // Check for duplicate name (in current list only)
            const exists = $scope.devices.some(d => d.name === resultDevice.name && d.id !== resultDevice.id);
            if (exists) {
                alert("Device name already exists.");
                return;
            }

            if (resultDevice.id) {
                // Edit
                $http.put("/api/devices/update", resultDevice)
                    .then(function () {
                        $scope.loadDevices();
                    }, function (error) {
                        console.error("Update failed:", error);
                    });
            } else {
                // Add
                $http.post("/api/devices/add", resultDevice)
                    .then(function () {
                        $scope.loadDevices();
                    }, function (error) {
                        console.error("Add failed:", error);
                    });
            }
        });
    };

    // Load initial data
    $scope.loadDevices();
});

// Modal controller
app.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, device) {
    $scope.modalDevice = device || {};
    $scope.originalName = device ? device.name : "";
    $scope.isEdit = !!device;

    $scope.save = function () {
        $uibModalInstance.close($scope.modalDevice);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
