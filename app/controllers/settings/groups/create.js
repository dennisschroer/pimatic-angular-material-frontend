angular.module('pimaticApp.settings').controller('GroupsCreateController', ["$scope", "$location", function ($scope, $location) {
    $scope.group = {};

    $scope.cancel = function ($event) {
        $event.preventDefault();
        $location.path('/settings/groups');
    };

    $scope.save = function () {
        $scope.store.add('groups', $scope.group).then(function () {
            $location.path('/settings/groups');
        });
    };
}]);