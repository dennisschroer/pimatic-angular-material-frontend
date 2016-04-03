angular.module('pimaticApp.settings').controller('GroupsController', ["$scope", "$location", "store", function ($scope, $location, store) {
    $scope.edit = function (id) {
        $location.path('settings/groups/' + id);
    };

    $scope.getGroups = function () {
        return store.get('groups');
    };
}]);
