angular.module('pimaticApp.api').factory('websocketApi', ['$http', '$q', '$rootScope', '$log', 'baseApi', 'pimaticHost', 'toast', function ($http, $q, $rootScope, $log, baseProvider, pimaticHost, toast) {

    /*
     * Data via this provider comes asynchronously via a websocket, while the data is requested by the application
     * via the load method. This can lead to 2 situations:
     * 1. The application requests data, but the data is not there yet. A promise is returned and saved in the cache
     *    When the data is available, the promise is resolved.
     * 2. The data comes in, but there is no promise to be resolved. The data is temporarily stored in the cache.
     *    When the load() method is called while the data is already in the cache, the returned promise is resolved
     *    immediately and the cache is cleaned.
     */
    var cache = {};

    var singulars = {
        'groups': 'group'
    };

    return angular.extend({}, baseProvider, {
        socket: null,

        /**
         * Start the provider and reset all caches
         */
        start: function () {
            cache = {};
            this.setupSocket();
        },

        /**
         * Apply changes by executing the given function
         * @param fn
         */
        apply: function (fn) {
            // This is a little hack which makes sure that $digest is only called if it is not already running
            // This is based on the solution found here:
            // http://stackoverflow.com/questions/14700865/node-js-angularjs-socket-io-connect-state-and-manually-disconnect
            //
            // It seems that sometimes after executing a device action (for example by calling GET api/device/dummy/turnOn),
            // the response of this call comes at the same time (or in the same cycle) as the received updated via the
            // socket, resulting in errors if you call $apply there. I'm not sure if it also happens in other cases.
            if ($rootScope.$$phase) {
                fn();
            } else {
                $rootScope.$apply(fn);
            }
        },

        setupSocket: function () {
            var store = this.store;
            var self = this;

            if (this.socket !== null) {
                this.socket.disconnect();
            }

            this.socket = io(pimaticHost, {
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 3000,
                timeout: 20000,
                forceNew: true
            });

            // Handshaking messages
            this.socket.on('connect', function () {
                $log.debug('websocketApi', 'connect');

                self.socket.emit('call', {
                    id: 'errorMessageCount',
                    action: 'queryMessagesCount',
                    params: {
                        criteria: {
                            level: 'error'
                        }
                    }
                });

                self.socket.emit('call', {
                    id: 'guiSettings',
                    action: 'getGuiSettings',
                    params: {}
                });

                self.socket.emit('call', {
                    id: 'updateProcessStatus',
                    action: 'getUpdateProcessStatus',
                    params: {}
                });
            });

            this.socket.on('error', function (error) {
                $log.debug('websocketApi', 'error', error);
                self.apply(function () {
                    //self.store.setUser(msg);
                    // This triggers a redirect
                    $rootScope.setState('unauthenticated');
                });
            });

            this.socket.on('disconnect', function () {
                $log.debug('websocketApi', 'disconnect');
            });


            this.socket.on('hello', function (msg) {
                $log.debug('websocketApi', 'hello', msg);
                self.apply(function () {
                    self.store.setUser(msg);
                    // This triggers a redirect
                    $rootScope.setState('done');
                });
            });

            // Call result
            this.socket.on('callResult', function (msg) {
                $log.debug('websocketApi', 'callResult', msg);

                switch (msg.id) {
                    case 'errorMessageCount':
                        //if(msg.success)
                        //pimatic.errorCount(msg.result.count);
                        break;
                    case 'guiSettings':
                        /*if(msg.success)
                         guiSettings = msg.result.guiSettings
                         angular.forEach(guiSettings.defaults, function(value, key){
                         unless guiSettings.config[k]?
                         guiSettings.config[k] = v
                         }
                         pimatic.guiSettings(guiSettings.config)*/
                        break;
                    case 'updateProcessStatus':
                        /*info = msg.result.info
                         pimatic.updateProcessStatus(info.status)
                         pimatic.updateProcessMessages(info.messages)*/
                        break;
                }
            });


            // Incoming models
            this.socket.on('devices', function (devices) {
                $log.debug('websocketApi', 'devices', devices);
                self.handleIncomingData('devices', devices);
            });

            this.socket.on('rules', function (rules) {
                $log.debug('websocketApi', 'rules', rules);
                self.handleIncomingData('rules', rules);
            });

            this.socket.on('variables', function (variables) {
                $log.debug('websocketApi', 'variables', variables);
                self.handleIncomingData('variables', variables);
            });

            this.socket.on('pages', function (pages) {
                $log.debug('websocketApi', 'pages', pages);
                self.handleIncomingData('pages', pages);
            });

            this.socket.on('groups', function (groups) {
                $log.debug('websocketApi', 'groups', groups);
                self.handleIncomingData('groups', groups);
            });


            // Changes
            this.socket.on('deviceAttributeChanged', function (attrEvent) {
                $log.debug('websocketApi', 'deviceAttributeChanged', attrEvent);
                self.apply(function () {
                    var device = store.get('devices', attrEvent.deviceId);
                    if (device !== null) {
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
            this.socket.on("variableValueChanged", function (varValEvent) {
                $log.debug('websocketApi', "variableValueChanged", varValEvent);
                self.apply(function () {
                    var v = store.get('variables', varValEvent.variableName);
                    if (v !== null) {
                        v.value = varValEvent.variableValue;
                    }
                });
            });

            // Devices
            this.socket.on("deviceChanged", function (device) {
                $log.debug('websocketApi', "deviceChanged", device);
                self.apply(function () {
                    store.update('devices', device, true);
                });
            });
            this.socket.on("deviceRemoved", function (device) {
                $log.debug('websocketApi', "deviceRemoved", device);
                self.apply(function () {
                    store.remove('devices', device, true);
                });
            });
            this.socket.on("deviceAdded", function (device) {
                $log.debug('websocketApi', "deviceAdded", device);
                self.apply(function () {
                    store.add('devices', device, true);
                });
            });
            this.socket.on("deviceOrderChanged", function (order) {
                $log.debug('websocketApi', "deviceOrderChanged", order);
            });

            // Pages
            this.socket.on("pageChanged", function (page) {
                $log.debug('websocketApi', "pageChanged", page);
                self.apply(function () {
                    store.update('pages', page, true);
                });
            });
            this.socket.on("pageRemoved", function (page) {
                $log.debug('websocketApi', "pageRemoved", page);
                self.apply(function () {
                    store.remove('pages', page, true);
                });
            });
            this.socket.on("pageAdded", function (page) {
                $log.debug('websocketApi', "pageAdded", page);
                self.apply(function () {
                    store.add('pages', page, true);
                });
            });
            this.socket.on("pageOrderChanged", function (order) {
                $log.debug('websocketApi', "pageOrderChanged", order);
            });


            // Groups
            this.socket.on("groupChanged", function (group) {
                $log.debug('websocketApi', "groupChanged", group);
                self.apply(function () {
                    store.update('groups', group, true);
                });
            });
            this.socket.on("groupRemoved", function (group) {
                $log.debug('websocketApi', "groupRemoved", group);
                self.apply(function () {
                    store.remove('groups', group, true);
                });
            });
            this.socket.on("groupAdded", function (group) {
                $log.debug('websocketApi', "groupAdded", group);
                self.apply(function () {
                    store.add('groups', group, true);
                });
            });
            this.socket.on("groupOrderChanged", function (order) {
                $log.debug('websocketApi', "groupOrderChanged", order);
            });


            // Rules
            this.socket.on("ruleChanged", function (rule) {
                $log.debug('websocketApi', "ruleChanged", rule);
                self.apply(function () {
                    store.update('rules', rule, true);
                });
            });
            this.socket.on("ruleAdded", function (rule) {
                $log.debug('websocketApi', "ruleAdded", rule);
                self.apply(function () {
                    store.add('rules', rule, true);
                });
            });
            this.socket.on("ruleRemoved", function (rule) {
                $log.debug('websocketApi', "ruleRemoved", rule);
                self.apply(function () {
                    store.remove('rules', rule, true);
                });
            });
            this.socket.on("ruleOrderChanged", function (order) {
                $log.debug('websocketApi', "ruleOrderChanged", order);
            });

            // Variables
            this.socket.on("variableChanged", function (variable) {
                $log.debug('websocketApi', "variableChanged", variable);
                self.apply(function () {
                    store.update('variables', variable, true);
                });
            });
            this.socket.on("variableAdded", function (variable) {
                $log.debug('websocketApi', "variableAdded", variable);
                self.apply(function () {
                    store.add('variables', variable, true);
                });
            });
            this.socket.on("variableRemoved", function (variable) {
                $log.debug('websocketApi', "variableRemoved", variable);
                self.apply(function () {
                    store.remove('variables', variable, true);
                });
            });
            this.socket.on("variableOrderChanged", function (order) {
                $log.debug('websocketApi', "variableOrderChanged", order);
            });

            this.socket.on("updateProcessStatus", function (statusEvent) {
                $log.debug('websocketApi', "updateProcessStatus", statusEvent);
            });
            this.socket.on("updateProcessMessage", function (msgEvent) {
                $log.debug('websocketApi', "updateProcessMessage", msgEvent);
            });

            this.socket.on('messageLogged', function (entry) {
                $log.debug('websocketApi', "messageLogged", entry);
                if (entry.level != 'debug') {
                    // Show toast
                    toast.show(entry.msg);
                }
                /*if (entry.level == 'error') {

                }*/
            });
        },

        /**
         * Attempt to login with the given credentials
         * @param username string The username
         * @param password string The password
         * @param rememberMe bool Whether the user should be remembered. Defaults to false.
         * @returns promise A promise which will be resolved with the user object, or rejected with a message
         */
        login: function (username, password, rememberMe) {
            return $q(function (resolve, reject) {
                var data = {
                    username: username,
                    password: password
                };
                if (rememberMe) {
                    data.rememberMe = true;
                }

                $http.post(pimaticHost + '/login', data)
                    .success(function (data) {
                        if (data.success) {
                            resolve({
                                username: data.username,
                                rememberMe: data.rememberMe,
                                role: data.role
                            });
                        } else {
                            reject(data.message);
                        }
                    }).error(function (data) {
                    reject(data.message);
                });
            });
        },

        /**
         * Attempt to logout
         * @returns promise A promise which will be resolved, or rejected with a message
         */
        logout: function () {
            return $q(function (resolve) {
                $http.get(pimaticHost + '/logout')
                    .success(function () {
                        resolve();
                    }).error(function () {
                    // Succesfull logout gives a 401
                    resolve();
                });
            });
        },

        handleIncomingData: function (type, data) {
            if (type in cache && 'promises' in cache[type]) {
                // Resolve promises
                angular.forEach(cache[type].promises, function (deffered) {
                    deffered.resolve(data);
                });

                // Clear cache
                delete cache[type];
            } else {
                // Cache data
                cache[type] = {};
                cache[type].data = data;
            }
        },

        deviceAction: function (deviceId, actionName, params) {
            var self = this;
            return $q(function (resolve, reject) {
                var url = pimaticHost + '/api/device/' + deviceId + '/' + actionName;
                if (!angular.isUndefined(params) && angular.isObject(params)) {
                    url += '?' + self.toQueryString(params);
                }

                $http.get(url)
                    .success(function (data) {
                        if (data.success) {
                            resolve();
                        } else {
                            reject();
                        }
                    }).error(function () {
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
                var data = {};
                data[singular] = object;
                $http.post(pimaticHost + '/api/' + type + '/' + object.id, data).then(function (response) {
                    resolve(response[singular]);
                }, function (response) {
                    reject(response.message);
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
                var data = {};
                data[singular] = object;
                $http.patch(pimaticHost + '/api/' + type + '/' + object.id, data).then(function (response) {
                    resolve(response[singular]);
                }, function (response) {
                    reject(response.message);
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
                    resolve(response.removed);
                }, function (response) {
                    reject(response.message);
                });
            });
        },

        /**
         * Load all objects of a certain type.
         * @param type The type to load the objects of.
         * @return promise promise A promise which is resolved when the data is loaded.
         */
        load: function (type) {
            var promise;
            var defered;

            // Check if the data is cached
            if (type in cache && 'data' in cache[type]) {
                promise = $q(function (resolve) {
                    // Resolve immediately
                    resolve(cache[type].data);
                });

                // Clear cache
                delete cache[type];

                // Return the promise
                return promise;
            } else {
                // Data is not cached. We will create a promise and store this promise

                // Create a promise
                defered = $q.defer();

                // Add the promise
                if (angular.isUndefined(cache[type])) {
                    cache[type] = {};
                }
                if (angular.isUndefined(cache[type].promises)) {
                    cache[type].promises = [];
                }
                cache[type].promises.push(defered);

                // Return the promise
                return defered.promise;
            }
        }
    });
}]);
