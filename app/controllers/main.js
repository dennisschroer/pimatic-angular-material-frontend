angular.module('pimaticApp').controller('MainController', function ($scope, $mdSidenav, $mdMedia, store) {
    $scope.$mdMedia = $mdMedia;

    /*$scope.getDevice = function(id){
        var device = null
        angular.forEach($scope.devices, function(value){
            if(value.id == id) device = value;
        });
        return device;
     };*/



    $scope.toggleMenu = function(){
        $mdSidenav('left').toggle();
    };
});