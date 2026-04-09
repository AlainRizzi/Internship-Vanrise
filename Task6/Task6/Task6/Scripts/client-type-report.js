app.controller('ClientTypeReportController', function ($scope, $http) {
    if (!sessionStorage.getItem('username')) {
        window.location.href = '/Account/Login';
    }
    $scope.filters = {
        type: null
    };

    $scope.reportData = [];

    $scope.getType = function () {
        return [{ id: 0, name: 'Individual' },
            { id: 1, name: 'Organization' }
        ];
    }

    $scope.getData = function () {
        $http.get('/api/reports/client-count-by-type', {
            params: { type: $scope.filters.type }
        }).then(function (response) {
            $scope.reportData = response.data;
        });
    };

    $scope.$watch('filters.type', function () {
        $scope.getData();
    });

    // Initial load
    $scope.getData();
});