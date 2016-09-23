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
   * @ngname horizon.app.core.volumes
   *
   * @description
   * Provides all of the services and widgets required
   * to support and display volumes related content.
   */
  angular
    .module('resources.os-cinder-volumes', [
      'ngRoute',
      'resources.os-cinder-volumes.actions'
    ])
    .constant('resources.os-cinder-volumes.resourceType', 'OS::Cinder::Volume')
    .run(run)
    .config(config);

  run.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'resources.os-cinder-volumes.basePath',
    'resources.os-cinder-volumes.resourceType'
  ];

  function run(registry, basePath, volumeResourceType) {
    registry.getResourceType(volumeResourceType)
      .setNames(gettext('Volume'), gettext('Volumes'))
      .setSummaryTemplateUrl(basePath + '/summary.html')
      .setProperty('attachments', {
        label: gettext('Attached To')
      })
      .setProperty('availability_zone', {
        label: gettext('Availability Zone')
      })
      .setProperty('bootable', {
        label: gettext('Bootable'),
        filters: ['yesno']
      })
      .setProperty('consistencygroup_id', {
        label: gettext('Consistency Group ID'),
        filters: ['noValue']
      })
      .setProperty('created_at', {
        label: gettext('Created At')
      })
      .setProperty('description', {
        label: gettext('Description')
      })
      .setProperty('encrypted', {
        label: gettext('Encrypted'),
        filters: ['yesno']
      })
      .setProperty('id', {
        label: gettext('ID')
      })
      .setProperty('imageRef', {
        label: gettext('Image Reference'),
        filters: ['noValue']
      })
      .setProperty('name', {
        label: gettext('Name'),
        filters: ['noValue']
      })
      .setProperty('size', {
        label: gettext('Size'),
        filters: ['gb']
      })
      .setProperty('snapshot_id', {
        label: gettext('Snapshot ID'),
        filters: ['noValue']
      })
      .setProperty('source_volid', {
        label: gettext('Source Volume ID'),
        filters: ['noValue']
      })
      .setProperty('status', {
        label: gettext('Status'),
        filters: ['title']
      })
      .setProperty('transfer', {
        label: gettext('Transfer'),
        filters: ['noValue']
      })
      .setProperty('volume_image_metadata', {
        label: gettext('Volume Image Metadata')
      })
      .setProperty('volume_type', {
        label: gettext('Type')
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
      })
      .append({
        id: 'volume_type',
        priority: 2
      })
      .append({
        id: 'attachments',
        priority: 2
      })
      .append({
        id: 'availability_zone',
        priority: 2
      })
      .append({
        id: 'bootable',
        priority: 2
      })
      .append({
        id: 'encrypted',
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
    var path = $windowProvider.$get().STATIC_URL + 'resources/os-cinder-volumes';
    $provide.constant('resources.os-cinder-volumes.basePath', path);
  }
})();
