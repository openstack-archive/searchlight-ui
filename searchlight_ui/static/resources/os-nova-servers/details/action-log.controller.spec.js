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

  describe('ServerActionLogController', function() {
    var ctrl, $timeout, nova, $q;

    beforeEach(module('resources.os-nova-servers.details'));
    beforeEach(inject(function($injector, $controller, _$q_, _$timeout_) {
      $q = _$q_;
      $timeout = _$timeout_;
      nova = $injector.get('horizon.app.core.openstack-service-api.nova');
      var deferred = $q.defer();
      deferred.resolve({data: {my: 'info'}});
      var scope = {
        context: {
          loadPromise: deferred.promise
        }
      };
      ctrl = $controller('ServerActionLogController', {
        $scope: scope
      });
    }));

    it('exists', function() {
      expect(ctrl).toBeDefined();
    });

    it('sets resourceType', function() {
      expect(ctrl.resourceType).toBeDefined();
    });

    it('sets data on load', function() {
      var deferred = $q.defer();
      deferred.resolve({data: [{some: 'results'}]});
      spyOn(nova, 'getActionList').and.returnValue(deferred.promise);
      $timeout.flush();
      expect(ctrl.server).toEqual({my: 'info'});
    });

    it('sets config and items when the actions are returned', function() {
      var deferred = $q.defer();
      deferred.resolve({data: {items: [{some: 'results'}]}});
      spyOn(nova, 'getActionList').and.returnValue(deferred.promise);
      expect(ctrl.items).toBeUndefined();
      expect(ctrl.config).toBeUndefined();
      $timeout.flush();
      expect(ctrl.items).toEqual([{some: 'results'}]);
      expect(ctrl.config).toBeDefined();
    });

  });

})();
