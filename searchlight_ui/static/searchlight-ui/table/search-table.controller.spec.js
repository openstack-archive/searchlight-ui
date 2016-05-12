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

  describe('searchlight-ui table controller', function () {

    function fakeSearchlight() {
      return {
        success: function (callback) {
          callback({
            items: []
          });
        }
      };
    }

    var controller, searchlightAPI, $scope;

    ////////////////////
    beforeEach(module('horizon.framework'));
    beforeEach(module('horizon.app.core'));
    beforeEach(module('searchlight-ui'));
    beforeEach(inject(function ($injector) {
      $scope = $injector.get('$rootScope').$new();

      searchlightAPI = $injector.get('horizon.app.core.openstack-service-api.searchlight');
      controller = $injector.get('$controller');

      spyOn(searchlightAPI, 'postSearch').and.callFake(fakeSearchlight);
    }));

    function createController() {
      return controller('searchlight-ui.table.searchTableController', {
        searchlightAPI: searchlightAPI,
        '$scope': $scope
      });
    }

    // I believe the following is not a valid test.
    //it('should invoke searchlightAPI apis', function () {
    //  createController();
    //  expect(searchlightAPI.postSearch).toHaveBeenCalled();
    //});

    it('should set facets for search', function () {
      var ctrl = createController();
      expect(ctrl.searchFacets).toBeDefined();
      expect(ctrl.searchFacets.length).toEqual(3);
      expect(ctrl.defaultFacets[0].name).toEqual('name');
      expect(ctrl.defaultFacets[1].name).toEqual('created_at');
      expect(ctrl.defaultFacets[2].name).toEqual('updated_at');
    });

  });
})();
