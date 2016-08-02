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
   * @ngname horizon.app.core.resources.os-neutron-securitygroups
   *
   * @description
   * Provides all of the services and widgets required
   * to support and display security-group related content.
   */
  angular
    .module('resources.os-neutron-securitygroups', [
      'ngRoute'
    ])
    .constant('resources.os-neutron-securitygroups.resourceType',
      'OS::Neutron::SecurityGroup')
    .run(run)
    .config(config);

  run.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'resources.os-neutron-securitygroups.basePath',
    'resources.os-neutron-securitygroups.resourceType'
  ];

  function run(registry, basePath, resourceTypeName) {
    registry.getResourceType(resourceTypeName)
      .setNames(gettext('Security Group'), gettext('Security Groups'))
      .setSummaryTemplateUrl(basePath + '/summary.html')
      .setProperty('id', {
        label: gettext('ID')
      })
      .setProperty('name', {
        label: gettext('Name')
      })
      .setProperty('security_group_rules', {
        label: gettext('Rules'),
        filters: [rulesToString]
      })
      .setProperty('description', {
        label: gettext('Description')
      })
      .tableColumns
      .append({
        id: 'name',
        priority: 1,
        sortDefault: true
      })
      .append({
        id: 'description',
        priority: 1,
        filters: ['noValue']
      });

    function rulesToString(rules) {
      if (!rules) {
        return "";
      }
      return rules.map(ruleToString).join("<br>");
    }

    function ruleToString(rule) {
      return interpolate(gettext("ALLOW %(type)s %(direction)s %(target)s"), {
        type: rule.ethertype,
        direction: rule.direction === 'egress' ? gettext('to') : gettext('from'),
        target: rule.remote_ip_prefix === null ? gettext('default') : rule.remote_ip_prefix
      }, true);
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
    var path = $windowProvider.$get().STATIC_URL + 'resources/os-neutron-securitygroups';
    $provide.constant('resources.os-neutron-securitygroups.basePath', path);
  }
})();
