/*
 * (c) Copyright 2016 Hewlett Packard Enterprise Development Company LP
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() {
  "use strict";

  angular
    .module('resources.os-nova-servers.details')
    .controller('ServerActionLogController', controller);

  controller.$inject = [
    'resources.os-nova-servers.resourceType',
    'horizon.app.core.openstack-service-api.nova',
    'horizon.framework.conf.resource-type-registry.service',
    '$scope'
  ];

  var ACTION_DISPLAY_CHOICES = {
    create: gettext("Create"),
    pause: gettext("Pause"),
    unpause: gettext("Unpause"),
    rebuild: gettext("Rebuild"),
    resize: gettext("Resize"),
    confirmresize: gettext("Confirm Resize"),
    suspend: gettext("Suspend"),
    resume: gettext("Resume"),
    reboot: gettext("Reboot"),
    stop: gettext("Stop"),
    start: gettext("Start")
  };

  function controller(
    resourceTypeCode,
    nova,
    registry,
    $scope
  ) {
    var ctrl = this;

    ctrl.server = {};
    ctrl.resourceType = registry.getResourceType(resourceTypeCode);

    ctrl.refresh = refresh;

    $scope.context.loadPromise.then(onGetResponse);

    function refresh() {
      nova.getActionList(ctrl.server.id).then(setData);
    }

    function cleanTime(time) {
      return time.replace(/\.\d*$/, '') + 'Z';
    }

    function onGetResponse(response) {
      ctrl.server = response.data;
      nova.getActionList(ctrl.server.id).then(setData);
    }

    function setData(response) {
      ctrl.config = {
        selectAll: false,
        expand: false,
        trackId: 'request_id',
        columns: [
          {id: 'request_id', title: gettext('Request')},
          {id: 'action', title: gettext('Action'), filters: [actionChoices]},
          {id: 'start_time', title: gettext('Start Time'), filters: [cleanTime]},
          {id: 'user_id', title: gettext('User ID')},
          {id: 'message', title: gettext('Message'), filters: ['noValue']}
        ]
      };
      ctrl.items = response.data.items;

      function actionChoices(input) {
        return ACTION_DISPLAY_CHOICES[input];
      }
    }
  }

})();
