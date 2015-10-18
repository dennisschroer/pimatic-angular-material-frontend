angular.module('pimaticApp.settings').controller('GroupsEditController', ["$scope", "$location", "$routeParams", "$mdDialog", "$translate", function ($scope, $location, $routeParams, $mdDialog, $translate) {
    // Create a copy of the group, so the original group is not edited directly.
    $scope.group = angular.copy($scope.store.get('groups', $routeParams.id));

    if ($scope.group === null) {
        $location.path('/settings/groups');
    }

    $scope.cancel = function ($event) {
        $event.preventDefault();
        $location.path('/settings/groups');
    };

    $scope.delete = function ($event) {
        $event.preventDefault();
        // Appending dialog to document.body to cover sidenav in docs app
        $translate(['DIALOG.CONFIRM_REMOVE_GROUP', 'ACTION.YES', 'ACTION.NO']).then(function(translations){
            var confirm = $mdDialog.confirm()
                .title(translations['DIALOG.CONFIRM_REMOVE_GROUP'])
                .content($scope.group.id)
                .ariaLabel('Delete group')
                .ok(translations['ACTION.YES'])
                .cancel(translations['ACTION.NO'])
                .targetEvent($event);
            $mdDialog.show(confirm).then(function () {
                // Delete group
                $scope.store.remove('groups', $scope.group).then(function () {
                    $location.path('/settings/groups');
                });
            });
        });
    };

    $scope.save = function () {
        $scope.store.update('groups', $scope.group).then(function () {
            $location.path('/settings/groups');
        });
    };
}]);