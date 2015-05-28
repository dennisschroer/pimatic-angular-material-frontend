angular.module('PimaticApp').directive('deviceCard', function(){
    return {
        scope: {
            device: '=',
            variables: '='
        },
        //template: '<ng-include src="\'views/devices/\' + device.template + \'.html\'"></ng-include>',
        template: '<ng-include src="\'views/devices/device.html\'"></ng-include>',
        controller: function($scope){
            $scope.getAttribute = function(name) {
                var attribute = null
                angular.forEach($scope.device.attributes, function(value){
                    if(value.name == name) attribute = value;
                });
                return attribute;
            };


            $scope.getVariable = function(deviceId, attribute){
                var name = deviceId + '.' + attribute;
                var variable = null
                angular.forEach($scope.variables, function(value){
                    if(value.name == name) variable = value;
                });
                return variable;
            };
        }
    };
})