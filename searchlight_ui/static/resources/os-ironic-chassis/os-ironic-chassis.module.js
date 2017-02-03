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
   * @name resources.os-ironic-chassis
   * @description
   *
   * # resources.os-ironic-chassis
   *
   * This module provides OpenStack Ironic Chassis functionality
   */
  angular.module('resources.os-ironic-chassis', [
  ])
  .constant('resources.os-ironic-chassis.resourceType', 'OS::Ironic::Chassis')
    .run(run)
    .config(config);

  run.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'resources.os-ironic-chassis.basePath',
    'resources.os-ironic-chassis.resourceType'
  ];

  function run(registry, basePath, resourceTypeName) {
    registry.getResourceType(resourceTypeName)
      .setNames(gettext('Ironic Chassis'), gettext('Ironic Chassis'))
      .setSummaryTemplateUrl(basePath + '/summary.html')
      .setProperty('uuid', {
        label: gettext('UUID')
      })
      .setProperty('id', {
        label: gettext('ID')
      })
      .setProperty('name', {
        label: gettext('UUID'),
        filters: ['noValue']
      })
      .setProperty('description', {
        label: gettext('Description'),
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
    var path = $windowProvider.$get().STATIC_URL + 'resources/os-ironic-chassis';
    $provide.constant('resources.os-ironic-chassis.basePath', path);
  }

})();
