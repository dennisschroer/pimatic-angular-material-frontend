angular.module('pimaticApp.settings').controller('GroupsCreateController', function ($scope, $location, toast) {
    $scope.group = {};

    $scope.cancel = function ($event) {
        $event.preventDefault();
        $location.path('settings/groups');
    }

    $scope.save = function () {
        $scope.store.add('groups', $scope.group).then(function () {
            $location.path('settings/groups');
        }, function (message) {
            toast.error('Saving group failed: ' + message);
        });
    }
});