angular.module('pimaticApp.configuration').provider('config', function () {
    this.environment = 'production';

    this.production = {
        title: '',
        version: 'production',
        pimaticHost: '',
        adapterName: 'websocketAdapter',
        debug: false
    };

    this.development = {
        title: 'Pimatic frontend - DEV',
        version: 'develop',
        pimaticHost: '',
        adapterName: 'fixtureAdapter',
        debug: true
    };

    this.testing = this.development;

    this.$get = function () {
        var config = this.production;

        switch (this.environment) {
            case 'testing':
                config = this.testing;
            case 'development':
                config = this.development;
        }

        if (config.title == '@@title') {
            config.title = 'Pimatic';
        }

        return config;
    }
});
