/**
 * The store is responsible for keeping the references to the different models or requesting them via the specified
 * ApiProvider. Users can request models from the store. If the models are in the store, the models are directly returned.
 * If the models are not in the store, the models are requested via the specified ApiProvider
 */

angular.module('pimaticApp').factory('store', function (apiProvider, $injector, $q) {
    return {
        // Retrieve the provider instance from the injector
        provider: $injector.get(apiProvider),

        store: {
            devices: {timestamp: 0, data: []},
            groups: {timestamp: 0, data: []},
            pages: {timestamp: 0, data: []},
            rules: {timestamp: 0, data: []},
            variables: {timestamp: 0, data: []}
        },

        init: function () {
            this.provider.init(this);
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
                if (self.store[type].timestamp == 0) {
                    // Fetch data via the API
                    self.provider.load(type).then(function (data) {
                        console.log(type, data);

                        angular.merge(self.store[type].data, data);
                        var date = new Date();
                        self.store[type].timestamp = date.getTime();

                        // Remove dummy flag
                        angular.forEach(self.store[type].data, function (value) {
                            value['$dummy'] = false;
                        })
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

                    if (item == null) {
                        item = self.createDummy(type, id);
                        self.store[type].data[id] = item;
                    }
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
         */
        add: function (type, object) {
            var provider = this.provider;
            return $q(function (resolve, reject) {
                // Call the API provider
                provider.add(type, object).then(function (resultingObject) {
                    // Succesfully added -> add to store
                    data[type].push(resultingObject);
                    resolve(resultingObject);
                }, function (message) {
                    // Not added
                    reject(message);
                });
            });
        },

        /**
         * Update an existing object of the given type
         * @param type The type of the object which is updated
         * @param object The updated object
         */
        update: function (type, object) {
            var provider = this.provider;
            var self = this;
            return $q(function (resolve, reject) {
                // Call the API provider
                provider.update(type, object).then(function (resultingObject) {
                    // Succesfully updated -> update in store
                    angular.merge(self.get(type, object.id), resultingObject);
                    resolve(resultingObject);
                }, function (message) {
                    // Not updated
                    reject(message);
                });
            });
        },

        /**
         * Remove an existing object of the given type
         * @param type The type of the object which is removed
         * @param object The to be removed object
         */
        remove: function (type, object) {
            var provider = this.provider;
            var self = this;
            return $q(function (resolve, reject) {
                // Call the API provider
                provider.remove(type, object).then(function (resultingObject) {
                    // Succesfully removed -> remove in store
                    delete data[type][object.id];
                    resolve(resultingObject);
                }, function (message) {
                    // Not removed
                    reject(message);
                });
            });
        },

        createDummy: function (name, id) {
            var dummy = {
                $dummy: true,
                id: id
            };
            switch (name) {
                case 'devices':
                    dummy['template'] = 'dummy';
                    break;
                default:
                    break;
            }

            return dummy;
        }
    };
});