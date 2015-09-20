/**
 * The store is responsible for keeping the references to the different models or requesting them via the specified
 * ApiProvider. Users can request models from the store. If the models are in the store, the models are directly returned.
 * If the models are not in the store, the models are requested via the specified ApiProvider
 */

angular.module('pimaticApp.data').factory('store', ['$q', '$injector', '$log', 'apiProviderName', function ($q, $injector, $log, apiProviderName) {
    var store = {
        // Retrieve the provider instance from the injector
        provider: $injector.get(apiProviderName),

        store: {},

        /**
         * Reset the store and retreive all objects from the API provider again
         */
        reset: function(){
            $log.debug('=== STORE RESET ===');

            this.store = {
                user: {timestamp: 0, loading: false, data: null},
                devices: {timestamp: 0, loading: false, data: []},
                groups: {timestamp: 0, loading: false, data: []},
                pages: {timestamp: 0, loading: false, data: []},
                rules: {timestamp: 0, loading: false, data: []},
                variables: {timestamp: 0, loading: false, data: []}
            };

            this.provider.setStore(this);
        },

        reload: function(){
            this.reset();
            this.provider.start();
        },

        isLoading: function(type){
            return this.store[type].loading;
        },

        getUser: function(){
            return this.store.user.data;
        },

        setUser: function(user){
            this.store.user.data = user;
        },

        /**
         * Retrieve a list of models or a single model. If the requested models are not yet loaded, either
         * an empty list or an empty object is returned which is filled when the models are provided by the apiProvider.
         * @param type The type of the model to load.
         * @param id Optional the id of the model to load. If undefined, all instances will be returned.
         * @param skipApi Optional indicates if the call to the API should be skipped. Defaults to false;
         * @returns list|object A list of models or a single instance.
         */
        get: function (type, id, skipApi) {
            var self = this;

            if (type in self.store) {
                // Check if data is already fetched
                if (self.store[type].timestamp === 0 && !self.store[type].loading) {
                    self.store[type].loading = true;

                    // Fetch data via the API
                    if (!skipApi) {
                        self.provider.load(type).then(function (data) {
                        // Merge the objects
                        self.store[type].data = data;

                        var date = new Date();
                        self.store[type].timestamp = date.getTime();

                        self.store[type].loading = false;
                    }, function () {
                        // Set to false, so it can be retried
                        self.store[type].loading = false;
                    });
                }
                }

                if (angular.isUndefined(id)) {
                    // Return all data
                    return self.store[type].data;
                } else {
                    // Return single item, or null
                    var item = null;
                    angular.forEach(self.store[type].data, function (value) {
                        if (value.id == id) {
                            item = value;
                        }
                    });

                    //if (item == null) {
                        //item = self.createDummy(type, id);
                        //self.store[type].data.push(item);
                        //console.log("Dummy created", type, id);
                    //}
                    return item;
                }
            } else {
                // Not valid, return null or empty list
                return angular.isUndefined(id) ? [] : null;
            }
        },

        /**
         * Add a new object of the given type
         * @param type The type of the object to add
         * @param object The object to add
         * @param skipApi bool Optional, whether to skip the call to the api or not. Typical use case for this is when
         * the addition is originated from the server. Defaults to false
         */
        add: function (type, object, skipApi) {
            var provider = this.provider;
            var self = this;

            $log.debug('store', 'add()', 'type=', type, 'object=', object, 'skipApi=', skipApi);

            // Help function
            // This function is needed because otherwise creating a new object would result in a double addition (first
            // by calling the API and adding it on success, the by the message passed from the server via the websocket)
            var add = function(){
                var current = self.get(type, object.id, skipApi);
                if(current === null){
                    // Really new
                    return $q(function(resolve){
                        self.get(type, undefined, skipApi).push(object);
                        resolve(object);
                    });
                }else{
                    // Not new, update instead
                    return self.update(type, object, skipApi);
                }
            };

            return $q(function (resolve, reject) {
                if(skipApi){
                    // Add directly
                    add(object).then(function(result){
                        resolve(result);
                    });
                }else{
                    // Call the API provider
                    provider.add(type, object).then(function (resultingObject) {
                        // Succesfully added -> add to store
                        add(resultingObject).then(function(result){
                            resolve(result);
                        });
                    }, function (message) {
                        // Not added
                        reject(message);
                    });
                }
            });
        },

        /**
         * Update an existing object of the given type. The updating can also be done partially: only the attributes present
         * in the data object are updated, other attributes remain untouched.
         * @param type The type of the object which is updated
         * @param object The updated object
         * @param skipApi bool Optional, whether to skip the call to the api or not. Typical use case for this is when
         * the addition is originated from the server. Defaults to false
         */
        update: function (type, object, skipApi) {
            var provider = this.provider;
            var self = this;

            $log.debug('store', 'update()', 'type=', type, 'object=', object, 'skipApi=', skipApi);


            return $q(function (resolve, reject) {
                var current = self.get(type, object.id);
                if(current === null){
                    reject("Fatal: update called, but object does not exist");
                    return;
                }

                if(skipApi){
                    // Update directly
                    angular.merge(current, object);
                    resolve(current);
                }else {
                    // Call the API provider
                    provider.update(type, object).then(function (resultingObject) {
                        // Succesfully updated -> update in store
                        angular.merge(current, resultingObject);
                        resolve(current);
                    }, function (message) {
                        // Not updated
                        reject(message);
                    });
                }
            });
        },

        /**
         * Remove an existing object of the given type
         * @param type The type of the object which is removed
         * @param object The to be removed object
         * @param skipApi bool Optional, whether to skip the call to the api or not. Typical use case for this is when
         * the addition is originated from the server. Defaults to false
         */
        remove: function (type, object, skipApi) {
            var self = this;

            $log.debug('store', 'remove()', 'type=', type, 'object=', object, 'skipApi=', skipApi);

            if(!(type in self.store)){
                return $q(function(resolve, reject){
                    reject('Type is not valid');
                });
            }

            // Help function
            var remove = function(){
                // Find index
                var index = -1;
                angular.forEach(self.store[type].data, function(value, i){
                    index = value.id == object.id ? i : index;
                });

                // Remove object
                if(index>=0){
                    self.store[type].data.splice(index, 1);
                }
            };

            return $q(function (resolve, reject) {
                if(skipApi){
                    // Update directly
                    remove(object);
                    resolve(object);
                }else {
                    // Call the API provider
                    self.provider.remove(type, object).then(function (resultingObject) {
                        // Succesfully removed -> remove in store
                        remove(object);
                        resolve(resultingObject);
                    }, function (message) {
                        // Not removed
                        reject(message);
                    });
                }
            });
        },
    };

    return store;
}]);