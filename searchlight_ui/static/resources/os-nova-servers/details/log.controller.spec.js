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
    beforeEach(module('horizon.framework.util'));
    beforeEach(inject(function($injector, $controller, _$q_, _$timeout_) {
      $timeout = _$timeout_;
      $q = _$q_;
      var deferred = $q.defer();
      deferred.resolve({data: {my: 'info'}});
      var scope = {
        context: {
          loadPromise: deferred.promise
        }
      };
      ctrl = $controller('ServerConsoleLogController', {
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
        spyOn(nova, 'getConsoleLog').and.returnValue(deferred.promise);
        deferred.resolve({data: {lines: ['line3', 'line2', 'line1']}});
        $timeout.flush();
      }));

      it('sets data on load', function() {
        expect(ctrl.server).toEqual({my: 'info'});
      });

      it('sets ctrl.log to the concatenation of lines', function() {
        expect(ctrl.log).toBe('line3\nline2\nline1');
      });

      it('sets ctrl.logLength to 35 by default', function() {
        expect(ctrl.logLength).toBe(35);
      });

      describe('refresh (after loading)', function() {
        beforeEach(function() {
          nova.getConsoleLog.calls.reset();
        });

        it('calls getConsoleLog with control server ID and length', function() {
          ctrl.server.id = 321;
          ctrl.logLength = 100;
          ctrl.refresh();
          expect(nova.getConsoleLog).toHaveBeenCalledWith(321, 100);
        });
      });

    });

  });

})();
