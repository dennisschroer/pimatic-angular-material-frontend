angular.module('PimaticApp').directive('deviceCard', function(){
    return {
        scope: {
            device: '=',
            variables: '='
        },
        template: '{{device.template}}<ng-include src="\'views/devices/\' + device.template + \'.html\'"></ng-include>',
        //template: '<ng-include src="\'views/devices/device.html\'"></ng-include>',
        controller: function($scope, apiService){
            $scope.getAttribute = function(name) {
                var attribute = null
                angular.forEach($scope.device.attributes, function(value){
                    if(value.name == name) attribute = value;
                });
                return attribute;
            };


            $scope.getVariable = function(deviceId, attribute){
                return apiService.getVariable(deviceId + '.' + attribute);
            };
        }
    };
})