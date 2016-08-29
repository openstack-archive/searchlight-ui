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
   * @ngname resources.os-nova-servers
   *
   * @description
   * Provides all of the services and widgets required
   * to support and display instances related content.
   */
  angular
    .module('resources.os-nova-servers', [
      'ngRoute',
      'resources.os-nova-servers.details',
      'resources.os-nova-servers.actions'
    ])
    .constant('resources.os-nova-servers.resourceType', 'OS::Nova::Server')
    .config(config)
    .run(run);

  config.$inject = [
    '$provide',
    '$windowProvider'
  ];

  function config($provide, $windowProvider) {
    var path = $windowProvider.$get().STATIC_URL + 'resources/os-nova-servers/';
    $provide.constant('resources.os-nova-servers.basePath', path);

  }

  run.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'resources.os-nova-servers.basePath',
    'resources.os-nova-servers.instance-status.service',
    'resources.os-nova-servers.resourceType'
  ];

  function run(registry, basePath, statusService, instanceResourceType) {
    registry.getResourceType(instanceResourceType)
      .setNames(gettext('Instance'), gettext('Instances'))
      .setSummaryTemplateUrl(basePath + 'summary.html')
      .setItemInTransitionFunction(itemInTransition)
      .setProperty('name', {
        label: gettext('Name')
      })
      .setProperty('id', {
        label: gettext('ID')
      })
      .setProperty('created', {
        label: gettext('Created')
      })
      .setProperty('updated_at', {
        label: gettext('Updated At')
      })
      .setProperty('project_id', {
        label: gettext('Project ID')
      })
      .setProperty('image', {
        label: gettext('Image'),
        filters: [getId]
      })
      .setProperty('key_name', {
        label: gettext('Key Pair Name'),
        filters: ['noValue']
      })
      .setProperty('flavor', {
        label: gettext('Flavor'),
        filters: [getId]
      })
      .setProperty('addresses', {
        label: gettext('Addresses'),
        filters: [getAllAddresses]
      })
      .setProperty('status', {
        label: gettext('Status'),
        values: statusService.statuses
      })
      .setProperty('OS-EXT-AZ:availability_zone', {
        label: gettext('Availability Zone')
      })
      .setProperty('OS-EXT-STS:task_state', {
        label: gettext('Task State'),
        filters: ['noValue']
      })
      .setProperty('OS-EXT-STS:power_state', {
        label: gettext('Power State'),
        values: {
          '0': gettext('No State'),
          '1': gettext('Running'),
          '2': gettext('Blocked'),
          '3': gettext('Paused'),
          '4': gettext('Shutdown'),
          '5': gettext('Shutoff'),
          '6': gettext('Crashed'),
          '7': gettext('Suspended'),
          '8': gettext('Failed'),
          '9': gettext('Building')
        }
      })
      .tableColumns
      .append({
        id: 'name',
        priority: 1,
        sortDefault: true
      })
      .append({
        id: 'image',
        priority: 2
      })
      .append({
        id: 'flavor',
        priority: 2
      })
      .append({
        id: 'key_name',
        priority: 2
      })
      .append({
        id: 'status',
        priority: 1
      })
      .append({
        id: 'OS-EXT-AZ:availability_zone',
        excludeSort: true,
        priority: 2
      })
      .append({
        id: 'OS-EXT-STS:task_state',
        priority: 1,
        excludeSort: true
      })
      .append({
        id: 'OS-EXT-STS:power_state',
        priority: 1,
        excludeSort: true
      })
      .append({
        id: 'created',
        priority: 1
      });

    function getId(item) {
      return item ? item.id : '-';
    }

    function getAllAddresses(addrObj) {
      var addrs = [];
      angular.forEach(addrObj, function eachNet(net) {
        addrs.push(getAddresses(net));
      });
      return addrs.join(', ');

      function getAddresses(list) {
        return list.map(getAddr).join(', ');

        function getAddr(item) {
          return item.addr;
        }
      }
    }

    function itemInTransition(item) {
      // Any value in task_state indicates instance in transition.
      // task_state is null otherwise
      return item['OS-EXT-STS:task_state'];
    }
  }

})();
