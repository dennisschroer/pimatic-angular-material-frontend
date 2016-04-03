angular.module('pimaticApp.configuration').provider('config', function () {
    this.development = {
        title: 'Pimatic frontend - DEV',
        pimaticHost: '',
        apiName: 'fixtureApi',
        debug: true
    };

    this.production = {
        title: '',
        pimaticHost: '',
        apiName: 'websocketApi',
        debug: false
    };

    this.$get = function () {
        return this.development;
    }
});