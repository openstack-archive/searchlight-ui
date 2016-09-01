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

  /**
   * @ngdoc overview
   * @name resources.os-nova-flavors
   * @description
   *
   * # resources.os-nova-flavors
   *
   * This module provides OpenStack Nova Flavors functionality
   */
  angular.module('resources.os-nova-flavors', [
  ])
  .constant('resources.os-nova-flavors.resourceType', 'OS::Nova::Flavor')
    .run(run)
    .config(config);

  run.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'resources.os-nova-flavors.basePath',
    'resources.os-nova-flavors.resourceType'
  ];

  function run(registry, basePath, resourceTypeName) {
    registry.getResourceType(resourceTypeName)
      .setNames(gettext('Flavor'), gettext('Flavors'))
      .setSummaryTemplateUrl(basePath + '/summary.html')
      .setProperty('id', {
        label: gettext('ID')
      })
      .setProperty('name', {
        label: gettext('Name'),
        filters: ['noValue']
      })
      .setProperty('OS-FLV-EXT-DATA:ephemeral', {
        label: gettext('Ephemeral'),
        filters: ['noValue']
      })
      .setProperty('ram', {
        label: gettext('RAM'),
        filters: ['noValue']
      })
      .setProperty('swap', {
        label: gettext('Swap'),
        filters: ['noValue']
      })
      .setProperty('vcpus', {
        label: gettext('VCPUs'),
        filters: ['noValue']
      })
      .setProperty('disk', {
        label: gettext('Disk'),
        filters: ['noValue']
      })
      .setProperty('project_id', {
        label: gettext('Project ID'),
        filters: ['noValue']
      })
      .setProperty('updated_at', {
        label: gettext('Updated At'),
        filters: ['simpleDate']
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
    var path = $windowProvider.$get().STATIC_URL + 'resources/os-nova-flavors';
    $provide.constant('resources.os-nova-flavors.basePath', path);
  }

})();
