(function () {
  'use strict';

  describe('horizon.dashboard.search.search.util.cache module', function () {
    it('should have been defined', function () {
      expect(angular.module('horizon.dashboard.search.search.util.cache')).toBeDefined();
    });
  });

  describe('cache service add', function () {
    var cacheService, items, oldItem, newItem, returnedItem, cachedItem;

    beforeEach(module('horizon.dashboard.search.search.util.cache'));

    beforeEach(inject(function ($injector) {
      cacheService = $injector.get('horizon.dashboard.search.search.util.cache.service');
    }));

    it('added item in cache', function () {
      cacheService.add({name:'item 1'}, 1, 100);
      expect(cacheService.inCache(1)).toBe(true);
    });

    it('not added item not in cache', function () {
      cacheService.add({name:'item 1'}, 1, 100);
      expect(cacheService.inCache(2)).toBe(false);
    });
  });

  describe('cache service sync', function () {
    var cacheService, items, oldItem, newItem, returnedItem, cachedItem;

    beforeEach(module('horizon.dashboard.search.search.util.cache'));

    beforeEach(inject(function ($injector) {
      cacheService = $injector.get('horizon.dashboard.search.search.util.cache.service');
      oldItem = {id:'1', name:'old item'};
      newItem = {id:'1', name:'new item'};
      returnedItem = undefined;
    }));

    it('cached item returned on older timestamp', function () {
      cacheService.add(oldItem, oldItem.id, 100);
      returnedItem = cacheService.sync(newItem, newItem.id, 99)
      expect(returnedItem).toBe(oldItem);
    });

    it('cached item returned on same timestamp', function () {
      cacheService.add(oldItem, oldItem.id, 100);
      returnedItem = cacheService.sync(newItem, newItem.id, 100)
      expect(returnedItem).toBe(oldItem);
    });

    it('newer item returned on newer timestamp', function () {
      cacheService.add(oldItem, oldItem.id, 100);
      returnedItem = cacheService.sync(newItem, newItem.id, 101)
      expect(returnedItem).toBe(newItem);
    });
  });

  describe('cache service clean', function () {
    var cacheService, items, oldItem, newItem, returnedItem, cachedItem;

    beforeEach(module('horizon.dashboard.search.search.util.cache'));

    beforeEach(inject(function ($injector) {
      cacheService = $injector.get('horizon.dashboard.search.search.util.cache.service');
      spyOn(cacheService, "clean").and.callThrough();
    }));

    it('non-expired item not cleaned', function (done) {
      cacheService.add({name:'item 1'}, 1, "user timestamp");
      setTimeout(function(){
        cacheService.clean(100);
        expect(cacheService.inCache(1)).toBe(true);
        done();
      }, 10);
    });

    it('expired item cleaned', function (done) {
      cacheService.add({name:'item 1'}, 1, "user timestamp");
      setTimeout(function(){
        cacheService.clean(10);
        expect(cacheService.inCache(1)).toBe(false);
        done();
      }, 11);
    });

    it('only expired item cleaned', function (done) {
      cacheService.add({name:'item 1'}, 1, "user timestamp");

      setTimeout(function(){
        // This item will be 10 ms younger than item 1
        cacheService.add({name:'item 2'}, 2, "user timestamp");
      }, 10);

      setTimeout(function(){
        cacheService.clean(20);
        expect(cacheService.inCache(1)).toBe(false);
        expect(cacheService.inCache(2)).toBe(true);
        done();
      }, 21);
    });
  });

})();
