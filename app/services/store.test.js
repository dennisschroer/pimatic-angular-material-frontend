describe('store', function () {
    beforeEach(module('pimaticApp.services', function (storeProvider) {
        storeProvider.setApi("fixtureApi");
    }));

    var store;
    var $rootScope;

    beforeEach(inject(function (_store_, _$rootScope_) {
        store = _store_;
        $rootScope = _$rootScope_;
        store.reset();
    }));

    it('should not contain data at the start', function () {
        expect(store.get('devices', undefined, true)).toEqual([]);
        expect(store.get('devices', 1, true)).toBe(null);
    });

    it('should contain added data', function (done) {
        // Add some data
        var data = {name: 'dummy', id: 1};
        store.add('devices', data, true).then(function () {
            expect(store.get('devices', 1)).toEqual(data);
            expect(store.get('devices', 2)).toBeNull();
            expect(store.get('devices')).toEqual([data]);
            done();
        }, function () {
            done.fail();
        });

        $rootScope.$digest();
    });

    describe('updating of data', function () {
        beforeEach(function (done) {
            var data = {name: 'dummy', foo: 'bar', id: 1};
            store.add('devices', data, true).then(function () {
                done();
            }, function () {
                done.fail();
            });
            $rootScope.$digest();
        });

        it('should correctly update data', function (done) {
            var data2 = {name: 'dummy', foo: 'foo', id: 1};
            store.update('devices', data2, true).then(function () {
                expect(store.get('devices', 1)).toEqual(data2);
                done();
            }, function () {
                done.fail();
            });
            //$rootScope.$digest();
        });

        it('should correctly update partial data', function (done) {
            store.update('devices', {id: 1, foo: 'test'}, true).then(function () {
                expect(store.get('devices', 1)).toEqual({id: 1, foo: 'test', name: 'dummy'});
                done();
            }, function () {
                done.fail();
            });
            //$rootScope.$digest();
        });

        it('should fail when updating non-existing data', function (done) {
            store.update('devices', {id: 2, name: 'nonexisting', foo: 'test'}, true).then(function () {
                done.fail('Updating of a non-exiting object should not be possible');
            }, function () {
                expect(store.get('devices', 2)).toBe(null);
                done();
            });
        });

        it('should also update if add() is used', function (done) {
            store.add('devices', {name: 'dummy', foo: 'bar', id: 1}, true).then(function () {
                expect(store.get('devices', 1)).toEqual({name: 'dummy', foo: 'bar', id: 1});
                done();
            }, function () {
                done.fail();
            });
        });
    });

    it('should correctly remove data', function (done) {
        // Add some data
        var data1 = {name: 'dummy', foo: 'bar', id: 1};
        var data2 = {name: 'dummy2', foo: 'bar2', id: 2};
        store.add('devices', data1, true).then(function () {
            store.add('devices', data2, true).then(function () {
                // Remove the data
                store.remove('devices', data1, true).then(function () {
                    expect(store.get('devices', 1)).toBe(null);
                    expect(store.get('devices', 2)).toEqual(data2);

                    // Removal of partial object should also be succesfull
                    store.remove('devices', {id: 2, nonsense: 'trololo'}, true).then(function () {
                        expect(store.get('devices', 1)).toBe(null);
                        expect(store.get('devices', 2)).toBe(null);
                        expect(store.get('devices')).toEqual([]);
                        done();
                    }, function () {
                        done.fail('Removing the second (partial) object failed');
                    });
                }, function () {
                    done.fail('Removing the first object failed');
                });
            }, function () {
                done.fail('Adding second object failed');
            });
        }, function () {
            done.fail('Adding first object failed');
        });
        $rootScope.$digest();
    });
});
