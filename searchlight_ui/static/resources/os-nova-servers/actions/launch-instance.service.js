/**
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
    .factory('resources.os-nova-servers.actions.launch-instance.service', launchInstanceService);

  launchInstanceService.$inject = [
    '$q',
    'horizon.dashboard.project.workflow.launch-instance.modal.service',
    'horizon.framework.util.q.extensions'
  ];

  /**
   * @ngDoc factory
   * @name resources.os-nova-servers.actions.launchInstanceService
   * @param {Object} $q
   * @param {Object} launchInstanceModal
   * @param {Object} $qExtensions
   * @Description
   * Brings up the Launch Instance modal.
   * On submit, launch the instance for the Image.
   * On cancel, do nothing.
   *
   * @returns {Object} The service
   */
  function launchInstanceService(
    $q,
    launchInstanceModal,
    $qExtensions
  ) {
    var service = {
      perform: perform,
      allowed: allowed
    };

    return service;

    //////////////

    function perform() {
      // Previous uses of this relocated the display using the successUrl;
      // in this case we leave the post-action behavior up to the result
      // handler.
      return launchInstanceModal.open({});
    }

    function allowed() {
      return $qExtensions.booleanAsPromise(true);
    }

  } // end of launchInstanceService
})(); // end of IIFE
