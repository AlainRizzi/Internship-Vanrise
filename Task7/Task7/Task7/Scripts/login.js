var loginApp = angular.module('loginApp', []);

loginApp.controller('LoginController', function ($scope, $http, $window) {
    $scope.username = '';
    $scope.password = '';
    $scope.errors = {};
    $scope.showPassword = false;

    $scope.togglePassword = function () {
        $scope.showPassword = !$scope.showPassword;
    };

    $scope.login = function () {
        // Reset errors
        $scope.errors = {};

        if (!$scope.username) {
            $scope.errors.username = "Username is required.";
        }

        if (!$scope.password) {
            $scope.errors.password = "Password is required.";
        }

        if (Object.keys($scope.errors).length > 0) {
            return; // Abort login
        }

        $http.post('/api/login/authenticate', {
            username: $scope.username,
            password: $scope.password
        }).then(function (res) {
            if (res.data.success) {
                sessionStorage.setItem('username', res.data.username);
                $window.location.href = "/Pages/task7.html";
            } else {
                $scope.errors.general = "Login failed.";
            }
        }).catch(function (err) {
            $scope.errors.general = err.data?.message || "Invalid username or password.";
        });
    };
});