var loginApp = angular.module('loginApp', []);

loginApp.controller('LoginController', function ($scope, $http, $window) {
    $scope.username = '';
    $scope.password = '';
    $scope.errorMessage = '';
    $scope.showPassword = false;

    $scope.togglePassword = function () {
        $scope.showPassword = !$scope.showPassword;
    };

    $scope.login = function () {
        if (!$scope.username || !$scope.password) {
            $scope.errorMessage = "Username and password are required.";
            return;
        }

        $http.post('/api/login/authenticate', {
            username: $scope.username,
            password: $scope.password
        }).then(function (res) {
            if (res.data.success) {
                sessionStorage.setItem('username', res.data.username);
                $window.location.href = "/Pages/task6.html";
            } else {
                $scope.errorMessage = "Login failed.";
            }
        }).catch(function (err) {
            $scope.errorMessage = err.data?.message || "Invalid username or password.";
        });
    };
});