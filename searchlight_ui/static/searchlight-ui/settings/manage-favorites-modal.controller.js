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
(function () {
  'use strict';

  angular
    .module('searchlight-ui.settings')
    .controller('searchlight-ui.settings.manageFavoritesController', ManageFavoritesController);

  ManageFavoritesController.$inject = [
    'searchlight-ui.settings.settingsService'
  ];

  function ManageFavoritesController(searchSettings) {
    var ctrl = this;
    ctrl.favorites = searchSettings.settings.queries.favorites;
    ctrl.removeFavoriteQuery =

      function removeFavoriteQuery(name) {
        searchSettings.removeFavoriteQuery(name);
        ctrl.favorites.length = 0;
        ctrl.favorites.push.apply(searchSettings.settings.queries.favorites);
      };
  }

})();
