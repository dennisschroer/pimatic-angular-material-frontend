angular.module('pimaticApp').controller('MainController', ["$scope", "$mdSidenav", "$mdMedia", function ($scope, $mdSidenav, $mdMedia) {
    $scope.$mdMedia = $mdMedia;



    $scope.toggleMenu = function(){
        $mdSidenav('left').toggle();
    };
}]);