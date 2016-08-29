/**
 * (c) Copyright 2016 Hewlett Packard Enterprise Development Company LP
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use self file except in compliance with the License. You may obtain
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

  angular
    .module('resources.os-nova-servers.actions')
    .factory('resources.os-nova-servers.actions.pause.service', factory);

  factory.$inject = [
    'horizon.app.core.openstack-service-api.nova',
    'resources.os-nova-servers.actions.generic-simple.service',
    'resources.os-nova-servers.instance-status.service'
  ];

  /**
   * @ngDoc factory
   * @name resources.os-nova-servers.actions.pause.service
   *
   * @Description
   * Pauses the instance
   */
  function factory(nova, simpleService, statusService) {

    var config = {
      rules: [['compute', 'compute_extension:admin_actions:pause']],
      execute: execute,
      validState: validState
    };

    return simpleService(config);

    function execute(instance) {
      return nova.pauseServer(instance.id);
    }

    function validState(instance) {
      // TODO: Original Python code describes extension-supported: AdminActions
      return statusService.anyStatus(instance, ['ACTIVE']) &&
        !statusService.isDeleting(instance);
    }
  }
})();
