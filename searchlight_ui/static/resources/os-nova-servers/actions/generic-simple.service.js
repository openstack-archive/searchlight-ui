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
    .factory('resources.os-nova-servers.actions.generic-simple.service', factory);

  factory.$inject = [
    '$q',
    'horizon.app.core.openstack-service-api.userSession',
    'horizon.app.core.openstack-service-api.policy',
    'horizon.framework.util.actions.action-result.service',
    'horizon.framework.util.i18n.gettext',
    'horizon.framework.util.q.extensions',
    'horizon.framework.widgets.modal-wait-spinner.service',
    'resources.os-nova-servers.resourceType'
  ];

  /**
   * @ngDoc factory
   * @name resources.os-nova-servers.actions.delete-instance.service
   *
   * @Description
   * Brings up the delete instance confirmation modal dialog.

   * On submit, delete given instances.
   * On cancel, do nothing.
   */
  function factory(
    $q,
    userSessionService,
    policy,
    actionResultService,
    gettext,
    $qExtensions,
    waitSpinner,
    instanceResourceType
  ) {

    return function(config) {
      var policyPromise;
      var service = {
        initScope: initScope,
        allowed: allowed,
        perform: perform
      };
      return service;

      function initScope() {
        policyPromise = policy.ifAllowed({rules: config.rules});
      }

      function perform(item) {
        waitSpinner.showModalSpinner(gettext('Please Wait'));
        return config.execute(item).then(onSuccess, onFailure);

        function onSuccess() {
          waitSpinner.hideModalSpinner();
          return actionResultService.getActionResult()
            .updated(instanceResourceType, item.id)
            .result;
        }

        function onFailure() {
          waitSpinner.hideModalSpinner();
        }
      }

      function allowed(instance) {
        return $q.all([
          policyPromise,
          userSessionService.isCurrentProject(instance.tenant_id),
          properState()
        ]);

        function properState() {
          return $qExtensions.booleanAsPromise(config.validState(instance));
        }
      }
    };
  }
})();
