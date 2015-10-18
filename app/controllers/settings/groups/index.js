angular.module('pimaticApp.settings').controller('GroupsController', ["$scope", "$location", function ($scope, $location) {
    $scope.edit = function (id) {
        $location.path('/settings/groups/' + id);
    };
}]);