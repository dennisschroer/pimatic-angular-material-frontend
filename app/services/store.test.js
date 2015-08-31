describe("store", function(){
    beforeEach(module('pimaticApp'));

    var store;

    beforeEach(inject(function(_store_){
        store = _store_;
    }));

    it('should not contain data at the start', function(){
        //fail('This is some reason why it failed');
    });
});