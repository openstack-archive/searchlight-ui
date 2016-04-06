/**
 * (c) Copyright 2015 Hewlett-Packard Development Company, L.P.
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

(function () {
  'use strict';

  /**
   * @ngdoc controller
   * @name horizon.dashboard.project.search.settingsController
   *
   * @param(object) modal instance from angular-bootstrap
   * @param(object) the settings to display
   */
  angular
    .module('horizon.dashboard.project.search')
    .controller('searchSettingsController', SettingsController);

  SettingsController.$inject = [
    '$modalInstance',
    'searchSettings'
  ];

  function SettingsController($modalInstance, searchSettings) {
    var ctrl = this;
    ctrl.settings = searchSettings;
    ctrl.dismiss = dismiss;
    ctrl.apply = apply;

    function apply() {
      $modalInstance.close();
    }

    function dismiss() {
      $modalInstance.dismiss('cancel');
    }

  } // end of function

})();
