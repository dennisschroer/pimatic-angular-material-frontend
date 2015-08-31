/**
 * The store is responsible for keeping the references to the different models or requesting them via the specified
 * ApiProvider. Users can request models from the store. If the models are in the store, the models are directly returned.
 * If the models are not in the store, the models are requested via the specified ApiProvider
 */

angular.module('pimaticApp').factory('store', function ($q, $injector, apiProviderName) {
    var store = {
        // Retrieve the provider instance from the injector
        provider: $injector.get(apiProviderName),

        store: {},

        /**
         * Reset the store and retreive all objects from the API provider again
         */
        reset: function(){
            console.log('STORE RESET');

            this.store =  {
                devices: {timestamp: 0, data: []},
                groups: {timestamp: 0, data: []},
                pages: {timestamp: 0, data: []},
                rules: {timestamp: 0, data: []},
                variables: {timestamp: 0, data: []}
            };

            this.provider.start();
        },

        /**
         * Retrieve a list of models or a single model. If the requested models are not yet loaded, either
         * an empty list or an empty object is returned which is filled when the models are provided by the apiProvider.
         * @param type The type of the model to load.
         * @param id Optional the id of the model to load. If undefined, all instances will be returned.
         * @returns list|object A list of models or a single instance.
         */
        get: function (type, id) {
            var self = this;
            if (type in self.store) {
                // Check if data is already fetched
                if (self.store[type].timestamp == 0 && !self.store[type].loading) {
                    self.store[type].loading = true;

                    // Fetch data via the API
                    self.provider.load(type).then(function (data) {
                        console.log(type, data);

                        // Merge the objects
                        self.store[type].data =  data;

                        var date = new Date();
                        self.store[type].timestamp = date.getTime();

                        // Remove dummy flag
                        angular.forEach(self.store[type].data, function (value) {
                            value['$dummy'] = false;
                        });

                        self.store[type].loading = false;
                    });
                }

                if (angular.isUndefined(id)) {
                    // Return all data
                    return self.store[type].data;
                } else {
                    // Return single item, or null
                    var item = null;
                    angular.forEach(self.store[type].data, function (value) {
                        if (value.id == id) item = value;
                    });

                    //if (item == null) {
                        //item = self.createDummy(type, id);
                        //self.store[type].data.push(item);
                        //console.log("Dummy created", type, id);
                    //}
                    return item;
                }
            } else {
                // Not valid, return null
                return null;
            }
        },

        /**
         * Add a new object of the given type
         * @param type The type of the object to add
         * @param object The object to add
         * @param skipApi bool Optional, whether to skip the call to the api or not. Typical use case for this is when
         * the addition is originated from the server.
         */
        add: function (type, object, skipApi) {
            var provider = this.provider;
            var self = this;

            // Help function
            // This function is needed because otherwise creating a new object would result in a double addition (first
            // by calling the API and adding it on success, the by the message passed from the server via the websocket)
            var add = function(){
                var current = self.get(type, object.id);
                if(angular.isUndefined(current)){
                    // Really new
                    self.get(type).push(object);
                }else{
                    // Not new, update instead
                    self.update(type, object, skipApi);
                }
            }

            return $q(function (resolve, reject) {
                if(skipApi){
                    // Add directly
                    add(object);
                    resolve(object);
                }else{
                    // Call the API provider
                    provider.add(type, object).then(function (resultingObject) {
                        // Succesfully added -> add to store
                        add(resultingObject);
                        resolve(resultingObject);
                    }, function (message) {
                        // Not added
                        reject(message);
                    });
                }
            });
        },

        /**
         * Update an existing object of the given type
         * @param type The type of the object which is updated
         * @param object The updated object
         * @param skipApi bool Optional, whether to skip the call to the api or not. Typical use case for this is when
         * the update is originated from the server.
         */
        update: function (type, object, skipApi) {
            var provider = this.provider;
            var self = this;
            return $q(function (resolve, reject) {
                var current = self.get(type, object.id);
                if(current == null){
                    reject("Fatal: update called, but object does not exist");
                }

                if(skipApi){
                    // Update directly
                    angular.merge(current, object);
                    resolve(object);
                }else {
                    // Call the API provider
                    provider.update(type, object).then(function (resultingObject) {
                        // Succesfully updated -> update in store
                        angular.merge(current, resultingObject);
                        resolve(resultingObject);
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
         * the removal is originated from the server.
         */
        remove: function (type, object, skipApi) {
            var self = this;

            // Help function
            var remove = function(){
                var index = self.store[type].data.indexOf(object);
                console.log(index);
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



        /*createDummy: function (type, id) {
            var dummy = {
                $dummy: true,
                id: id
            };
            switch (type) {
                case 'devices':
                    dummy['template'] = 'dummy';
                    break;
                default:
                    break;
            }

            return dummy;
        }*/
    };

    store.reset();
    return store;
});