/*
 * (c) Copyright 2016 Hewlett Packard Enterprise Development Company LP
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function () {
  'use strict';

  describe('searchlight-ui.util module', function () {
    it('should have been defined', function () {
      expect(angular.module('searchlight-ui.util')).toBeDefined();
    });
  });

  describe('cache service functions', function() {
    // Dependencies needed by all test suites
    beforeEach(module(function($provide) {
        // Mock Horizon dependencies
        $provide.provider('horizon.app.core.openstack-service-api.searchlight', function() {
          this.$get = function() {
            return {};
          };
        });
        $provide.factory('horizon.framework.conf.resource-type-registry.service', function() {
          return {};
        });
        $provide.constant('searchlight-ui.basePath', 'mock path');
        $provide.provider('$modal', function() {
          this.$get = function() {
            return {};
          };
        });
      }));
    beforeEach(module('searchlight-ui.settings'));
    beforeEach(module('searchlight-ui.util'));

    describe('add', function () {
      var cacheService;

      beforeEach(inject(function ($injector) {
        cacheService = $injector.get('searchlight-ui.util.modifiedItemCache');
      }));

      it('added item in cache', function () {
        cacheService.put({name:'item 1'}, 1, 100);
        expect(cacheService.sync({}, 1, 100)).toEqual({name:'item 1'});
      });

      it('not added item not in cache', function () {
        expect(cacheService.getSize()).toBe(0);
        expect(cacheService.sync({name:'snarf'}, 2, 100)).toEqual({name:'snarf'});
      });
    });

    describe('sync', function () {
      var cacheService, oldItem, newItem, returnedItem;

      beforeEach(inject(function ($injector) {
        cacheService = $injector.get('searchlight-ui.util.modifiedItemCache');
        oldItem = {id:'1', name:'old item'};
        newItem = {id:'1', name:'new item'};
        returnedItem = undefined;
      }));

      it('cached item returned on same timestamp', function () {
        cacheService.put(oldItem, oldItem.id, 100);
        expect(cacheService.getSize()).toBe(1);
        returnedItem = cacheService.sync(newItem, newItem.id, 100);
        expect(returnedItem).toBe(oldItem);
        expect(cacheService.getSize()).toBe(1);
      });

      it('newer item returned on different (greater) timestamp', function () {
        cacheService.put(oldItem, oldItem.id, 100);
        expect(cacheService.getSize()).toBe(1);
        returnedItem = cacheService.sync(newItem, newItem.id, 101);
        expect(returnedItem).toBe(newItem);
        expect(cacheService.getSize()).toBe(0);
      });

      it('newer item returned on different (lesser) timestamp', function () {
        cacheService.put(oldItem, oldItem.id, 100);
        expect(cacheService.getSize()).toBe(1);
        returnedItem = cacheService.sync(newItem, newItem.id, 99);
        expect(returnedItem).toBe(newItem);
        expect(cacheService.getSize()).toBe(0);
      });
    });

    describe('getSize', function () {
      var cacheService, settingsService;

      beforeEach(inject(function ($injector) {
        cacheService = $injector.get('searchlight-ui.util.modifiedItemCache');
        settingsService = $injector.get('searchlight-ui.settings.settingsService');
      }));

      it('initial cache is empty', function () {
        expect(cacheService.getSize()).toBe(0);
      });

      it('size increases as items added', function () {
        cacheService.put({name:'item 1'}, 1, 100);
        cacheService.put({name:'item 2'}, 2, 100);
        cacheService.put({name:'item 3'}, 3, 100);
        expect(cacheService.getSize()).toBe(3);
      });

      it('size does not exceed max size', function () {
        for (var i = 0; i < settingsService.settings.cache.capacity + 1; i++) {
          cacheService.put({name:'item'}, i, 100);
        }
        expect(cacheService.getSize()).toBe(settingsService.settings.cache.capacity);
      });

      it('last recently used item is removed', function () {
        // Add capacity + 1 items
        for (var i = 0; i < settingsService.settings.cache.capacity + 1; i++) {
          cacheService.put({name:'cached item'}, i, 100);
        }
        // id 0 is least recently added and will be pushed out first
        expect(cacheService.sync({name:'removed item'}, 0, 100)).toEqual({name:'removed item'});
        // id 1 is next least recently added and hasn't been pushed out yet
        expect(cacheService.sync({name:'removed item'}, 1, 100)).toEqual({name:'cached item'});
      });
    });
  });

})();
