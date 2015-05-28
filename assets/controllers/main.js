angular.module('PimaticApp').controller('MainController', function($scope, apiService){
    $scope.init = function(){
        apiService.setupSocket();
        $scope.pages = apiService.getPages();
    };

    $scope.init();
});