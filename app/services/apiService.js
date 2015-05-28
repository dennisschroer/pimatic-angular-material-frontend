angular.module('PimaticApp').factory('apiService', function($http, $q, $rootScope, $mdToast, pimaticHost){
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
            this.socket = io();

            this.socket.on('connect', function(){
                console.log('connect');
            });

            this.socket.on('callResult', function(msg){
                console.log('callResult', msg);
            });

            this.socket.on('hello', function(msg){
                console.log('hello', msg);
            });


            // Models
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


            // Change
            this.socket.on('deviceAttributeChanged', function(attrEvent){
                console.log('deviceAttributeChanged', attrEvent);
            });

            this.socket.on("deviceOrderChanged", function(order) {
                console.log("deviceOrderChanged", order);
            });

            this.socket.on("deviceChanged", function(device) {
                console.log(device)
            });
            this.socket.on("deviceRemoved", function(device) {
                console.log(device.id)
            });
            this.socket.on("deviceAdded", function(device) {
                console.log(device)
            });


            this.socket.on("pageChanged", function(page) {
                console.log(page)
            });
            this.socket.on("pageRemoved", function(page) {
                console.log(page.id)
            });
            this.socket.on("pageAdded", function(page) {
                console.log(page)
            });
            this.socket.on("pageOrderChanged", function(order) {
                console.log(order)
            });


            this.socket.on("groupChanged", function(group) {
                console.log(group)
            });
            this.socket.on("groupRemoved", function(group) {
                console.log(group.id)
            });
            this.socket.on("groupAdded", function(group) {
                console.log(group)
            });
            this.socket.on("groupOrderChanged", function(order) {
                console.log(order)
            });


            this.socket.on("ruleAdded", function(rule) {
                console.log(rule)
            });
            this.socket.on("ruleChanged", function(rule) {
                console.log(rule)
            });
            this.socket.on("ruleRemoved", function(rule) {
                console.log(rule.id)
            });
            this.socket.on("ruleOrderChanged", function(order) {
                console.log(order)
            });

            this.socket.on("variableAdded", function(variable) {
                console.log(variable)
            });
            this.socket.on("variableChanged", function(variable) {
                console.log(variable)
            });
            this.socket.on("variableValueChanged", function(varValEvent) {
                console.log(varValEvent.variableName, varValEvent.variableValue)
            });
            this.socket.on("variableRemoved", function(variable) {
                console.log(variable.name)
            });
            this.socket.on("variableOrderChanged", function(order) {
                console.log(order)
            });

            this.socket.on("updateProcessStatus", function(statusEvent) {
                console.log(statusEvent.status)
            });
            this.socket.on("updateProcessMessage", function(msgEvent) {
                console.log(msgEvent);
            });

            this.socket.on('messageLogged', function(entry) {
                console.log(entry);
                if(entry.level != debug){
                    // Show toast
                    $mdToast.show($mdToast.simple().content(entry.msg));
                }
                if(entry.level == error){

                }
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