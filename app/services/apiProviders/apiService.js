angular.module('pimaticApp').factory('ApiService', function ($http, $q, $rootScope, toastService, $filter, pimaticHost, simulate) {
    /*$http({
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
    });*/

    var data = {
        devices: [],
        groups: [],
        pages: [],
        rules: [],
        variables: []
    };

    var apiService = {
        socket: null,

        init: function(){
            if(simulate){
                // Simulate by loading fixtures
                $http.get('fixtures/devices.json').success(function(devices){
                    angular.extend(data.devices, devices);
                });
                $http.get('fixtures/groups.json').success(function(groups){
                    angular.extend(data.groups, groups);
                });
                $http.get('fixtures/pages.json').success(function(pages){
                    angular.extend(data.pages, pages);
                });
                $http.get('fixtures/rules.json').success(function(rules){
                    angular.extend(data.rules, rules);
                });
                $http.get('fixtures/variables.json').success(function(variables){
                    angular.extend(data.variables, variables);
                });
            }else{
                this.setupSocket();
            }
        },

        setupSocket: function(){
            var service = this;
            this.socket = io(pimaticHost);

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
                service.watchDeviceAttributes();
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
                $rootScope.$apply(function () {
                    var device = apiService.getDevice(attrEvent.deviceId);
                    if (device != null) {
                        // Find attribute
                        angular.forEach(device.attributes, function (attribute) {
                            if (attribute.name == attrEvent.attributeName) {
                                attribute.$skipUpload = true;
                                attribute.value = attrEvent.value;
                                attribute.lastUpdate = attrEvent.time;
                            }
                        });
                    }
                });
            });

            this.socket.on("deviceOrderChanged", function(order) {
                console.log("deviceOrderChanged", order);
            });

            this.socket.on("deviceChanged", function(device) {
                console.log("deviceChanged", device)
            });
            this.socket.on("deviceRemoved", function(device) {
                console.log("deviceRemoved", device.id)
            });
            this.socket.on("deviceAdded", function(device) {
                console.log("deviceAdded", device)
            });


            this.socket.on("pageChanged", function(page) {
                console.log("pageChanged", page)
            });
            this.socket.on("pageRemoved", function(page) {
                console.log("pageRemoved", page.id)
            });
            this.socket.on("pageAdded", function(page) {
                console.log("pageAdded", page)
            });
            this.socket.on("pageOrderChanged", function(order) {
                console.log("pageOrderChanged", order)
            });


            this.socket.on("groupChanged", function(group) {
                console.log("groupChanged", group)
            });
            this.socket.on("groupRemoved", function(group) {
                console.log("groupRemoved", group.id)
            });
            this.socket.on("groupAdded", function(group) {
                console.log("groupAdded", group)
            });
            this.socket.on("groupOrderChanged", function(order) {
                console.log("groupOrderChanged", order)
            });

            this.socket.on("ruleAdded", function(rule) {
                console.log("ruleAdded", rule)
            });
            this.socket.on("ruleChanged", function(rule) {
                console.log("ruleChanged", rule)
            });
            this.socket.on("ruleRemoved", function(rule) {
                console.log("ruleRemoved", rule.id)
            });
            this.socket.on("ruleOrderChanged", function(order) {
                console.log("ruleOrderChanged", order)
            });

            this.socket.on("variableAdded", function(variable) {
                console.log("variableAdded", variable)
            });
            this.socket.on("variableChanged", function(variable) {
                console.log("variableChanged", variable)
            });
            this.socket.on("variableValueChanged", function(varValEvent) {
                console.log("variableValueChanged", varValEvent);
                $rootScope.$apply(function() {
                    var v = apiService.getVariable(varValEvent.variableName);
                    if (v != null) v.value = varValEvent.variableValue;
                });
            });
            this.socket.on("variableRemoved", function(variable) {
                console.log("variableRemoved", variable.name)
            });
            this.socket.on("variableOrderChanged", function(order) {
                console.log("variableOrderChanged", order)
            });

            this.socket.on("updateProcessStatus", function(statusEvent) {
                console.log("updateProcessStatus", statusEvent.status)
            });
            this.socket.on("updateProcessMessage", function(msgEvent) {
                console.log("updateProcessMessage", msgEvent);
            });

            this.socket.on('messageLogged', function(entry) {
                console.log("messageLogged", entry);
                if(entry.level != 'debug'){
                    // Show toast
                    toastService.show(entry.msg);
                }
                if(entry.level == 'error'){

                }
            });
        },

        /**
         * Add a watch to each variable. This watch watches the value of the variable.
         * If it is changed and it is not readonly, we need to send the value to the backend
         */
        watchDeviceAttributes: function () {
            /*var self = this;
             angular.forEach(data.devices, function(device){
             angular.forEach(device.attributes, function(attribute){
             // Assign the unregister function to the variable, so we can use it later
             attribute.$watcher = $rootScope.$watch(function(){return attribute.value}, function(oldValue, newValue){
             if(oldValue === newValue) return;
             if(!attribute.$skipUpload){
             // Upload change
             //console.log('updateDeviceAttribute', attribute, newValue);
             //self.updateVariable(variable, newValue);
             }
             attribute.$skipUpload = false;
             });
             });
             })*/
        },

        deviceAction: function (deviceId, actionName, params) {
            return $q(function (resolve, reject) {
                $http.get('/api/device/' + deviceId + '/' + actionName)
                    .success(function (data) {
                        if (data.success) {
                            resolve();
                        } else {
                            toastService.show('Failed to exectute ' + actionName + ' of ' + deviceId + ': ' + data.message);
                            reject();
                        }
                    }).error(function (data) {
                        toastService.show('Failed to exectute ' + actionName + ' of ' + deviceId + ': ' + data.message);
                        reject();
                    });
            });
        },

        getDevices: function(){
            return data.devices;
        },
        getDevice: function (id) {
            var found = $filter('filter')(data.devices, {id: id}, true);
            return found.length ? found[0] : null;
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
        },

        getVariable: function(name){
            var found = $filter('filter')(data.variables, {name: name}, true);
            return found.length ? found[0] : null;
        },

        /**
         * Send the variable update to the backend
         * @param variable
         * @param value
         */
        updateVariable: function (variable, value) {
            this.socket.emit('updateVariable', {
                name: variable.name,
                type: variable.type,
                value: value
            });
        }
    };

    return apiService;
});