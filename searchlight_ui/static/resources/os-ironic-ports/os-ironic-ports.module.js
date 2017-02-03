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
   * @name resources.os-ironic-port
   * @description
   *
   * # resources.os-ironic-port
   *
   * This module provides OpenStack Ironic Port functionality
   */
  angular.module('resources.os-ironic-ports', [
  ])
  .constant('resources.os-ironic-ports.resourceType', 'OS::Ironic::Port')
    .run(run)
    .config(config);

  run.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'resources.os-ironic-ports.basePath',
    'resources.os-ironic-ports.resourceType'
  ];

  function run(registry, basePath, resourceTypeName) {
    registry.getResourceType(resourceTypeName)
      .setNames(gettext('Ironic Port'), gettext('Ironic Ports'))
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
      .setProperty('node_uuid', {
        label: gettext('Node UUID'),
        filters: ['noValue']
      })
      .setProperty('address', {
        label: gettext('Address'),
        filters: ['noValue']
      })
      .setProperty('pxe_enabled', {
        label: gettext('PXE Enabled?'),
        values: {
          true: gettext('Yes'),
          false: gettext('No')
        }
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
    var path = $windowProvider.$get().STATIC_URL + 'resources/os-ironic-ports';
    $provide.constant('resources.os-ironic-ports.basePath', path);
  }

})();
