/**
 * (c) Copyright 2015 Hewlett-Packard Development Company, L.P.
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

  angular
    .module('searchlight-ui.filters')
    .filter('slSearchPluginResourceTypes', slSearchPluginResourceTypes);

  /**
   * @ngdoc filter
   * @name pluginTypes
   * @description
   * Filters the available search resource types.
   *
   * @returns {String} Plugin types.
   */
  function slSearchPluginResourceTypes() {
    return function plugins(pluginz, options) {
      options = options || {};
      var excludedTypes = options.excludedTypes || [];
      var includedTypes = options.includedTypes || [];
      var flatten = options.flatten || false;
      var result = [];

      angular.forEach(pluginz, filterAndMapPlugin);

      function filterAndMapPlugin(plugin) {
        if (excludedTypes.indexOf(plugin.type) >= 0) {
          return;
        } else if (includedTypes.length === 0 || includedTypes.indexOf(plugin.type) >= 0) {
          result.push(flatten ? plugin.type : plugin);
        }
      }

      return result;
    };
  }
})();
