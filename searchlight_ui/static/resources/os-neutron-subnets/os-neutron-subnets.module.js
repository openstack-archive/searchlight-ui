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
   * @name resources.os-neutron-subnets
   * @description
   *
   * # resources.os-neutron-subnets
   *
   * This module provides OpenStack Neutron Ports functionality
   */
  angular.module('resources.os-neutron-subnets', [
    'resources.os-neutron-subnets.actions'
  ])
  .constant('resources.os-neutron-subnets.resourceType', 'OS::Neutron::Subnet')
    .run(run)
    .config(config);

  run.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'resources.os-neutron-subnets.basePath',
    'resources.os-neutron-subnets.resourceType'
  ];

  function run(registry, basePath, resourceTypeName) {
    registry.getResourceType(resourceTypeName)
      .setNames(gettext('Subnet'), gettext('Subnets'))
      .setSummaryTemplateUrl(basePath + '/summary.html')
      .setProperty('id', {
        label: gettext('ID')
      })
      .setProperty('name', {
        label: gettext('Name')
      })
      .setProperty('created_at', {
        label: gettext('Created At')
      })
      .setProperty('updated_at', {
        label: gettext('Updated At')
      })
      .setProperty('dns_nameservers', {
        label: gettext('DNS Nameservers'),
        filters: ['noValue']
      })
      .setProperty('enable_dhcp', {
        label: gettext('Enable DHCP'),
        filters: ['yesno']
      })
      .setProperty('ipv6_address_mode', {
        label: gettext('IPv6 Address Mode'),
        filters: ['noValue']
      })
      .setProperty('ipv6_ra_mode', {
        label: gettext('IPv6 RA Mode'),
        filters: ['noValue']
      })
      .setProperty('network_id', {
        label: gettext('Network ID'),
        filters: ['noValue']
      })
      .setProperty('project_id', {
        label: gettext('Project ID'),
        filters: ['noValue']
      })
      .setProperty('subnetpool_id', {
        label: gettext('Subnet Pool ID'),
        filters: ['noValue']
      })
      .setProperty('cidr', {
        label: gettext('Network Address')
      })
      .setProperty('ip_version', {
        label: gettext('IP Version')
      })
      .setProperty('gateway_ip', {
        label: gettext('Gateway IP')
      })
      .tableColumns
      .append({
        id: 'name',
        priority: 1,
        sortDefault: true
      })
      .append({
        id: 'cidr',
        priority: 1
      })
      .append({
        id: 'ip_version',
        priority: 1
      })
      .append({
        id: 'gateway_ip',
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
    var path = $windowProvider.$get().STATIC_URL + 'resources/os-neutron-subnets';
    $provide.constant('resources.os-neutron-subnets.basePath', path);
  }

})();
