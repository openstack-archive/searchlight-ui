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
   * @name resources.os-neutron-floatingip
   * @description
   *
   * # resources.os-neutron-floatingip
   *
   * This module provides OpenStack Neutron Ports functionality
   */
  angular.module('resources.os-neutron-floatingip', [
  ])
  .constant('resources.os-neutron-floatingip.resourceType', 'OS::Neutron::FloatingIP')
    .run(run)
    .config(config);

  run.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'resources.os-neutron-floatingip.basePath',
    'resources.os-neutron-floatingip.resourceType'
  ];

  function run(registry, basePath, resourceTypeName) {
    registry.getResourceType(resourceTypeName)
      .setNames(gettext('Floating IP'), gettext('Floating IPs'))
      .setSummaryTemplateUrl(basePath + '/summary.html')
      .setProperty('id', {
        label: gettext('ID')
      })
      .setProperty('fixed_ip_address', {
        label: gettext('Mapped Fixed IP Address'),
        filters: ['noValue']
      })
      .setProperty('floating_ip_address', {
        label: gettext('Floating IP Address'),
        filters: ['noValue']
      })
      .setProperty('router_id', {
        label: gettext('Router ID'),
        filters: ['noValue']
      })
      .setProperty('dns_domain', {
        label: gettext('DNS Domain'),
        filters: ['noValue']
      })
      .setProperty('project_id', {
        label: gettext('Project ID'),
        filters: ['noValue']
      })
      .setProperty('port_id', {
        label: gettext('Port ID'),
        filters: ['noValue']
      })
      .setProperty('floating_network_id', {
        label: gettext('Floating Network ID'),
        filters: ['noValue']
      })
      .setProperty('dns_name', {
        label: gettext('DNS Name'),
        filters: ['noValue']
      })
      .setProperty('pool', {
        label: gettext('Pool')
      })
      .setProperty('status', {
        label: gettext('Status'),
        values: {
          'UP': gettext('Up'),
          'DOWN': gettext('Down'),
          'ERROR': gettext('Error')
        }
      })
      .tableColumns
      .append({
        id: 'fixed_ip_address',
        priority: 1
      })
      .append({
        id: 'pool',
        priority: 1
      })
      .append({
        id: 'status',
        priority: 2
      });
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
    var path = $windowProvider.$get().STATIC_URL + 'resources/os-neutron-floatingip';
    $provide.constant('resources.os-neutron-floatingip.basePath', path);
  }

})();
