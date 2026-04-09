var app = angular.module('deviceApp', ['ui.bootstrap']);

app.controller('PhoneCtrl', function ($scope, $http, $uibModal) {
    if (!sessionStorage.getItem('username')) {
        window.location.href = '/Account/Login';
    }
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
        $scope.filteredPhones = $scope.Phones.filter(function (p) {
            var numberMatch = !$scope.searchNumber || p.Number.toLowerCase().includes($scope.searchNumber.toLowerCase());
            var deviceMatch = !$scope.searchDeviceID || p.DeviceID == $scope.searchDeviceID;
            return numberMatch && deviceMatch;
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

    if (($scope.IsEdit) === 'true') {
        ModalPhoneNumber.DeviceID = parseInt(ModalPhoneNumber.DeviceID);
    }

    $scope.save = function () {
        if (!$scope.ModalPhoneNumber.Number || $scope.ModalPhoneNumber.Number.trim() === '') {
            alert("Phone number needs to be 8 digits.");
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

app.directive('deviceSelector', function ($http) {
    return {
        restrict: 'E',
        scope: {
            selectedDevice: '=',     // bound ng-model (should be device ID)
            isSearch: '@',           // "true" or undefined
            isEdit: '@'              // "true" or undefined
        },
        template: `
            <select class="form-control" 
                    ng-model="selectedDevice"
                    ng-options="device.id as device.name for device in devices">
                <option ng-if="isSearch === 'true'" value="">All devices</option>
            </select>
        `,
        link: function (scope, element, attrs) {
            scope.devices = [];

            // Fetch devices from API
            $http.get('/api/devices/getall').then(function (response) {
                scope.devices = response.data;

                // Ensure the device is prefilled after data arrives
                if (scope.selectedDevice && scope.isEdit === 'true') {
                    var exists = scope.devices.some(function (d) {
                        return d.id === scope.selectedDevice;
                    });

                    if (!exists) {
                        scope.selectedDevice = ''; // fallback
                    }
                }
            });

            // Optional: Expose device ID getter to parent
            scope.$parent.getDeviceData = function () {
                return scope.selectedDevice;
            };
        }
    };
});

app.directive('phoneNumberInput', function () {
    return {
        restrict: 'E',
        scope: {
            model: '=',
            isEdit: '=?'
        },
        template: `
        <div class="form-group">
            <label>Phone Number</label>
            <div class="form-inline">
                <select class="form-control input-sm"
                        ng-model="prefix"
                        required>
                    <option value="" disabled selected>--</option>
                    <option value="03">03</option>
                    <option value="70">70</option>
                    <option value="71">71</option>
                    <option value="76">76</option>
                    <option value="78">78</option>
                    <option value="81">81</option>
                </select>
                <input type="text"
                       class="form-control input-sm"
                       ng-model="suffix"
                       ng-pattern="/^\\d{6}$/"
                       maxlength="6"
                       placeholder="Enter 6 digits"
                       required />
            </div>
        </div>
        `,
        link: function (scope, element, attrs) {
            // Extract values on edit
            if (scope.model && scope.model.length === 8) {
                scope.prefix = scope.model.substring(0, 2);
                scope.suffix = scope.model.substring(2);
            }

            scope.$watchGroup(['prefix', 'suffix'], function (newValues) {
                var prefix = newValues[0];
                var suffix = newValues[1];

                if (/^\d{2}$/.test(prefix) && /^\d{6}$/.test(suffix)) {
                    scope.model = prefix + suffix;
                } else {
                    scope.model = null;
                }
            });
        }
    };
});