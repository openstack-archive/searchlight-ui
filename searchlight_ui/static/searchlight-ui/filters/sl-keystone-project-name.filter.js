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
    .filter('slKeystoneProjectName', slKeystoneProjectNameFilter);

  slKeystoneProjectNameFilter.$inject = [
    'horizon.app.core.openstack-service-api.keystone',
    'horizon.app.core.openstack-service-api.policy'
  ];

  /**
   * @ngdoc filter
   * @name slKeystoneProjectNameFilter
   * @description
   * Takes a raw project ID and if policy allows, it will return the project name
   * from the keystone API. Filters are evaluated many, many times and stateful
   * filters are not able to be cached by angular. So this service performs heavy
   * caching of the policy and project name queries in order to optimize performance.
   *
   * @param {function} keystone The keystone API service.
   *
   * @param {function} policy The policy API service.
   *
   * @returns {String} User friendly name if found.
   */
  function slKeystoneProjectNameFilter(keystone, policy) {
    var projectNameCache = {};
    var projectNameRequested = {};
    var projectNameLookupAllowed = null;

    function findProjectName(projectId) {
      if (!projectId) {
        return projectId;
      }

      if (projectNameCache[projectId]) {
        return projectNameCache[projectId];
      }

      // Defaults to the projectId itself
      projectNameCache[projectId] = projectId;

      // We only want to issue an API request once per project ID.
      if (!projectNameRequested[projectId]) {
        if (projectNameLookupAllowed) {
          getProjectName(projectId);
        } else if (projectNameLookupAllowed === null) {
          getIfAllowed(projectId);
        }
        projectNameRequested[projectId] = true;
      }
    }

    function getIfAllowed(projectId) {
      // The first page load with this filter may result in more than one policy API
      // invocation. This is limited to the number of distinct project IDs that are requested
      // the first time a page loads with this filter. This shouldn't be a real problem,
      // because policy API provides basic client side caching. However, in filters it is best
      // to avoid any excess processing and every policy API invocation will result in another
      // promise, so we reduce the lookup cost to a simple boolean check after the first usage.
      policy.ifAllowed({rules: [['identity', 'identity:get_project']]})
        .then(
          function onAllowed() {
            projectNameLookupAllowed = true;
            getProjectName(projectId);
          },
          function onNotAllowed() {
            projectNameLookupAllowed = false;
          }
        );
    }

    function getProjectName(projectId) {
      keystone.getProject(projectId)
        .then(cacheProjectName);
    }

    function cacheProjectName(project) {
      if (project) {
        projectNameCache[project.data.id] = project.data.name;
      }
    }

    findProjectName.$stateful = true;
    return findProjectName;
  }

}());
