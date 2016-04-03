angular.module('pimaticApp').controller('MainController', ["$scope", "$mdSidenav", "$mdMedia", "auth", function ($scope, $mdSidenav, $mdMedia, auth) {
    $scope.auth = auth;

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
