/**
 * (c) Copyright 2016 Hewlett-Packard Development Company, L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function() {
  'use strict';

  /**
   * @ngdoc overview
   * @ngname resources.os-nova-servers.details
   *
   * @description
   * Provides details features for instances.
   */
  angular.module('resources.os-nova-servers.details', [
    'horizon.framework.conf',
    'horizon.framework.util',
    'horizon.framework.widgets.toast',
    'horizon.app.core.openstack-service-api',
    'resources.os-nova-servers'
  ]).run(run);

  run.$inject = [
    'resources.os-nova-servers.resourceType',
    'horizon.app.core.openstack-service-api.nova',
    'resources.os-nova-servers.basePath',
    'horizon.framework.conf.resource-type-registry.service'
  ];

  function run(
    instanceResourceType,
    novaApi,
    basePath,
    registry
  ) {
    var resourceType = registry.getResourceType(instanceResourceType);
    resourceType
      .setLoadFunction(loadFunction);

    resourceType.detailsViews
      .append({
        id: 'instanceDetailsOverview',
        name: gettext('Overview'),
        template: basePath + 'details/overview.html'
      })
      .append({
        id: 'instanceDetailsConsole',
        name: gettext('Console'),
        template: basePath + 'details/console.html'
      })
      .append({
        id: 'instanceDetailsActionLog',
        name: gettext('Action Log'),
        template: basePath + 'details/action-log.html'
      })
      .append({
        id: 'instanceDetailsLog',
        name: gettext('Log'),
        template: basePath + 'details/log.html'
      });

    function loadFunction(identifier) {
      return novaApi.getServer(identifier);
    }
  }

})();
