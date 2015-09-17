angular.module('pimaticApp').controller('LoginController', ["$scope", "auth", function ($scope, auth) {
    if (auth.user !== null) {
        auth.redirect();
    }

    $scope.form = {};

    $scope.login = function(){
        console.log('login');
        $scope.form.message = null;
        $scope.form.busy = true;

        auth.login($scope.form.username, $scope.form.password, $scope.form.rememberMe).then(function(){
            $scope.form.busy = false;
        }, function(message){
            $scope.form.message = message;
            $scope.form.busy = false;
        });
    };
}]);