angular.module('PimaticApp').factory('apiService', function($http, $q, $rootScope, pimaticHost){
    $http({
        method: 'POST',
        url: pimaticHost + '/login',
        data: {
            username: 'admin',
            password: 'admin'
        },
        transformRequest: function(obj) {
            var str = [];
            for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).success(function(data){
        console.log(data);
    });

    var data = {
        devices: [],
        groups: [],
        pages: [],
        rules: [],
        variables: []
    };


    var apiService = {
        socket: null,

        setupSocket: function(){
            this.socket = io(pimaticHost);

            this.socket.on('callResult', function(msg){
                console.log('callResult', msg);
            });

            this.socket.on('hello', function(msg){
                console.log('hello', msg);
            });

            this.socket.on('devices', function(devices){
                console.log('devices', devices);
                $rootScope.$apply(function(){
                    angular.extend(data.devices, devices);
                });
            });

            this.socket.on('rules', function(rules){
                console.log('rules', rules);
                $rootScope.$apply(function(){
                    angular.extend(data.rules, rules);
                });
            });

            this.socket.on('variables', function(variables){
                console.log('variables', variables);
                $rootScope.$apply(function(){
                    angular.extend(data.variables, variables);
                });
            });

            this.socket.on('pages', function(pages){
                console.log('pages', pages);
                // TODO remove pages first
                $rootScope.$apply(function(){
                    angular.extend(data.pages, pages);
                });

            });

            this.socket.on('groups', function(groups){
                console.log('groups', groups);
                $rootScope.$apply(function(){
                    angular.extend(data.groups, groups);
                });
            });

            this.socket.on('deviceAttributeChanged', function(attrEvent){
                console.log('deviceAttributeChanged', attrEvent);
            });

            this.socket.on('connect', function(){
                console.log('connect');
            });
        },

        getDevices: function(){
            return data.devices;
        },
        getGroups: function(){
            return data.groups;
        },
        getPages: function(){
            return data.pages;
        },
        getRules: function(){
            return data.rules;
        },
        getVariables: function(){
            return data.variables;
        }
    };

    return apiService;
});