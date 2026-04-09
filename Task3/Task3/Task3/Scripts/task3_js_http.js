var deviceApp = angular.module('deviceApp', ['ui.bootstrap', 'ngAnimate']);

deviceApp.controller('DeviceCtrl', ['$scope', '$uibModal', '$http', function ($scope, $uibModal, $http) {
    $scope.devices = [];
    $scope.filteredDevices = [];
    $scope.deviceName = '';

    $scope.loadDevices = function () {
        $http.get('/api/devices')
            .then(function (response) {
                $scope.devices = response.data;
                $scope.filteredDevices = angular.copy($scope.devices);
            }, function (error) {
                console.error("Failed to load devices:", error);
            });
    };

    $scope.loadDevices(); // Initial load

    $scope.searchDevices = function () {
        var query = $scope.deviceName.trim();

        if (!query) {
            $scope.filteredDevices = angular.copy($scope.devices);
            return;
        }

        $http.get('/api/devices/filter?name=' + encodeURIComponent(query))
            .then(function (response) {
                $scope.filteredDevices = response.data;
            }, function (error) {
                console.error("Search failed:", error);
                alert("Failed to search devices.");
            });
    };

    $scope.openModal = function (device) {
        $scope.isEdit = !!device;
        $scope.modalDevice = device ? angular.copy(device) : { id: null, name: '' };
        $scope.originalName = device ? device.name : '';

        $scope.modalInstance = $uibModal.open({
            templateUrl: 'deviceModal.html',
            scope: $scope,
            backdrop: true,
            animation: true
        });
    };

    $scope.save = function () {
        var name = $scope.modalDevice.name;

        if (!name || name.trim() === '') {
            alert("Device name cannot be blank.");
            return;
        }

        var trimmed = $scope.modalDevice.name.trim();

        var duplicate = $scope.devices.some(d =>
            d.name.toLowerCase() === trimmed.toLowerCase() &&
            (!$scope.isEdit || d.id !== device.id) // allow same name if editing same device
        );

        if (duplicate) {
            alert("Device name already exists!");
            return;
        }

        if ($scope.isEdit) {
            $http.put('/api/devices/' + $scope.modalDevice.id, $scope.modalDevice)
                .then(function (response) {
                    let updated = response.data;
                    let index = $scope.devices.findIndex(d => d.id === updated.id);
                    if (index !== -1) {
                        $scope.devices[index] = updated;
                        $scope.filteredDevices = angular.copy($scope.devices);
                    }
                    $scope.modalInstance.close();
                }, function (error) {
                    alert("Failed to update device.");
                });
        } else {
            $http.post('/api/devices', $scope.modalDevice)
                .then(function (response) {
                    $scope.devices.push(response.data);
                    $scope.filteredDevices = angular.copy($scope.devices);
                    $scope.modalInstance.close();
                }, function (error) {
                    alert("Failed to add device.");
                });
        }
    };

    $scope.cancel = function () {
        $scope.modalInstance.dismiss('cancel');
    };
}]);
