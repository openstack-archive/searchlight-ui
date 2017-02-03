/*
 *    (c) Copyright 2017 Hewlett-Packard Development Company, L.P.
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
   * @name resources.os-ironic-nodes
   * @description
   *
   * # resources.os-ironic-node
   *
   * This module provides OpenStack Ironic Node functionality
   */
  angular.module('resources.os-ironic-nodes', [
  ])
  .constant('resources.os-ironic-nodes.resourceType', 'OS::Ironic::Node')
    .run(run)
    .config(config);

  run.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'resources.os-ironic-nodes.basePath',
    'resources.os-ironic-nodes.resourceType'
  ];

  function run(registry, basePath, resourceTypeName) {
    registry.getResourceType(resourceTypeName)
      .setNames(gettext('Ironic Node'), gettext('Ironic Nodes'))
      .setSummaryTemplateUrl(basePath + '/summary.html')
      .setProperty('id', {
        label: gettext('ID')
      })
      .setProperty('uuid', {
        label: gettext('UUID')
      })
      .setProperty('name', {
        label: gettext('Name'),
        filters: ['noValue']
      })
      .setProperty('chassis_uuid', {
        label: gettext('Chassis UUID'),
        filters: ['noValue']
      })
      .setProperty('instance_uuid', {
        label: gettext('Instance UUID'),
        filters: ['noValue']
      })
      .setProperty('power_state', {
        label: gettext('Power State'),
        values: {
          'power off': gettext('Off'),
          'power on': gettext('On'),
          'rebooting': gettext('Rebooting')
        }
      })
      .setProperty('target_power_state', {
        label: gettext('Target Power State'),
        values: {
          'power off': gettext('Off'),
          'power on': gettext('On'),
          'rebooting': gettext('Rebooting')
        }
      })
      .setProperty('provision_state', {
        label: gettext('Provisioning State'),
        filters: ['noValue']
      })
      .setProperty('target_provision_state', {
        label: gettext('Target Provisioning State'),
        filters: ['noValue']
      })
      .setProperty('maintenance', {
        label: gettext('Down for Maintenance?'),
        values: {
          true: gettext('Yes'),
          false: gettext('No')
        }
      })
      .setProperty('maintenance_reason', {
        label: gettext('Maintenance Reason'),
        filters: ['noValue']
      })
      .setProperty('console_enabled', {
        label: gettext('Console Enabled?'),
        values: {
          true: gettext('Yes'),
          false: gettext('No')
        }
      })
      .setProperty('last_error', {
        label: gettext('Last Error'),
        filters: ['noValue']
      })
      .setProperty('network_interface', {
        label: gettext('Network Interface'),
        filters: ['noValue']
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
    var path = $windowProvider.$get().STATIC_URL + 'resources/os-ironic-nodes';
    $provide.constant('resources.os-ironic-nodes.basePath', path);
  }

})();
