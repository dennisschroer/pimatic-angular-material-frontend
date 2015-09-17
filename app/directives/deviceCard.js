angular.module('pimaticApp').directive('deviceCard', ['toast', function (toast) {
    return {
        scope: {
            device: '='
        },
        template: '<ng-include src="\'partials/devices/\' + device.template + \'.html\'"></ng-include>',
        //template: '<ng-include src="\'views/devices/device.html\'"></ng-include>',
        controller: function ($scope) {
            $scope.getAttribute = function(name) {
                var attribute = null;
                angular.forEach($scope.device.attributes, function(value){
                    if(value.name == name) {
                        attribute = value;
                    }
                });
                return attribute;
            };

            /*$scope.initAttributeWatchers = function(){
             $scope.$watch(function(){ return $scope.device; }, function(newVal){
             angular.forEach($scope.device.attributes, function(attribute){
             $scope.$watch(function(){return attribute.value}, function(newVal, oldVal){
             // Do nothing on startup
             if(newVal === oldVal) return;

             // If this is a rollback or an update from the backend, do nothing
             if(attribute.$skipUpload){
             attribute.$skipUpload = false;
             return;
             }

             // Broadcast an event
             var event = $scope.$broadcast('deviceAttributeChange', attribute, newVal, oldVal);
             /*if(event.defaultPrevented){
             console.log('rollback');
             // Rollback
             // Changing the value will recursively call this listener. To avoid re-emiting, we have
             // to set a flag that a rollback is occuring
             attribute.$skipUpload = true;
             attribute.value = oldVal;
             }else{
             toast.show('Done');
             }*
             });
             });
             });
            };

             $scope.initAttributeWatchers();*/
        }
    };
}]);