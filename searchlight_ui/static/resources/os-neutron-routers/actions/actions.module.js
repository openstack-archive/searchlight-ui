/**
 * (c) Copyright 2016 Hewlett Packard Enterprise Development Company LP
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
   * @ngname resources.os-neutron-routers.actions
   *
   * @description
   * Provides all of the actions for instances.
   */
  angular.module('resources.os-neutron-routers.actions',
    [
      'horizon.framework.conf',
      'searchlight-ui.util',
      'resources.os-neutron-routers'
    ])
    .run(run);

  run.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'searchlight-ui.util.redirect-action.service',
    'resources.os-neutron-routers.resourceType'
  ];

  function run(
    registry,
    redirectService,
    resourceTypeCode)
  {
    var resourceType = registry.getResourceType(resourceTypeCode);
    resourceType.itemActions
      .append({
        id: 'legacyService',
        service: redirectService(legacyPath),
        template: {
          text: gettext("More Actions...")
        }
      });

    function legacyPath(item) {
      return 'project/routers/' + item.id + '/';
    }
  }

})();
