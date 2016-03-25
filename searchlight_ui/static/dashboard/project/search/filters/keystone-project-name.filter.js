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
    .module('horizon.dashboard.project.search')
    .filter('keystoneProjectName', keystoneProjectNameFilter);

  keystoneProjectNameFilter.$inject = [
    'horizon.app.core.openstack-service-api.keystone'
  ];

  /**
   * @ngdoc filter
   * @name keystoneProjectNameFilter
   * @description
   * Takes raw id from the API and returns the user friendly name if found.
   *
   * @param {function} keystoneApi keystone API
   *
   * @returns {String} User friendly name if found.
   */
  function keystoneProjectNameFilter(keystone) {
    var projectNameCache = {};
    var lookupRequested = {};

    function findProjectName(input) {
      if (!input) {
        return input;
      }

      if (projectNameCache[input]) {
        return projectNameCache[input];
      }

      projectNameCache[input] = input;

      if (!lookupRequested[input]) {
        keystone.getProject(input)
          .then(cacheProjectName);
        lookupRequested[input] = true;
      }

      function cacheProjectName(project) {
        if (project) {
          projectNameCache[input] = project.data.name;
        }
      }
    }

    findProjectName.$stateful = true;
    return findProjectName;
  }

}());
