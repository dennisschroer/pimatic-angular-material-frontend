angular.module('pimaticApp.settings').controller('GroupsEditController', function ($scope, $location, $routeParams, $mdDialog, toast) {
    $scope.group = angular.copy($scope.store.get('groups', $routeParams.id));

    if ($scope.group['$dummy']) {
        $location.path('settings/groups');
    }

    $scope.cancel = function ($event) {
        $event.preventDefault();
        $location.path('settings/groups');
    };

    $scope.delete = function ($event) {
        $event.preventDefault();
        // Appending dialog to document.body to cover sidenav in docs app
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to delete this group?')
            .content($scope.group.id)
            .ariaLabel('Delete group')
            .ok('Yes')
            .cancel('No')
            .targetEvent($event);
        $mdDialog.show(confirm).then(function () {
            // Delete group
            $scope.store.remove('groups', $scope.group).then(function () {
                $location.path('settings/groups');
            }, function (message) {
                toast.error('Deleting group failed: ' + message);
            });
        });
    };

    $scope.save = function () {
        $scope.store.update('groups', $scope.group).then(function () {
            $location.path('settings/groups');
        }, function (message) {
            toast.error('Saving group failed: ' + message);
        });
    };
});