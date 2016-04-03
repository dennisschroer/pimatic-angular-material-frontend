describe('utils', function () {
    var baseAdapter;

    beforeEach(module('pimaticApp.api'));

    beforeEach(inject(function (_baseAdapter_) {
        baseAdapter = _baseAdapter_;
    }));

    it('should return the correct query string', function () {
        expect(baseAdapter.toQueryString({'a': 1})).toEqual('a=1');
        expect(baseAdapter.toQueryString({'a': 1, 'b': 2})).toEqual('a=1&b=2');
        expect(baseAdapter.toQueryString({'a': 1, 'b&c': 2})).toEqual('a=1&b%26c=2');
        expect(baseAdapter.toQueryString({'a': 1, 'b': {'c': 2, 'd': 3}})).toEqual('a=1&b[c]=2&b[d]=3');
        expect(baseAdapter.toQueryString({
            'a': 1,
            'b': {'c': 2, 'd': {'e': 3, 'f': 4}}
        })).toEqual('a=1&b[c]=2&b[d][e]=3&b[d][f]=4');
    });
});
