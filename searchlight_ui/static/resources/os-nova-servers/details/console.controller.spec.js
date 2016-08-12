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

  describe('ServerOverviewController', function() {
    var ctrl, $timeout, $q;

    beforeEach(module('resources.os-nova-servers.details'));
    beforeEach(inject(function($controller, _$q_, _$timeout_) {
      $q = _$q_;
      $timeout = _$timeout_;
      var deferred = $q.defer();
      deferred.resolve({data: {my: 'info'}});
      var scope = {
        context: {
          loadPromise: deferred.promise
        }
      };
      ctrl = $controller('ServerConsoleController', {
        $scope: scope
      });
    }));

    it('exists', function() {
      expect(ctrl).toBeDefined();
    });

    it('sets resourceType', function() {
      expect(ctrl.resourceType).toBeDefined();
    });

    describe('on load', function() {
      var deferred, nova;

      beforeEach(inject(function($injector) {
        nova = $injector.get('horizon.app.core.openstack-service-api.nova');
        deferred = $q.defer();
        spyOn(nova, 'getConsoleInfo').and.returnValue(deferred.promise);
        deferred.resolve({data: {url: 'http://some.where/', type: 'VNC'}});
        $timeout.flush();
      }));

      it('sets data on load', function() {
        expect(ctrl.server).toEqual({my: 'info'});
      });

      it('sets ctrl.consoleInfo.type to the given type', function() {
        expect(ctrl.consoleInfo.type).toBe('VNC');
      });

      it('sets ctrl.safeType', function() {
        expect(ctrl.safeUrl).toBeDefined();
      });
    });

  });

})();
