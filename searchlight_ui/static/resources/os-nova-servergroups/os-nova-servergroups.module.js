/*
 *    (c) Copyright 2016 Huawei Technology Ltd.
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
   * @name resources.os-nova-servergroups
   * @description
   *
   * # resources.os-nova-servergroups
   *
   * This module provides OpenStack Nova ServerGroups functionality
   */
  angular.module('resources.os-nova-servergroups', [
  ])
  .constant('resources.os-nova-servergroups.resourceTypeName', 'OS::Nova::ServerGroup')
    .run(run)
    .config(config);

  run.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'resources.os-nova-servergroups.basePath',
    'resources.os-nova-servergroups.resourceTypeName'
  ];

  function run(registry, basePath, resourceTypeName) {
    registry.getResourceType(resourceTypeName)
      .setNames(gettext('Server Group'), gettext('Server Groups'))
      .setSummaryTemplateUrl(basePath + '/summary.html')
      .setProperty('id', {
        label: gettext('ID')
      })
      .setProperty('name', {
        label: gettext('Name'),
        filters: ['noValue']
      })
      .setProperty('project_id', {
        label: gettext('Project ID')
      })
      .setProperty('user_id', {
        label: gettext('User ID')
      })
      .setProperty('policies', {
        label: gettext('Policies')
      })
      .setProperty('members', {
        label: gettext('Members')
      })
      .tableColumns
      .append({
        id: 'name',
        priority: 1,
        sortDefault: true
      })
      .append({
        id: 'user_id',
        priority: 1
      })
      .append({
        id: 'id',
        priority: 1
      })
      .append({
        id: 'policies',
        priority: 1
      })
      .append({
        id: 'members',
        priority: 1
      });
  }

  config.$inject = [
    '$provide',
    '$windowProvider'
  ];

  /**
   * Provides server group base path.
   * @name config
   * @param {Object} $provide
   * @param {Object} $windowProvider
   * @returns {undefined} Returns nothing
   */
  function config($provide, $windowProvider) {
    var path = $windowProvider.$get().STATIC_URL + 'resources/os-nova-servergroups';
    $provide.constant('resources.os-nova-servergroups.basePath', path);
  }

})();
