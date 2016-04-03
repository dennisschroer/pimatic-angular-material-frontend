angular.module('pimaticApp.settings').controller('GroupsEditController', [
    "$scope",
    "$location",
    "$routeParams",
    "$mdDialog",
    "toast",
    "store",
    function ($scope, $location, $routeParams, $mdDialog, toast, store) {
        $scope.group = angular.copy(store.get('groups', $routeParams.id));

        if ($scope.group === null) {
            $location.path('settings/groups');
        }

        $scope.cancel = function ($event) {
            $event.preventDefault();
            $location.path('settings/groups');
        };

        $scope.delete = function ($event) {
            var confirm;

            $event.preventDefault();
            // Appending dialog to document.body to cover sidenav in docs app
            confirm = $mdDialog.confirm()
                .title('Are you sure you want to delete this group?')
                .content($scope.group.id)
                .ariaLabel('Delete group')
                .ok('Yes')
                .cancel('No')
                .targetEvent($event);
            $mdDialog.show(confirm).then(function () {
                // Delete group
                store.remove('groups', $scope.group).then(function () {
                    $location.path('settings/groups');
                }, function (message) {
                    toast.error('Deleting group failed: ' + message);
                });
            });
        };

        $scope.save = function () {
            store.update('groups', $scope.group).then(function () {
                $location.path('settings/groups');
            }, function (message) {
                toast.error('Saving group failed: ' + message);
            });
        };
    }
]);
