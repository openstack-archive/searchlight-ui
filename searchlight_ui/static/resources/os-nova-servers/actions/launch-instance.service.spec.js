/**
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

  describe('resources.os-nova-servers.actions.launch-instance.service', function() {
    var service, modalService, $timeout;

    beforeEach(module('resources.os-nova-servers.actions'));
    beforeEach(inject(function($injector, _$timeout_) {
      service = $injector.get('resources.os-nova-servers.actions.launch-instance.service');
      var svcName = 'horizon.dashboard.project.workflow.launch-instance.modal.service';
      modalService = $injector.get(svcName);
      $timeout = _$timeout_;
    }));

    it('exists', function() {
      expect(service).toBeDefined();
    });

    describe('perform', function() {
      it('opens the modal', function() {
        spyOn(modalService, 'open');
        service.perform();
        expect(modalService.open).toHaveBeenCalled();
      });
    });

    describe('allowed', function() {
      it('always succeeds', function() {
        service.allowed().then(pass, fail);
        $timeout.flush();
      });

      function pass() {
        expect(true).toBe(true);
      }

      function fail() {
        expect(true).toBe(false);
      }
    });
  });

})();
