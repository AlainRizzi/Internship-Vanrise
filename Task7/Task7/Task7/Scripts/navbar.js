var app = angular.module('navbarShared', []);

app.controller('NavbarCtrl', function ($scope,$window) {
    $scope.logout = function () {
        sessionStorage.removeItem('username');
        $window.location.href = '/Account/Login';
    };
});