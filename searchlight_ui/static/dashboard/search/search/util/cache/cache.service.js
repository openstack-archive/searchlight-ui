/*
 * © Copyright 2015 Hewlett Packard Enterprise Development Company LP
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
(function() {
  'use strict';

  angular
    .module('horizon.dashboard.search.search.util.cache')
    .factory('horizon.dashboard.search.search.util.cache.service', cacheService);

  cacheService.$inject = [
  ];

  /**
   * @ngdoc service
   * @name horizon.dashboard.search.search.util.cache:cacheService
   * @module horizon.dashboard.search.search.util.cache
   * @kind function
   * @description
   *
   * A simple cache service to remember items that may be newer in the client
   * than on server side
   *
   * @returns {Service} Cache services add, sync, inCache and clean
   */
  function cacheService() {

    function CachedItem(item, timestamp) {
      var user_item = item;
      var user_timestamp = timestamp;
      var item_added_time = Date.now();

      this.get = function get() {
        return item;
      }

      this.isOlder = function isOlder(timestamp) {
        return user_timestamp < timestamp;
      }

      this.isExpired = function isExpired(currentTime, maxAge) {
        return (currentTime - item_added_time) > maxAge;

      }
    }

    var cache = {};

    var service = {
      add: add,
      sync: sync,
      inCache: inCache,
      clean: clean
    };

    return service;

    //////////////////////////

    /**
     * Add item to the cache
     */
    function add(item, id, timestamp) {
      var cachedItem = new CachedItem(item, timestamp);
      cache[id] = cachedItem;
      return item;
    }

    /**
     * If the item is newer than cached item clear the cached version
     */
    function sync(item, id, timestamp) {
      var syncedItem = item;
      var cachedItem = undefined;
      if (cache.hasOwnProperty(id)) {
        var cachedItem = cache[id];
        if (cachedItem.isOlder(timestamp)) {
          delete cache[id];
          //console.log("cache sync removed: " + id);
        } else {
          syncedItem = cachedItem.get();
          //console.log("cache match: " + id);
        }
      }
      return syncedItem;
    }

    function inCache(id) {
      return cache.hasOwnProperty(id);
    }

    // Meant to be run periodically to clear out items in the cache that are
    // too old
    function clean(maxAge) {
      var key, cachedItem;
      var currentTime = Date.now();
      for (key in cache) {
        cachedItem = cache[key];
        if (cachedItem.isExpired(currentTime, maxAge)) {
          //console.log("cache remove: " + key);
          delete cache[key]
        }
      }
    }
  }
})();
