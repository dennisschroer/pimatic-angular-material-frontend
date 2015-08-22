/**
 * The store is responsible for keeping the references to the different models or requesting them via the specified
 * ApiProvider. Users can request models from the store. If the models are in the store, the models are directly returned.
 * If the models are not in the store, the models are requested via the specified ApiProvider
 */

angular.module('pimaticApp').factory('store', function (apiProvider, $injector) {
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
            this.provider.init();
        },

        /**
         * Retrieve a list of models or a single model. If the requested models are not yet loaded, either
         * an empty list or an empty object is returned which is filled when the models are provided by the apiProvider.
         * @param name The name of the model to load.
         * @param id Optional the id of the model to load. If undefined, all instances will be returned.
         * @returns list|object A list of models or a single instance.
         */
        get: function (name, id) {
            var self = this;
            if (name in self.store) {
                // Check if data is already fetched
                if (self.store[name].timestamp == 0) {
                    // Fetch data via the API
                    self.provider.load(name).then(function (data) {
                        angular.merge(self.store[name].data, data);
                        var date = new Date();
                        self.store[name].timestamp = date.getTime();

                        // Remove dummy flag
                        angular.forEach(self.store[name].data, function (value) {
                            value['$dummy'] = false;
                        })
                    });
                }

                if (angular.isUndefined(id)) {
                    // Return all data
                    return self.store[name].data;
                } else {
                    // Return single item, or null
                    var item = null;
                    angular.forEach(self.store[name].data, function (value) {
                        if (value.id == id) item = value;
                    });

                    if (item == null) {
                        item = self.createDummy(name, id);
                        self.store[name].data[id] = item;
                    }
                    return item;
                }
            } else {
                // Not valid, return null
                return null;
            }
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