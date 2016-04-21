angular.module('pimaticApp').controller('ApplicationController', [
    "$scope",
    "$mdSidenav",
    "$mdMedia",
    "auth",
    "config",
    function ($scope, $mdSidenav, $mdMedia, auth, config) {
    $scope.auth = auth;
    $scope.config = config;

    $scope.$mdMedia = $mdMedia;

    $scope.toggleMenu = function () {
        $mdSidenav('left').toggle();
    };

    $scope.logout = function () {
        $scope.toggleMenu();
        auth.logout().then(function () {
            $scope.setState('unauthenticated');
        });
    };
}]);
