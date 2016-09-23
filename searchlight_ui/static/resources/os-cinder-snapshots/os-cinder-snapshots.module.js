/*
 * (c) Copyright 2016 Hewlett Packard Enterprise Development LP
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
   * @ngname resources.os-cinder-snapshots
   *
   * @description
   * Provides all of the services and widgets required
   * to support and display snapshots related content.
   */
  angular
    .module('resources.os-cinder-snapshots', [
      'ngRoute',
      'resources.os-cinder-snapshots.actions'
    ])
    .constant('resources.os-cinder-snapshots.resourceType', 'OS::Cinder::Snapshot')
    .run(run)
    .config(config);

  run.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'resources.os-cinder-snapshots.basePath',
    'resources.os-cinder-snapshots.resourceType'
  ];

  function run(registry, basePath, snapshotResourceType) {
    registry.getResourceType(snapshotResourceType)
      .setNames(gettext('Volume Snapshot'), gettext('Volume Snapshots'))
      .setSummaryTemplateUrl(basePath + '/summary.html')
      .setProperty('id', {
        label: gettext('ID')
      })
      .setProperty('name', {
        label: gettext('Name')
      })
      .setProperty('description', {
        label: gettext('Description'),
        filters: ['noValue']
      })
      .setProperty('size', {
        label: gettext('Size'),
        filters: ['gb']//TODO: Use GiB
      })
      .setProperty('status', {
        label: gettext('Status'),
        filters: ['title']
      })
      .setProperty('volume_id', {
        label: gettext('Volume ID'),
        filters: ['noValue']
      })
      .setProperty('created_at', {
        label: gettext('Created At')
      })
      .tableColumns
      .append({
        id: 'name',
        priority: 1,
        sortDefault: true
      })
      .append({
        id: 'description',
        priority: 1
      })
      .append({
        id: 'size',
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
    var path = $windowProvider.$get().STATIC_URL + 'resources/os-cinder-snapshots';
    $provide.constant('resources.os-cinder-snapshots.basePath', path);
  }
})();
