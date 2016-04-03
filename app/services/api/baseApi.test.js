describe('utils', function () {
    var baseApi;

    beforeEach(module('pimaticApp.api'));

    beforeEach(inject(function (_baseApi_) {
        baseApi = _baseApi_;
    }));

    it('should return the correct query string', function () {
        expect(baseApi.toQueryString({'a': 1})).toEqual('a=1');
        expect(baseApi.toQueryString({'a': 1, 'b': 2})).toEqual('a=1&b=2');
        expect(baseApi.toQueryString({'a': 1, 'b&c': 2})).toEqual('a=1&b%26c=2');
        expect(baseApi.toQueryString({'a': 1, 'b': {'c': 2, 'd': 3}})).toEqual('a=1&b[c]=2&b[d]=3');
        expect(baseApi.toQueryString({
            'a': 1,
            'b': {'c': 2, 'd': {'e': 3, 'f': 4}}
        })).toEqual('a=1&b[c]=2&b[d][e]=3&b[d][f]=4');
    });
});