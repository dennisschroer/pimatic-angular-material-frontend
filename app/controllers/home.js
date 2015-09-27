angular.module('pimaticApp').controller('HomeController', ["$scope", "utils", function ($scope, utils) {
    $scope.selectedTab = 0;
    $scope.getUngroupedDeviceIds = utils.getUngroupedDeviceIds;

    /*$scope.selectPage = function(){
     console.log('selectPage', $routeParams.pageId);
     if(!angular.isUndefined($routeParams.pageId)){
     angular.forEach($scope.pages, function(value, key){
     if(value.id == $routeParams.pageId){
     $scope.selectedTab = key;
     }
     });
     }
     };

     $scope.tabSelected = function(page){
     console.log('tabSelected', page);
     $location.path('home/' + page.id);
     }

     $scope.$watch($scope.pages, function(newVal, oldVal){
     $scope.selectPage();
     }, true);*/
}]);