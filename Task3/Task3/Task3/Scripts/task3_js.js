var deviceApp = angular.module('deviceApp', ['ui.bootstrap', 'ngAnimate']);
deviceApp.controller('DeviceCtrl', ['$scope', '$uibModal', function ($scope, $uibModal) {
    $scope.devices = [
        { id: 1, name: "Samsung A50" },
        { id: 2, name: "iPhone 13" },
        { id: 3, name: "iPhone 14 Pro" },
        { id: 4, name: "Huawei P30" },
        { id: 5, name: "LG G8 ThinQ" }
    ];

    $scope.filteredDevices = angular.copy($scope.devices);


    // Open modal for Add or Edit
    $scope.openModal = function (device) {
        var modalInstance = $uibModal.open({
            animation: true,
            backdrop: true,
            keyboard:true,
            templateUrl: 'deviceModal.html',
            controller: 'ModalInstanceCtrl',
            resolve: {
                device: function () {
                    // pass a copy if editing, or a blank object if adding
                    return device ? angular.copy(device) : { name: '' };
                },
                isEdit: function () {
                    return !!device;
                },
                devices: function () {
                    return $scope.devices;
                }
            }
        });

        modalInstance.result.then(function (result) {
            if (result.isEdit) {
                var index = $scope.devices.findIndex(d => d.id === result.device.id);
                if (index !== -1) $scope.devices[index].name = result.device.name;
            } else {
                var exists = $scope.devices.some(d => d.name.toLowerCase() === result.device.name.toLowerCase());
                if (exists) return;
                var nextId = $scope.devices.length > 0 ? $scope.devices[$scope.devices.length - 1].id + 1 : 1;
                result.device.id = nextId;
                $scope.devices.push(result.device);
            }

            $scope.filteredDevices = angular.copy($scope.devices);
        });
    };

    $scope.searchDevices = function () {
        var query = $scope.deviceName.trim().toLowerCase();
        $scope.filteredDevices = $scope.devices.filter(function (d) {
            return d.name.toLowerCase().includes(query);
        });
    };
}])

    .controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, device, isEdit, devices) {
        $scope.modalDevice = device;
        $scope.isEdit = isEdit;
        $scope.originalName = isEdit ? device.name : '';

        $scope.save = function () {
            var trimmed = $scope.modalDevice.name.trim();
            if (!trimmed) {
                alert("Device name cannot be blank!");
                return;
            }

            var duplicate = devices.some(d =>
                d.name.toLowerCase() === trimmed.toLowerCase() &&
                (!isEdit || d.id !== device.id) // allow same name if editing same device
            );

            if (duplicate) {
                alert("Device name already exists!");
                return;
            }

            $scope.modalDevice.name = trimmed;
            $uibModalInstance.close({ device: $scope.modalDevice, isEdit: isEdit });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
