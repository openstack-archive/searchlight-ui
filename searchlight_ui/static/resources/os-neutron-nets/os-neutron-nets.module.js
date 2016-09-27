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
   * @name resources.os-neutron-nets
   * @description
   *
   * # resources.os-neutron-nets
   *
   * This module provides OpenStack Neutron Ports functionality
   */
  angular.module('resources.os-neutron-nets', [
    'resources.os-neutron-nets.actions'
  ])
  .constant('resources.os-neutron-nets.resourceType', 'OS::Neutron::Net')
    .run(run)
    .config(config);

  run.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'resources.os-neutron-nets.basePath',
    'resources.os-neutron-nets.resourceType'
  ];

  function run(registry, basePath, networkResourceType) {
    registry.getResourceType(networkResourceType)
      .setNames(gettext('Network'), gettext('Networks'))
      .setSummaryTemplateUrl(basePath + '/summary.html')
      .setProperty('id', {
        label: gettext('ID')
      })
      .setProperty('name', {
        label: gettext('Name')
      })
      .setProperty('subnets', {
        label: gettext('Subnets Associated'),
        filters: [subnetList, 'noValue']
      })
      .setProperty('shared', {
        label: gettext('Shared'),
        filters: ['yesno']
      })
      .setProperty('router:external', {
        label: gettext('External'),
        filters: ['yesno']
      })
      .setProperty('availability_zone_hints', {
        label: gettext('Availability Zone Hints'),
        filters: ['noValue']
      })
      .setProperty('created_at', {
        label: gettext('Created At'),
        filters: ['noValue']
      })
      .setProperty('updated_at', {
        label: gettext('Updated At'),
        filters: ['noValue']
      })
      .setProperty('ipv4_address_scope', {
        label: gettext('IPv4 Address Scope'),
        filters: ['noValue']
      })
      .setProperty('ipv6_address_scope', {
        label: gettext('IPv6 Address Scope'),
        filters: ['noValue']
      })
      .setProperty('mtu', {
        label: gettext('MTU'),
        filters: ['noValue']
      })
      .setProperty('port_security_enabled', {
        label: gettext('Port Security Enabled'),
        filters: ['noValue']
      })
      .setProperty('project_id', {
        label: gettext('Project ID'),
        filters: ['noValue']
      })
      .setProperty('is_default', {
        label: gettext('Default Network'),
        filters: ['yesno']
      })
      .setProperty('provider:network_type', {
        label: gettext('Provider Network Type'),
        filters: ['noValue']
      })
      .setProperty('provider:physical_network', {
        label: gettext('Provider Physical Network'),
        filters: ['noValue']
      })
      .setProperty('provider:segmentation_id', {
        label: gettext('Provider Segmentation ID'),
        filters: ['noValue']
      })
      .setProperty('availability_zones', {
        label: gettext('Availability Zones'),
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
        id: 'subnets',
        priority: 1
      })
      .append({
        id: 'shared',
        priority: 1
      })
      .append({
        id: 'router:external',
        priority: 2
      })
      .append({
        id: 'status',
        priority: 2
      })
      .append({
        id: 'admin_state_up',
        priority: 2
      });

    function subnetList(items) {
      if (!items) {
        return "";
      }
      return items.map(function getCidr(item) {
        return item.cidr;
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
    var path = $windowProvider.$get().STATIC_URL + 'resources/os-neutron-nets';
    $provide.constant('resources.os-neutron-nets.basePath', path);
  }

})();
