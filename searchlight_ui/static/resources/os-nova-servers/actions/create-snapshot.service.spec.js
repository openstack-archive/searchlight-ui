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

  describe('resources.os-nova-servers.actions.create-snapshot.service', function() {
    var service, $uibModal, $q, $timeout, spinner, nova;

    beforeEach(module('resources.os-nova-servers.actions'));
    beforeEach(module('horizon.app.core.images'));
    beforeEach(module('horizon.framework'));

    beforeEach(inject(function($injector, _$q_, _$timeout_) {
      service = $injector.get('resources.os-nova-servers.actions.create-snapshot.service');
      $uibModal = $injector.get('$uibModal');
      spinner = $injector.get('horizon.framework.widgets.modal-wait-spinner.service');
      $q = _$q_;
      $timeout = _$timeout_;
      nova = $injector.get('horizon.app.core.openstack-service-api.nova');
    }));

    it('exists', function() {
      expect(service).toBeDefined();
    });

    describe('allowed', function() {
      var policy, catalog;
      beforeEach(inject(function($injector) {
        policy = $injector.get('horizon.app.core.openstack-service-api.policy');
        catalog = $injector.get('horizon.app.core.openstack-service-api.serviceCatalog');
      }));

      it('allows when not deleting and in valid state', function() {
        spyOn(policy, 'ifAllowed').and.returnValue(true);
        spyOn(catalog, 'ifTypeEnabled').and.returnValue(true);
        service.initScope();
        ["ACTIVE", "SHUTOFF", "PAUSED", "SUSPENDED"].forEach(function(status) {
          service.allowed({status: status}).then(pass, fail);
          $timeout.flush();
        });
      });

      it('disallows when fails policy', function() {
        var policyCall = $q.defer();
        policyCall.reject();
        spyOn(policy, 'ifAllowed').and.returnValue(policyCall.promise);
        spyOn(catalog, 'ifTypeEnabled').and.returnValue(true);
        service.initScope();
        service.allowed({status: 'ACTIVE'}).then(fail, pass);
        $timeout.flush();
      });

      it('disallows when fails policy', function() {
        var catalogCall = $q.defer();
        catalogCall.reject();
        spyOn(policy, 'ifAllowed').and.returnValue(true);
        spyOn(catalog, 'ifTypeEnabled').and.returnValue(catalogCall.promise);
        service.initScope();
        service.allowed({status: 'ACTIVE'}).then(fail, pass);
        $timeout.flush();
      });

      it('disallows when deleting and in valid state', function() {
        spyOn(policy, 'ifAllowed').and.returnValue(true);
        spyOn(catalog, 'ifTypeEnabled').and.returnValue(true);
        service.initScope();
        ["ACTIVE", "SHUTOFF", "PAUSED", "SUSPENDED"].forEach(function(status) {
          service.allowed({status: status, "OS-EXT-STS:task_state": 'DELETING'}).then(fail, pass);
          $timeout.flush();
        });
      });

      it('disallows when not deleting and in UNKNOWN state', function() {
        spyOn(policy, 'ifAllowed').and.returnValue(true);
        spyOn(catalog, 'ifTypeEnabled').and.returnValue(true);
        service.initScope();
        service.allowed({status: 'UNKNOWN'}).then(fail, pass);
        $timeout.flush();
      });

      function pass() {
        expect(true).toBe(true);
      }

      function fail() {
        expect(true).toBe(false);
      }
    });

    describe('perform', function() {
      var deferred;
      beforeEach(function() {
        deferred = $q.defer();
        spyOn($uibModal, 'open').and.returnValue({result: deferred.promise});
      });
      it('opens a modal', function() {
        service.perform({id: 123});
        expect($uibModal.open).toHaveBeenCalled();
      });

      it('the modal is given the right context', function() {
        service.perform({id: 123});
        var params = $uibModal.open.calls.argsFor(0)[0];
        expect(params.resolve.context()).toEqual({name: undefined, instance_id: 123});
      });

      describe('on cancel', function() {

        beforeEach(function() {
          spyOn(spinner, 'hideModalSpinner');
          service.perform({id: 123});
          deferred.reject();
          $timeout.flush();
        });

        it('it closes the modal', function() {
          expect(spinner.hideModalSpinner).toHaveBeenCalled();
        });

      });

      describe('on submit', function() {
        var novaCall, returnValue;

        function postAction(val) {
          returnValue = val;
        }

        beforeEach(function() {
          spyOn(spinner, 'showModalSpinner');
          service.perform({id: 123}).then(postAction);
          novaCall = $q.defer();
          spyOn(nova, 'createServerSnapshot').and.returnValue(novaCall.promise);
          deferred.resolve({name: 'Buffy', instance_id: 123, extra: 'stuff'});
          $timeout.flush();
        });

        it('hides the modal spinner', function() {
          expect(spinner.showModalSpinner).toHaveBeenCalled();
        });

        it('calls nova.createServerSnapshot with right object', function() {
          var expected = {
            name: 'Buffy',
            instance_id: 123
          };
          expect(nova.createServerSnapshot).toHaveBeenCalledWith(expected);
        });

        describe('on nova failure', function() {
          beforeEach(function() {
            spyOn(spinner, 'hideModalSpinner');
            novaCall.reject();
            $timeout.flush();
          });

          it('closes the spinner', function() {
            expect(spinner.hideModalSpinner).toHaveBeenCalled();
          });

        });

        describe('on nova success', function() {
          beforeEach(function() {
            spyOn(spinner, 'hideModalSpinner');
            novaCall.resolve({data: {}});
            $timeout.flush();
          });

          it('closes the spinner', function() {
            expect(spinner.hideModalSpinner).toHaveBeenCalled();
          });

          it('returns a success object with a created member', function() {
            expect(returnValue.created).toBeDefined();
          });

        });

      });
    });

  });

})();
