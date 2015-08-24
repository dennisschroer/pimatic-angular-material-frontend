angular.module('pimaticApp').factory('apiProvider', function ($http, $q, baseProvider, pimaticHost) {

    var data = {};

    var singulars = {
        'groups': 'group'
    };

    return angular.extend({}, baseProvider, {

        init: function (store) {
            this.store = store;
            this.setupSocket();
        },

        setupSocket: function () {
            this.socket = io(pimaticHost);

            this.socket.on('connect', function () {
                console.log('connect');
            });

            this.socket.on('callResult', function (msg) {
                console.log('callResult', msg);
            });

            this.socket.on('hello', function (msg) {
                console.log('hello', msg);
            });


            // Models
            this.socket.on('devices', function (devices) {
                console.log('devices', devices);
                $rootScope.$apply(function () {
                    data.devices = devices;
                });
            });

            this.socket.on('rules', function (rules) {
                console.log('rules', rules);
                $rootScope.$apply(function () {
                    data.rules = rules;
                });
            });

            this.socket.on('variables', function (variables) {
                console.log('variables', variables);
                $rootScope.$apply(function () {
                    data.variables = variables;
                });
            });

            this.socket.on('pages', function (pages) {
                console.log('pages', pages);
                $rootScope.$apply(function () {
                    data.pages = pages;
                });

            });

            this.socket.on('groups', function (groups) {
                console.log('groups', groups);
                $rootScope.$apply(function () {
                    data.groups = groups;
                });
            });


            // Change
            this.socket.on('deviceAttributeChanged', function (attrEvent) {
                console.log('deviceAttributeChanged', attrEvent);
                $rootScope.$apply(function () {
                    var device = store.get('devices', attrEvent.deviceId);
                    if (device != null) {
                        // Find attribute
                        angular.forEach(device.attributes, function (attribute) {
                            if (attribute.name == attrEvent.attributeName) {
                                attribute.value = attrEvent.value;
                                attribute.lastUpdate = attrEvent.time;
                            }
                        });
                    }
                });
            });

            this.socket.on("deviceOrderChanged", function (order) {
                console.log("deviceOrderChanged", order);
            });

            this.socket.on("deviceChanged", function (device) {
                console.log("deviceChanged", device)
            });
            this.socket.on("deviceRemoved", function (device) {
                console.log("deviceRemoved", device.id)
            });
            this.socket.on("deviceAdded", function (device) {
                console.log("deviceAdded", device)
            });


            this.socket.on("pageChanged", function (page) {
                console.log("pageChanged", page)
            });
            this.socket.on("pageRemoved", function (page) {
                console.log("pageRemoved", page.id)
            });
            this.socket.on("pageAdded", function (page) {
                console.log("pageAdded", page)
            });
            this.socket.on("pageOrderChanged", function (order) {
                console.log("pageOrderChanged", order)
            });


            this.socket.on("groupChanged", function (group) {
                console.log("groupChanged", group)
            });
            this.socket.on("groupRemoved", function (group) {
                console.log("groupRemoved", group.id)
            });
            this.socket.on("groupAdded", function (group) {
                console.log("groupAdded", group)
            });
            this.socket.on("groupOrderChanged", function (order) {
                console.log("groupOrderChanged", order)
            });

            this.socket.on("ruleAdded", function (rule) {
                console.log("ruleAdded", rule)
            });
            this.socket.on("ruleChanged", function (rule) {
                console.log("ruleChanged", rule)
            });
            this.socket.on("ruleRemoved", function (rule) {
                console.log("ruleRemoved", rule.id)
            });
            this.socket.on("ruleOrderChanged", function (order) {
                console.log("ruleOrderChanged", order)
            });

            this.socket.on("variableAdded", function (variable) {
                console.log("variableAdded", variable)
            });
            this.socket.on("variableChanged", function (variable) {
                console.log("variableChanged", variable)
            });
            this.socket.on("variableValueChanged", function (varValEvent) {
                console.log("variableValueChanged", varValEvent);
                $rootScope.$apply(function () {
                    var v = store.get('variables', varValEvent.variableName);
                    if (v != null) v.value = varValEvent.variableValue;
                });
            });
            this.socket.on("variableRemoved", function (variable) {
                console.log("variableRemoved", variable.name)
            });
            this.socket.on("variableOrderChanged", function (order) {
                console.log("variableOrderChanged", order)
            });

            this.socket.on("updateProcessStatus", function (statusEvent) {
                console.log("updateProcessStatus", statusEvent.status)
            });
            this.socket.on("updateProcessMessage", function (msgEvent) {
                console.log("updateProcessMessage", msgEvent);
            });

            this.socket.on('messageLogged', function (entry) {
                console.log("messageLogged", entry);
                if (entry.level != 'debug') {
                    // Show toast
                    toastService.show(entry.msg);
                }
                if (entry.level == 'error') {

                }
            });
        },

        deviceAction: function (deviceId, actionName, params) {
            return $q(function (resolve, reject) {
                $http.get(pimaticHost + '/api/device/' + deviceId + '/' + actionName)
                    .success(function (data) {
                        if (data.success) {
                            resolve();
                        } else {
                            reject();
                        }
                    }).error(function (data) {
                        reject();
                    });
            });
        },

        /**
         * Add a new object.
         * @param type The type of the object (e.g. "groups").
         * @param object The object to add.
         * @return promise A promise which is resolved when the object is added.
         */
        add: function (type, object) {
            return $q(function (resolve, reject) {
                var singular = singulars[type];
                $http.post(pimaticHost + '/api/' + type + '/' + object.id, {singular: object}).then(function (response) {
                    resolve(response[singular]);
                }, function (response) {
                    // TODO extract message
                    reject(response);
                });
            });
        },

        /**
         * Update an existing object.
         * @param type The type of the object (e.g. "groups").
         * @param object The object to update.
         * @return promise A promise. When resolved, the final object should be passed as parameter. When rejected, an
         * error message should be passed as parameter.
         */
        update: function (type, object) {
            return $q(function (resolve, reject) {
                var singular = singulars[type];
                $http.patch(pimaticHost + '/api/' + type + '/' + object.id, {singular: object}).then(function (response) {
                    resolve(response[singular]);
                }, function (response) {
                    // TODO extract message
                    reject(response);
                });
            });
        },

        /**
         * Remove an existing object.
         * @param type The type of the object (e.g. "groups").
         * @param object The object to remove.
         * @return promise A promise. When resolved, the removed should be passed as parameter. When rejected, an
         * error message should be passed as parameter.
         */
        remove: function (type, object) {
            return $q(function (resolve, reject) {
                $http.delete(pimaticHost + '/api/' + type + '/' + object.id).then(function (response) {
                    resolve(response['removed']);
                }, function (response) {
                    // TODO extract message
                    reject(response);
                });
            });
        },

        /**
         * Load all objects of a certain type.
         * @param type The type to load the objects of.
         * @return promise promise A promise which is resolved when the data is loaded.
         */
        load: function (type) {
            return $q(function (resolve) {
                // TODO timeout?
                while (!type in data) {
                }
                resolve(data[type]);
            })
        }
    });
});