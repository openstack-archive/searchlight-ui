/*
 *    (c) Copyright 2016 Hewlett-Packard Development Company, L.P.
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

  /* eslint-disable max-len */
  /**
   * @ngdoc overview
   * @name resources.os-neutron-router
   * @description
   *
   * # resources.os-neutron-router
   *
   * This module provides OpenStack Neutron Ports functionality
   */
  angular.module('resources.os-neutron-routers', [
    'resources.os-neutron-routers.actions'
  ])
  .constant('resources.os-neutron-routers.resourceType', 'OS::Neutron::Router')
    .run(run)
    .config(config);

  run.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'resources.os-neutron-routers.basePath',
    'resources.os-neutron-routers.resourceType'
  ];

  function run(registry, basePath, resourceTypeName) {
    registry.getResourceType(resourceTypeName)
      .setNames(gettext('Router'), gettext('Routers'))
      .setSummaryTemplateUrl(basePath + '/summary.html')
      .setProperty('id', {
        label: gettext('ID')
      })
      .setProperty('name', {
        label: gettext('Name')
      })
      .setProperty('distributed', {
        label: gettext('Distributed'),
        filters: ['yesno']
      })
      .setProperty('ha', {
        label: gettext('High Availability'),
        filters: ['yesno']
      })
      .setProperty('external_gateway_info', {
        label: gettext('External Network'),
        filters: [getNetworkId]
      })
      .setProperty('status', {
        label: gettext('Status'),
        values: {
          "ACTIVE":  gettext('Active'),
          "BUILD": gettext('Build'),
          "DOWN": gettext('Down'),
          "ERROR": gettext('Error')
        }
      })
      .setProperty('admin_state_up', {
        label: gettext('Admin State'),
        values: {
          true: gettext('Up'),
          false: gettext('Down')
        }
      })
      .tableColumns
      .append({
        id: 'name',
        priority: 1,
        sortDefault: true
      })
      .append({
        id: 'status',
        priority: 1
      })
      .append({
        id: 'external_gateway_info',
        priority: 1
      })
      .append({
        id: 'admin_state_up',
        priority: 2
      });

    function getNetworkId(item) {
      if (item) {
        return item.network_id;
      }
    }
  }

  config.$inject = [
    '$provide',
    '$windowProvider'
  ];

  /**
   * @name config
   * @param {Object} $provide
   * @param {Object} $windowProvider
   * @description Routes used by this module.
   * @returns {undefined} Returns nothing
   */
  function config($provide, $windowProvider) {
    var path = $windowProvider.$get().STATIC_URL + 'resources/os-neutron-routers';
    $provide.constant('resources.os-neutron-routers.basePath', path);
  }

})();
