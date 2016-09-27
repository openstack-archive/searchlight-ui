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
   * @ngname resources.os-nova-servers.actions
   *
   * @description
   * Provides all of the actions for instances.
   */
  angular.module('resources.os-nova-servers.actions',
    [
      'horizon.framework.conf',
      'horizon.framework.widgets',
      'horizon.dashboard.project.workflow.launch-instance',
      'ui.bootstrap',
      'searchlight-ui.util',
      'resources.os-nova-servers'
    ])
    .run(run);

  run.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'resources.os-nova-servers.actions.launch-instance.service',
    'searchlight-ui.util.redirect-action.service',
    //'resources.os-nova-servers.actions.create-snapshot.service',
    'resources.os-nova-servers.actions.delete-instance.service',
    'resources.os-nova-servers.actions.pause.service',
    'resources.os-nova-servers.actions.unpause.service',
    'resources.os-nova-servers.actions.suspend.service',
    'resources.os-nova-servers.actions.resume.service',
    'resources.os-nova-servers.actions.hard-reboot.service',
    'resources.os-nova-servers.actions.soft-reboot.service',
    'resources.os-nova-servers.actions.start.service',
    'resources.os-nova-servers.actions.stop.service',
    'resources.os-nova-servers.resourceType'
  ];

  function run(
    registry,
    launchInstanceService,
    redirectService,
    //createSnapshotService,
    deleteService,
    pauseService,
    unpauseService,
    suspendService,
    resumeService,
    hardRebootService,
    softRebootService,
    startService,
    stopService,
    instanceResourceTypeCode)
  {
    var instanceResourceType = registry.getResourceType(instanceResourceTypeCode);
    instanceResourceType.globalActions
      .append({
        id: 'launchInstanceService',
        service: launchInstanceService,
        template: {
          text: gettext('Create Instance')
        }
      });
    instanceResourceType.batchActions
      .append({
        id: 'deleteService',
        service: deleteService,
        template: {
          type: 'delete-selected',
          text: gettext('Delete')
        }
      });
    instanceResourceType.itemActions
      .append({
        id: 'pauseService',
        service: pauseService,
        template: {
          text: gettext('Pause')
        }
      })
      .append({
        id: 'unpauseService',
        service: unpauseService,
        template: {
          text: gettext('Unpause')
        }
      })
      .append({
        id: 'suspendService',
        service: suspendService,
        template: {
          text: gettext('Suspend')
        }
      })
      .append({
        id: 'resumeService',
        service: resumeService,
        template: {
          text: gettext('Resume')
        }
      })
      .append({
        id: 'hardRebootService',
        service: hardRebootService,
        template: {
          text: gettext('Hard Reboot')
        }
      })
      .append({
        id: 'softRebootService',
        service: softRebootService,
        template: {
          text: gettext('Soft Reboot')
        }
      })
      .append({
        id: 'startService',
        service: startService,
        template: {
          text: gettext('Start')
        }
      })
      .append({
        id: 'stopService',
        service: stopService,
        template: {
          text: gettext('Stop')
        }
      })
      .append({
        id: 'legacyService',
        service: redirectService(legacyPath),
        template: {
          text: gettext("More Actions...")
        }
      })
      .append({
        id: 'deleteService',
        service: deleteService,
        template: {
          type: 'delete',
          text: gettext('Delete')
        }
/*
      })
      .append({
        id: 'createSnapshotService',
        service: createSnapshotService,
        template: {
          text: gettext('Create Snapshot')
        }
*/
      });

    function legacyPath(item) {
      return 'project/instances/' + item.id + '/';
    }
  }

})();
