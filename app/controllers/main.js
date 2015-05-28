angular.module('PimaticApp').controller('MainController', function($scope, apiService){
    $scope.init = function(){
        /*var socket = io.connect('http://localhost:8080', {
            query: 'username=admin&password=admin'
        });

        socket.on('connect', function(){
            console.log('connect');
            socket.emit('test', {query:1});
        })*/

        apiService.setupSocket();
        $scope.pages = apiService.getPages();
        $scope.devices = apiService.getDevices();
    };

    $scope.getDevice = function(id){
        var device = null
        angular.forEach($scope.devices, function(value){
            if(value.id == id) device = value;
        });
        return device;
    }

    $scope.init();
});