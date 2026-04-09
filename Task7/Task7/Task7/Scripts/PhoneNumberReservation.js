var app = angular.module('reservationApp', ['navbarShared']);

app.controller('ReservationCtrl', function ($scope, $http) {
    if (!sessionStorage.getItem('username')) {
        window.location.href = '/Account/Login';
    }
    $scope.reservations = [];
    $scope.filter = {
        clientId: null,
        phoneNumberId: null
    };

    $scope.getReservations = function () {
        $http.get("/api/reservations/get", {
            params: {
                clientId: $scope.filter.clientId,
                phoneNumberId: $scope.filter.phoneNumberId
            }
        }).then(function (res) {
            $scope.reservations = res.data;
        }, function (error) {
            console.error('Error fetching reservations:', error);
        });
    };

    $scope.getReservations();
});

app.directive('phonenumberSelector', function () {
    return {
        restrict: 'E',
        scope: {
            selectedId: '=',
            isSearch: '@'
        },
        template: `
            <label>Phone Number</label>
            <select class="form-control" ng-model="selectedId">
                <option value="" ng-if="isSearch">All</option>
                <option ng-repeat="p in phoneNumbers" value="{{p.ID}}">{{p.Number}}</option>
            </select>
        `,
        controller: function ($scope, $http) {
            $scope.phoneNumbers = [];

            $http.get("/api/phones").then(function (res) {
                $scope.phoneNumbers = res.data;
            });
        }
    };
});

app.directive('clientSelector', function () {
    return {
        restrict: 'E',
        scope: {
            ngModel: '=',
            isSearch: '@'
        },
        template:
            `<select class="form-control" ng-model="ngModel" ng-options="c.ID as c.Name for c in clients">
                <option value=""> All Clients </option>
            </select>`,
        controller: function ($scope, $http) {
            $scope.clients = [];

            $scope.getClients = function () {
                $http.get('/api/clients').then(function (response) {
                    $scope.clients = response.data;
                });
            };

            $scope.getClients();
        }
    };
});

app.directive('phoneNumberSelector', function () {
    return {
        restrict: 'E',
        scope: {
            ngModel: '=',
            isSearch: '@'
        },
        template:
            `<select class="form-control" ng-model="ngModel" ng-options="p.ID as p.Number for p in phoneNumbers">
                <option value=""> Select a phone number </option>
            </select>`,
        controller: function ($scope, $http) {
            $scope.phoneNumbers = [];

            $scope.getPhoneNumbers = function () {
                $http.get('/api/phones').then(function (response) {
                    $scope.phoneNumbers = response.data;
                });
            };

            $scope.getPhoneNumbers();
        }
    };
});