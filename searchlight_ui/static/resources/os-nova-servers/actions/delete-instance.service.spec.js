/**
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

  describe('resources.os-nova-servers.actions.delete-instance.service', function() {

    var service, $timeout, $q;

    beforeEach(module('resources.os-nova-servers.actions'));
    beforeEach(inject(function($injector, _$timeout_, _$q_) {
      service = $injector.get('resources.os-nova-servers.actions.delete-instance.service');
      $timeout = _$timeout_;
      $q = _$q_;
    }));

    it('exists', function() {
      expect(service).toBeDefined();
    });

    describe('allowed', function() {
      var policyCall, sessionCall;
      beforeEach(inject(function($injector) {
        var policy = $injector.get('horizon.app.core.openstack-service-api.policy');
        var userSession = $injector.get('horizon.app.core.openstack-service-api.userSession');
        policyCall = $q.defer();
        sessionCall = $q.defer();
        spyOn(policy, 'ifAllowed').and.returnValue(policyCall.promise);
        spyOn(userSession, 'isCurrentProject').and.returnValue(sessionCall.promise);
        service.initScope();
      }));

      it('allows when not deleting/deleted/protected and is current project', function() {
        policyCall.resolve();
        sessionCall.resolve();
        service.allowed({status: 'ACTIVE'}).then(pass, fail);
        $timeout.flush();
      });

      it('disallows when deleting', function() {
        policyCall.resolve();
        sessionCall.resolve();
        service.allowed({status: 'ACTIVE', 'OS-EXT-STS:task_state': 'DELETING'}).then(fail, pass);
        $timeout.flush();
      });

      it('disallows when protected', function() {
        policyCall.resolve();
        sessionCall.resolve();
        service.allowed({status: 'ACTIVE', protected: true}).then(fail, pass);
        $timeout.flush();
      });

      it('disallows when not allowed by policy', function() {
        policyCall.reject();
        sessionCall.resolve();
        service.allowed({status: 'ACTIVE'}).then(fail, pass);
        $timeout.flush();
      });

      it('disallows when not current project', function() {
        policyCall.resolve();
        sessionCall.reject();
        service.allowed({status: 'ACTIVE'}).then(fail, pass);
        $timeout.flush();
      });

      it('allows when no instance (batch mode) and has compute:delete policy', function() {
        policyCall.resolve();
        service.allowed().then(pass, fail);
        $timeout.flush();
      });

      it('disallows when no instance (batch mode) and has no compute:delete policy', function() {
        policyCall.reject();
        service.allowed().then(fail, pass);
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
      var policyCall, sessionCall, modalDeferred, spinner, modal, toast, nova;
      beforeEach(inject(function($injector) {
        var policy = $injector.get('horizon.app.core.openstack-service-api.policy');
        var userSession = $injector.get('horizon.app.core.openstack-service-api.userSession');
        spinner = $injector.get('horizon.framework.widgets.modal-wait-spinner.service');
        modal = $injector.get('horizon.framework.widgets.modal.deleteModalService');
        toast = $injector.get('horizon.framework.widgets.toast.service');
        nova = $injector.get('horizon.app.core.openstack-service-api.nova');

        policyCall = $q.defer();
        sessionCall = $q.defer();
        policyCall.resolve();
        sessionCall.resolve();
        modalDeferred = $q.defer();
        spyOn(policy, 'ifAllowed').and.returnValue(policyCall.promise);
        spyOn(userSession, 'isCurrentProject').and.returnValue(sessionCall.promise);
        spyOn(spinner, 'showModalSpinner');
        spyOn(spinner, 'hideModalSpinner');
        spyOn(modal, 'open').and.returnValue(modalDeferred.promise);
        service.initScope();
      }));

      it('shows the wait spinner', function() {
        modalDeferred.resolve({pass: [], fail: []});
        service.perform({});
        $timeout.flush();
        expect(spinner.showModalSpinner).toHaveBeenCalled();
      });

      it('returns the deleted items in the result', function() {
        modalDeferred.resolve({pass: [{context: {id: 12}}], fail: []});
        service.perform({}).then(analyzeResults);
        $timeout.flush();

        function analyzeResults(result) {
          expect(result.deleted.length > 0);
          expect(result.deleted[0].id).toBe(12);
        }
      });

      it('shows a toast if there are failures', function() {
        spyOn(toast, 'add');
        service.perform({'OS-EXT-STS:task_state': 'DELETING'});
        $timeout.flush();
        expect(toast.add).toHaveBeenCalled();
      });

      it('closes the spinner if the modal is canceled', function() {
        modalDeferred.reject();
        service.perform({});
        $timeout.flush();
        expect(spinner.hideModalSpinner).toHaveBeenCalled();
      });

      it('closes the spinner if there are no items', function() {
        service.perform([]);
        $timeout.flush();
        expect(spinner.showModalSpinner).not.toHaveBeenCalled();
      });

      it('sets a function on the context that deletes the item', function() {
        spyOn(nova, 'deleteServer');
        modalDeferred.resolve({pass: [{context: {id: 12}}], fail: []});
        service.perform({});
        $timeout.flush();
        var deleteFunc = modal.open.calls.argsFor(0)[2].deleteEntity;

        deleteFunc({id: 12});
        expect(nova.deleteServer).toHaveBeenCalled();
      });
    });

  });

})();
