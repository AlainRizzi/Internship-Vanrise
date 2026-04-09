app.controller('PhoneReservationReportController', function ($scope, $http) {
    if (!sessionStorage.getItem('username')) {
        window.location.href = '/Account/Login';
    }
    $scope.filters = {
        deviceId: null,
        status: ''
    };

    $scope.data = [];

    $scope.getData = function () {
        $http.get('/api/reports/phone-number-reservations', {
            params: {
                DeviceID: $scope.filters.deviceId,
                Status: $scope.filters.status
            }
        }).then(function (response) {
            $scope.data = response.data;
        });
    };

    $scope.$watchGroup(['filters.deviceId', 'filters.status'], function () {
        $scope.getData();
    });

    // Initial load
    $scope.getData();
});