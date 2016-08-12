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
    .controller('ServerConsoleController', controller);

  controller.$inject = [
    'resources.os-nova-servers.resourceType',
    'horizon.app.core.openstack-service-api.nova',
    'horizon.framework.conf.resource-type-registry.service',
    '$sce',
    '$scope'
  ];

  function controller(
    resourceTypeCode,
    nova,
    registry,
    $sce,
    $scope
  ) {
    var ctrl = this;

    ctrl.server = {};
    ctrl.resourceType = registry.getResourceType(resourceTypeCode);
    ctrl.toldToConnect = false;
    ctrl.connect = connect;

    var fixHeight = function() {
      $('iframe#console_embed').css({ height: $(document).height() + 'px' });
    };
    // there are two code paths to this particular block; handle them both
    if (typeof ($) !== 'undefined') {
      $(document).ready(fixHeight);
    } else {
      addHorizonLoadEvent(fixHeight);
    }

    function connect() {
      ctrl.toldToConnect = true;
    }

    $scope.context.loadPromise.then(onGetResponse);

    function onGetResponse(response) {
      ctrl.server = response.data;
      nova.getConsoleInfo(ctrl.server.id).then(setData);

      function setData(response) {
        ctrl.safeUrl = $sce.trustAsResourceUrl(response.data.url);
        ctrl.consoleInfo = response.data;
      }
    }
  }

})();
