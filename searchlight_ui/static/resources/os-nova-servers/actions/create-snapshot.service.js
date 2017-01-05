/**
 *
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
    .factory('resources.os-nova-servers.actions.create-snapshot.service', createSnapshotService);

  createSnapshotService.$inject = [
    '$uibModal',
    '$q',
    'resources.os-nova-servers.basePath',
    'horizon.app.core.images.resourceType',
    'horizon.app.core.openstack-service-api.nova',
    'horizon.app.core.openstack-service-api.policy',
    'horizon.app.core.openstack-service-api.serviceCatalog',
    'horizon.framework.util.q.extensions',
    'horizon.framework.widgets.toast.service',
    'horizon.framework.widgets.modal-wait-spinner.service'
  ];

  /**
   * @ngDoc factory
   * @name horizon.app.core.images.actions.create-volume.service
   *
   * @Description
   * Brings up the Create Instance snapshot modal.
   */
  function createSnapshotService(
    $uibModal,
    $q,
    basePath,
    imageResourceType,
    nova,
    policy,
    serviceCatalog,
    $qExtensions,
    toast,
    waitSpinner
  ) {
    var createSnapshotPolicy, computeServiceEnabled, newSnapshotName;
    var SNAPSHOT_READY_STATES = ["ACTIVE", "SHUTOFF", "PAUSED", "SUSPENDED"];
    var message = {
      success: gettext('Snapshot %s was successfully created.')
    };

    var service = {
      initScope: initScope,
      allowed: allowed,
      perform: perform
    };

    return service;

    /////////////////

    function initScope() {
      createSnapshotPolicy = policy.ifAllowed({rules: [['compute', 'compute:snapshot']]});
      computeServiceEnabled = serviceCatalog.ifTypeEnabled('compute');
    }

    function allowed(instance) {
      return $q.all([
        createSnapshotPolicy,
        computeServiceEnabled,
        instanceSnapshotReady(instance),
        instanceNotDeleting(instance)
      ]);
    }

    function perform(instance) {
      var modalParams = {
        templateUrl: basePath + 'actions/create-snapshot.html',
        controller: "CreateSnapshotController as ctrl",
        resolve: {
          context: function() {
            return {
              name: undefined,
              instance_id: instance.id
            };
          }
        }
      };

      return $uibModal.open(modalParams).result.then(onSubmit, onCancel);
    }

    function onSubmit(context) {
      // The nova call doesn't return the name of the newly created snapshot.
      // Instead, remember it so we can display it in the success message.
      newSnapshotName = context.name;

      waitSpinner.showModalSpinner(gettext('Creating Snapshot'));

      return nova.createServerSnapshot({
        name: context.name,
        instance_id: context.instance_id
      }).then(onSuccess, onFailure);
    }

    function onCancel() {
      waitSpinner.hideModalSpinner();
    }

    function onSuccess(response) {
      waitSpinner.hideModalSpinner();
      var snapshotId = response.data;
      toast.add('success', interpolate(message.success, [newSnapshotName]));

      // To make the result of this action generically useful, reformat the return
      // from the deleteModal into a standard form
      return {
        created: [{type: imageResourceType, id: snapshotId}],
        updated: [],
        deleted: [],
        failed: []
      };
    }

    function onFailure() {
      waitSpinner.hideModalSpinner();
    }

    function instanceSnapshotReady(instance) {
      return $qExtensions.booleanAsPromise(
        SNAPSHOT_READY_STATES.indexOf(instance.status) >= 0);
    }

    function instanceNotDeleting(instance) {
      var result, taskState;
      taskState = instance["OS-EXT-STS:task_state"];
      if (!taskState) {
        result = true;
      } else {
        result = taskState.toLowerCase() !== "deleting";
      }
      return $qExtensions.booleanAsPromise(result);
    }
  }
})();
