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

(function() {
  'use strict';

  /**
   * @ngdoc overview
   * @ngname searchlight-ui.dashboard.search.search
   *
   * @description
   * Provides the services and widgets required
   * to support and display the project search panel.
   */
  angular
    .module('searchlight-ui.dashboard.search.search', ['horizon.framework.conf'])
    .config(config)
    .run(run);

  config.$inject = [
    '$provide',
    '$windowProvider',
    '$routeProvider'
  ];

  /**
   * @name searchlight-ui.dashboard.search.search.basePath
   * @description Base path for the project dashboard
   *
   * @param {function} $provide ng provide service
   *
   * @param {function} $windowProvider NG window provider
   *
   * @returns {undefined}
   */
  function config($provide, $windowProvider, $routeProvider) {
    var path = $windowProvider.$get().STATIC_URL + 'dashboard/search/search/';
    $provide.constant('searchlight-ui.dashboard.search.search.basePath', path);

    $routeProvider
      .when('/search/', {
        templateUrl: path + 'table/search-table.html'
      });
  }

  run.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'searchlight-ui.dashboard.search.search.basePath'
  ];

  function run(registry, basePath) {
    registry.setDefaultDrawerTemplateUrl(basePath + 'table/drawer.html');
    registry.setDefaultDetailsTemplateUrl(basePath + 'table/details.html');
  }

})();
