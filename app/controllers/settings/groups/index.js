angular.module('pimaticApp.settings').controller('GroupsController', function ($scope, $location) {
    $scope.edit = function (id) {
        $location.path('settings/groups/' + id);
    }
});