describe('store', function(){
    beforeEach(module("pimaticApp.configuration", function ($provide) {
        // Attempt to override the myConstant value that gets passed to config
        $provide.constant("apiProviderName", "fixtureProvider");
    }));
    beforeEach(module('pimaticApp.data'));

    var store;

    beforeEach(inject(function(_store_){
        store = _store_;
    }));



    it('should not contain data at the start', function(){
        console.log('test list');
        expect(store.get('devices')).toEqual([]);
        console.log('test item');
        expect(store.get('devices', 1)).toBe(null);
    });
});