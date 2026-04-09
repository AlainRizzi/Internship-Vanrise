var app = angular.module('deviceApp', ['ui.bootstrap']);

app.controller('PhoneCtrl', function ($scope, $http, $uibModal) {
    $scope.Phones = [];
    $scope.Devices = [];
    $scope.filteredPhones = [];

    $scope.loadPhones = function () {
        $http.get("/api/phones").then(function (response) {
            $scope.Phones = response.data;
            $scope.filteredPhones = $scope.Phones;
        });
    };

    $scope.loadDevices = function () {
        $http.get("/api/devices/getall").then(function (response) {
            $scope.Devices = response.data;
        });
    };

    $scope.filterPhones = function () {
        $http.get('/api/phones/filter', {
            params: {
                number: $scope.searchNumber || null,
                deviceID: $scope.searchDeviceID || null
            }
        }).then(function (response) {
            $scope.filteredPhones = response.data;
        }, function (error) {
            console.error('Error fetching filtered phones:', error);
        });
    };

    $scope.openModal = function (phoneNumber) {
        var modalInstance = $uibModal.open({
            templateUrl: 'phoneModal.html',
            controller: 'PhoneModalCtrl',
            resolve: {
                phoneNumber: function () {
                    return angular.copy(phoneNumber);
                },
                Devices: function () {
                    return $scope.Devices;
                }
            }
        });

        modalInstance.result.then(function (resultPhone) {
            var exists = $scope.Phones.some(function (p) {
                return p.Number === resultPhone.Number && p.ID !== resultPhone.ID;
            });

            if (exists) {
                alert("Phone number already exists.");
                return;
            }

            if (resultPhone.ID) {
                $http.put("/api/phones/" + resultPhone.ID, resultPhone).then($scope.loadPhones);
            } else {
                $http.post("/api/phones", resultPhone).then($scope.loadPhones);
            }
        });
    };

    $scope.loadPhones();
    $scope.loadDevices();
});

app.controller('PhoneModalCtrl', function ($scope, $uibModalInstance, phoneNumber, Devices) {
    $scope.Devices = Devices;
    $scope.ModalPhoneNumber = phoneNumber || { Number: '', DeviceID: null };
    $scope.IsEdit = phoneNumber && phoneNumber.ID !== undefined;
    $scope.OriginalNumber = phoneNumber ? phoneNumber.Number : '';

    $scope.save = function () {
        if (!$scope.ModalPhoneNumber.Number || $scope.ModalPhoneNumber.Number.trim() === '') {
            alert("Phone number cannot be empty.");
            return;
        }

        if (!$scope.ModalPhoneNumber.DeviceID) {
            alert("Please select a device.");
            return;
        }

        $uibModalInstance.close($scope.ModalPhoneNumber);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
