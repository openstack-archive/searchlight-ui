/**
 * (c) Copyright 2016 Hewlett Packard Enterprise Development Company LP
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function() {
  'use strict';

  /**
   * @ngdoc controller
   * @name CreateSnapshotController
   *
   * @param(object) modal instance from angular-bootstrap
   * @param(object) context object provided by the user
   *
   * @description
   * Controller for create snapshot action modal.
   * If user presses cancel button or closes dialog, modal gets dismissed.
   * If user presses submit button, form input is validated then the modal
   * is closed and the context object is passed back so that the caller can
   * use any of the inputs.
   */
  angular
    .module('resources.os-nova-servers.actions')
    .controller('CreateSnapshotController', CreateSnapshotController);

  CreateSnapshotController.$inject = [
    '$uibModalInstance',
    'context'
  ];

  function CreateSnapshotController($uibModalInstance, context) {
    var ctrl = this;
    ctrl.submit = submit;
    ctrl.cancel = cancel;

    // Contains any data modified by the form. Will be passed back from the
    // modal instance close and dismiss functions.
    ctrl.context = context;

    function submit() {
      ctrl.form.$setSubmitted();
      if (ctrl.form.$valid ) {
        $uibModalInstance.close(context);
      }
    }

    function cancel() {
      $uibModalInstance.dismiss(context);
    }

    return ctrl;

  }

})();
