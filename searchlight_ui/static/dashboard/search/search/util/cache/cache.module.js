/*
 * (c) Copyright 2015 Hewlett Packard Enterprise Development Company LP
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

  /**
   * @ngdoc overview
   * @name horizon.dashboard.search.search.util.cache
   * @description
   *
   *
   * This module provides a simple object caching service.  The caller
   * can provide a simple timestamp that will be used to determine if the
   * cached item can be cleared when a "newer" version of that item is
   * available.
   *
   * NOTE: The caller provided timestamp is NOT used when deciding if objects
   * in the cache are too old to be maintained anymore.
   */
  angular
    .module('horizon.dashboard.search.search.util.cache', []);
})();
