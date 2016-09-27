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
   * @name resources.os-neutron-ports
   * @description
   *
   * # resources.os-neutron-ports
   *
   * This module provides OpenStack Neutron Ports functionality
   */
  angular.module('resources.os-neutron-ports', [
    'resources.os-neutron-ports.actions'
  ])
  .constant('resources.os-neutron-ports.resourceType', 'OS::Neutron::Port')
    .run(run)
    .config(config);

  run.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'resources.os-neutron-ports.basePath',
    'resources.os-neutron-ports.resourceType'
  ];

  function run(registry, basePath, resourceTypeName) {
    registry.getResourceType(resourceTypeName)
      .setNames(gettext('Port'), gettext('Ports'))
      .setSummaryTemplateUrl(basePath + '/summary.html')
      .setProperty('id', {
        label: gettext('ID')
      })
      .setProperty('name', {
        label: gettext('Name'),
        filters: ['noValue']
      })
      .setProperty('fixed_ips', {
        label: gettext('Fixed IPs'),
        filters: [ipAddrs]
      })
      .setProperty('device_owner', {
        label: gettext('Attached Device'),
        filters: ['noValue']
      })
      .setProperty('device_id', {
        label: gettext('Attached Device ID'),
        filters: ['noValue']
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
      .setProperty('binding:host_id', {
        label: gettext('Binding Host ID'),
        filters: ['noValue']
      })
      .setProperty('binding:vif_details', {
        label: gettext('Binding VIF Details'),
        filters: ['noValue']
      })
      .setProperty('binding:vif_type', {
        label: gettext('Binding VIF Type'),
        filters: ['noValue']
      })
      .setProperty('binding:profile', {
        label: gettext('Binding Profile'),
        filters: ['noValue']
      })
      .setProperty('binding:vnic_type', {
        label: gettext('Binding VNIC Type'),
        filters: ['noValue']
      })
      .setProperty('created_at', {
        label: gettext('Created At'),
        filters: ['noValue']
      })
      .setProperty('dns_name', {
        label: gettext('DNS Name'),
        filters: ['noValue']
      })
      .setProperty('mac_address', {
        label: gettext('DNS Name'),
        filters: ['noValue']
      })
      .setProperty('network_id', {
        label: gettext('Network ID'),
        filters: ['noValue']
      })
      .setProperty('port_security_enabled', {
        label: gettext('Port Security Enabled'),
        filters: ['yesno']
      })
      .setProperty('tenant_id', {
        label: gettext('Project ID'),
        filters: ['noValue']
      })
      .setProperty('security_groups', {
        label: gettext('Security Groups'),
        filters: ['noValue']
      })
      .setProperty('updated_at', {
        label: gettext('Updated At'),
        filters: ['noValue']
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
        id: 'fixed_ips',
        priority: 1
      })
      .append({
        id: 'device_owner',
        priority: 1
      })
      .append({
        id: 'status',
        priority: 2
      })
      .append({
        id: 'admin_state_up',
        priority: 2
      });

    function ipAddrs(items) {
      return items.map(function getIpAddress(item) {
        return item.ip_address;
      }).join(', ');
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
    var path = $windowProvider.$get().STATIC_URL + 'resources/os-neutron-ports';
    $provide.constant('resources.os-neutron-ports.basePath', path);
  }

})();
