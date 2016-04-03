angular.module('pimaticApp').controller('HomeController', ["$scope", "$filter", "utils", function ($scope, $filter, utils) {
    $scope.selectedTab = 0;
    $scope.getUngroupedDeviceIds = utils.getUngroupedDeviceIds;

    /**
     * Get the ids of the device which are on the given page and in the given group.
     * If group is undefined, the ids of the ungrouped devices will be returned.
     * @param page The page displayed
     * @param group The group to display
     * @returns array A list of device ids
     */
    $scope.getDeviceIds = function (page, group) {
        if (angular.isUndefined(group)) {
            return $filter('intersect')($filter('extract')(page.devices, 'deviceId'), $scope.getUngroupedDeviceIds());
        } else {
            return $filter('intersect')($filter('extract')(page.devices, 'deviceId'), group.devices);
        }
    };

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