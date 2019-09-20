'use strict';

import hydrajs  from '../../shared/hydrajs';

export default class CepModal {
    constructor($scope, CASE_EVENTS, $uibModalInstance, AlertService, CaseService, DiscussionService, strataService, securityService, $q, $stateParams, RHAUtils, gettextCatalog) {
        'ngInject';

        $scope.CaseService = CaseService;
        $scope.submittingRequest = false;
        $scope.securityService = securityService;
        $scope.disableSubmitRequest = true;
        $scope.cepContactName = '';
        $scope.cepWorkingHours = null;
        $scope.cepContactInformation = '';
        $scope.cepNotes = '';

        $scope.submit = function () {
            if (CaseService.cepModalEvent === CASE_EVENTS.newPageCEP) {
                $scope.submitNewPageCEP();
            } else if (CaseService.cepModalEvent === CASE_EVENTS.editPageCEP) {
                $scope.submitEditPageCEP();
            }
            $uibModalInstance.close();
        };
        
        $scope.closeModal = function () {
            $scope.cepContactName = undefined;
            $scope.cepWorkingHours = null;
            $scope.cepContactInformation = undefined;
            $scope.cepNotes = undefined;
            CaseService.kase.cep = CaseService.prestineKase.cep;
            CaseService.isNewPageCEP = false;
            CaseService.submittingCep = false;
            $uibModalInstance.close();
        };
        $scope.showErrorMessage = function (errorMessage) {
            AlertService.clearAlerts();
            $scope.closeModal();
            $scope.submittingRequest = false;
            CaseService.submittingCep = false;
            AlertService.addStrataErrorMessage(errorMessage);
        };
        $scope.onChangeCepInformation = function () {
            if (RHAUtils.isNotEmpty($scope.cepContactName) && !$scope.submittingRequest && RHAUtils.isNotEmpty($scope.cepWorkingHours)
               && RHAUtils.isNotEmpty($scope.cepContactInformation)) {
                $scope.disableSubmitRequest = false;
            } else {
                $scope.disableSubmitRequest = true;
            }
        };

        function getCepComment() {
            return `---------------------------------\n\t Consultant Engaged\n---------------------------------\n\nThis case has been flagged with Consulting Engagement in Progress (CEP).This issue needs additional focus as Red Hat Consulting is currently engaged and working with the customer.
\nConsulting Contact:\n\nName: ${$scope.cepContactName}\nAvailability/Working Hours: ${$scope.cepWorkingHours}\nContact information: ${$scope.cepContactInformation}\n${$scope.cepNotes ?`Notes: ${$scope.cepNotes}`: ''} `;
        }

        $scope.submitNewPageCEP = async function () {
            CaseService.isNewPageCEP = true;
            CaseService.newPageCEPComment = getCepComment();
        }

        $scope.submitEditPageCEP = async function () {
            $scope.submittingRequest = true;
            CaseService.submittingCep = true;
            var fullComment = getCepComment();
            // add private comment on the case.
            try {
                await strataService.cases.comments.post(CaseService.kase.case_number, fullComment, false, false);
                const caseJSON = {'cep': true};
                await Promise.all([strataService.cases.put(CaseService.kase.case_number, caseJSON),
                    CaseService.populateComments($stateParams.id)]);
                CaseService.checkForCaseStatusToggleOnAttachOrComment();
                AlertService.clearAlerts();
                CaseService.kase.cep = true;
                CaseService.submittingCep = false;
                AlertService.addSuccessMessage(gettextCatalog.getString('Consultant Engagement in Progress flag has been updated successfully'));
                angular.copy(CaseService.kase, CaseService.prestineKase);
                $scope.closeModal();
                $scope.submittingRequest = false;
            } catch(error) {
                $scope.showErrorMessage(error);
            }
        };

        $scope.getNotesTooltip = () => gettextCatalog.getString("Provide any pertinent information that Support delivery should be aware of that's not already captured in the case summary or comments.")
    }
}
