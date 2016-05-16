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
(function() {
  'use strict';

  angular
    .module('searchlight-ui.util')
    .factory('searchlight-ui.util.modifiedItemCache', modifiedItemCache);

  modifiedItemCache.$inject = [
    '$cacheFactory',
    'searchlight-ui.settings.settingsService'
  ];

  /**
   * @ngdoc service
   * @name searchlight-ui.util:modifiedItemCache
   * @module searchlight-ui.util
   * @kind function
   * @description
   *
   * A simple Least Recently Used (LRU) cache service to remember items that have been
   * modified by the user until the client detects that the corresponding server side
   * version of the item has a newer timestamp. The cache is backed by a fixed-size
   * LRU Angular $cacheFactory. The cache is intended to be large "enough" to hold
   * all items modified by a user until searchlight has been notified of an update
   * to those items.
   *
   * @returns {Service} Cache services put and sync
   */
  function modifiedItemCache($cacheFactory, searchSettings) {

    /**
     * CachedItem wraps a user item with a user supplied timestamp
     *
     * @param item - the item to cache
     * @param timestamp - the user "timestamp" used to detect a "newer" version of
     *  an item
     * @constructor
     */
    function CachedItem(item, timestamp) {
      var userItem = item;
      var userTimestamp = timestamp;

      this.get = function get() {
        return userItem;
      };

      this.isOlder = function isOlder(timestamp) {
        // Assume that if the timestamp is different, this item is older
        return userTimestamp !== timestamp;
      };
    }

    var cache = $cacheFactory('searchlight-ui.util.modifiedItemCache', {
      capacity: searchSettings.settings.cache.capacity
    });

    var service = {
      put: put,
      sync: sync,
      getSize: getSize
    };

    return service;

    //////////////////////////

    /**
     * 'put' an item into the cache
     *
     * @param item - the item to cache
     * @param id - the key associated with this item, usually "id"
     * @param timestamp - user provided timestamp, which may be an actual timestamp
     *  a version number or any other string that will be different when an item has
     *  been modified on the server side
     * @returns the item
     */
    function put(item, id, timestamp) {
      var cachedItem = new CachedItem(item, timestamp);
      cache.put(id, cachedItem);
      return item;
    }

    /**
     * 'sync' an item with the cache. If the supplied item has the same timestamp as
     * the cached version, return the cached version.  If the timestamp is newer for
     * an id already in the cache, remove that id from the cache and return the
     * supplied item.
     *
     * @param item - item to check
     * @param id - id that was used to 'put' the item into the cache
     * @param timestamp - user provided timestamp, which may be an actual timestamp
     *  a version number or any other string that will be different when an item has
     *  been modified on the server side
     * @returns {*}
     */
    function sync(item, id, timestamp) {
      var syncedItem = item;
      var cachedItem = cache.get(id);
      if ( cachedItem ) {
        if (cachedItem.isOlder(timestamp)) {
          cache.remove(id);
        } else {
          syncedItem = cachedItem.get();
        }
      }
      return syncedItem;
    }

    function getSize() {
      return cache.info().size;
    }
  }
})();
