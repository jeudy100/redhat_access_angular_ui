'use strict';

import _ from 'lodash';
import { getRedhatDotComHost } from '../../shared/utils';

export default class Edit {
    constructor($scope, $stateParams, $location, AttachmentsService, CaseService, strataService, HeaderService, RecommendationsService,
        $rootScope, AUTH_EVENTS, AlertService, securityService, EDIT_CASE_CONFIG, CASE_EVENTS, $sce, gettextCatalog, RHAUtils, $uibModal, COMMON_CONFIG, SearchBoxService) {
        'ngInject';

        $scope.EDIT_CASE_CONFIG = EDIT_CASE_CONFIG;
        $scope.COMMON_CONFIG = COMMON_CONFIG;
        $scope.securityService = securityService;
        $scope.AttachmentsService = AttachmentsService;
        $scope.CaseService = CaseService;
        $scope.HeaderService = HeaderService;
        $scope.fromNewCase = false;
        $scope.RecommendationsService = RecommendationsService;
        CaseService.clearCase();
        $scope.loading = {};
        $scope.loading.kase = true;
        CaseService.loadingCase = true;
        $scope.isShowRmeEscalationBox = false;
        $scope.isCreateRmeEscalationBox = true;
        $scope.ownerTooltip = '';
        $scope.cepMessage = gettextCatalog.getString("Used by consultants to indicate that a consulting engagement is in progress and the issue requires increased attention from support resources");
        $scope.showCasePage = () => securityService.loginStatus.isLoggedIn && !HeaderService.pageLoadFailure && CaseService.sfdcIsHealthy && securityService.loginStatus.userAllowedToManageCases && !$scope.loading.kase;

        $scope.init = function () {
            SearchBoxService.clear();
            AttachmentsService.clear();
            RecommendationsService.clear();
            HeaderService.pageLoadFailure = false;
            $scope.loading.kase = true;
            CaseService.loadingCase = true;
            $scope.recommendationsLoading = true;
            strataService.cases.get($stateParams.id).then(function (resp) {
                HeaderService.pageLoadFailure = false;
                var caseJSON = resp[0];
                var cacheHit = resp[1];
                if (!cacheHit) {
                    CaseService.defineCase(caseJSON);
                } else {
                    CaseService.setCase(caseJSON);
                }
                setOpenShiftProductFlag();
                $rootScope.$broadcast(CASE_EVENTS.received);
                $scope.loading.kase = false;
                CaseService.loadingCase = false;
                if (caseJSON.account_number !== undefined) {
                    strataService.accounts.get(caseJSON.account_number).then(function (account) {
                        CaseService.defineAccount(account);
                    }, function (error) {
                        AlertService.addStrataErrorMessage(error);
                    });
                }
                if (EDIT_CASE_CONFIG.showRecommendations) {
                    RecommendationsService.populatePinnedRecommendations();
                    RecommendationsService.getRecommendations(false).then(angular.noop, function (error) {
                        AlertService.addStrataErrorMessage(error);
                    });
                }
                if (EDIT_CASE_CONFIG.showEmailNotifications) {
                    CaseService.defineNotifiedUsers();
                }
                if (EDIT_CASE_CONFIG.showCaseEscalation) {
                    CaseService.getCaseEscalation(caseJSON.account_number, caseJSON.case_number);
                    showRmeBox();
                }

                if ($scope.fromNewCase) {
                    AlertService.clearAlerts();
                    $scope.fromNewCase = false;
                    var noBusinessHours = gettextCatalog.getString('no business hours');
                    strataService.values.businesshours(securityService.loginStatus.authedUser.timezone).then(function (response) {
                        var availability = "";
                        availability = availability + gettextCatalog.getString('Sunday = {{businessHours}}', { businessHours: ((response.Days.Sunday[0] === "" && response.Days.Sunday[1] === "") ? noBusinessHours : response.Days.Sunday[0] + " - " + response.Days.Sunday[1] + " (" + response.OffsetName + ")") });
                        availability = availability + "<br/>";
                        availability = availability + gettextCatalog.getString('Monday = {{businessHours}}', { businessHours: ((response.Days.Monday[0] === "" && response.Days.Monday[1] === "") ? noBusinessHours : response.Days.Monday[0] + " - " + response.Days.Monday[1] + " (" + response.OffsetName + ")") });
                        availability = availability + "<br/>";
                        availability = availability + gettextCatalog.getString('Tuesday = {{businessHours}}', { businessHours: ((response.Days.Tuesday[0] === "" && response.Days.Tuesday[1] === "") ? noBusinessHours : response.Days.Tuesday[0] + " - " + response.Days.Tuesday[1] + " (" + response.OffsetName + ")") });
                        availability = availability + "<br/>";
                        availability = availability + gettextCatalog.getString('Wednesday = {{businessHours}}', { businessHours: ((response.Days.Wednesday[0] === "" && response.Days.Wednesday[1] === "") ? noBusinessHours : response.Days.Wednesday[0] + " - " + response.Days.Wednesday[1] + " (" + response.OffsetName + ")") });
                        availability = availability + "<br/>";
                        availability = availability + gettextCatalog.getString('Thursday = {{businessHours}}', { businessHours: ((response.Days.Thursday[0] === "" && response.Days.Thursday[1] === "") ? noBusinessHours : response.Days.Thursday[0] + " - " + response.Days.Thursday[1] + " (" + response.OffsetName + ")") });
                        availability = availability + "<br/>";
                        availability = availability + gettextCatalog.getString('Friday = {{businessHours}}', { businessHours: ((response.Days.Friday[0] === "" && response.Days.Friday[1] === "") ? noBusinessHours : response.Days.Friday[0] + " - " + response.Days.Friday[1] + " (" + response.OffsetName + ")") });
                        availability = availability + "<br/>";
                        availability = availability + gettextCatalog.getString('Saturday = {{businessHours}}', { businessHours: ((response.Days.Saturday[0] === "" && response.Days.Saturday[1] === "") ? noBusinessHours : response.Days.Saturday[0] + " - " + response.Days.Saturday[1] + " (" + response.OffsetName + ")") });
                        availability = availability + "<br/>";

                        var message = gettextCatalog.getString("Thank you for contacting Red Hat support!  We'll be in contact soon.  Our records indicate your availability as follows:") +
                            "<br/>" +
                            availability +
                            "<br/>" +
                            gettextCatalog.getString(`If we have not recorded your business hours correctly, please update your timezone in  <a href=\'${getRedhatDotComHost()}/wapps/ugc/protected/locale.html\' target=\'_blank\'>Your preferences</a>`);
                        var parsedHtml = $sce.trustAsHtml(message);
                        AlertService.addInfoMessage(parsedHtml);

                    }, function (error) {
                        AlertService.addStrataErrorMessage(error);
                    });

                }

            }, function (error) {
                CaseService.loadingCase = false;
                $scope.loading.kase = false;
                HeaderService.pageLoadFailure = true;
            });
            if (window.chrometwo_require !== undefined) {
                breadcrumbs = [
                    [gettextCatalog.getString('Support'), '/support/'],
                    [gettextCatalog.getString('Support Cases'), '/support/cases/'],
                    [$stateParams.id]
                ];
                updateBreadCrumb();
            }
        };

        $scope.updateCEP = function (isCep) {
            if (isCep) {
                CaseService.cepModalEvent = CASE_EVENTS.editPageCEP;
                CaseService.kase.cep = false;
                $uibModal.open({
                    template: require('../views/cepModal.jade'),
                    controller: 'CepModal'
                });
            } else {
                CaseService.confirmationModal = CASE_EVENTS.editPageCEP;
                CaseService.kase.cep = true;
                CaseService.confirmationModalHeader = gettextCatalog.getString('Update Consultant Engagement in Progress');
                CaseService.confirmationModalMessage = gettextCatalog.getString('Are you sure you want to remove the Consultant Engagement in Progress flag?');
                $uibModal.open({
                    template: require('../views/commonConfirmationModal.jade'),
                    controller: 'CommonConfirmationModal'
                });
            }
        };

        var updateOwnerTooltip = function () {
            if (RHAUtils.isNotEmpty(CaseService.hydraCaseDetail) && RHAUtils.isNotEmpty(CaseService.hydraCaseDetail.caseOwner)) {
                const owner = CaseService.hydraCaseDetail.caseOwner;
                $scope.ownerTooltip = $sce.trustAsHtml(
                    `<div style="text-align: left;">
                    <b>Name</b>: ${owner.name ? owner.name : ''}<br>
                    <b>Title</b>: ${owner.title ? owner.title : ''}<br>
                    <b>Email</b>: ${owner.email ? owner.email : ''}<br> 
                    <b>Phone</b>: ${owner.mobilePhone ? owner.mobilePhone : ''}<br>
                    <b>IRC</b>: ${owner.ircNick ? owner.ircNick : ''}<br>
                    <b>Timezone</b>: ${owner.timeZone ? owner.timeZone : ''}<br>
                    <b>Office Location</b>: ${owner.officeLocation ? owner.officeLocation : ''}
                    </div>`
                );
            } else {
                $scope.ownerTooltip = '';
            }
        }

        $scope.changeOwner = function () {
            $uibModal.open({
                template: require('../views/changeOwnerModal.jade'),
                controller: 'ChangeOwnerModal'
            });
        };

        $scope.firePageLoadEvent = function () {
            if (window.chrometwo_require !== undefined) {
                chrometwo_require(['analytics/attributes', 'analytics/main'], function (attrs, paf) {
                    attrs.harvest();
                    paf.report();
                });
            }
        };

        $scope.userHasManagedAccounts = () => (
            RHAUtils.isNotEmpty(securityService.loginStatus.authedUser.managedAccounts) &&
            RHAUtils.isNotEmpty(securityService.loginStatus.authedUser.managedAccounts.accounts)
        );

        $scope.isShowPartnerManagedCaseLabel = function () {
            if (CaseService.kase.contact_is_partner) {
                return securityService.loginStatus.authedUser.is_internal || !($scope.userHasManagedAccounts())
            }
            return false;
        };

        if (securityService.loginStatus.isLoggedIn) {
            $scope.firePageLoadEvent();
            $scope.init();
        }
        $scope.$on(AUTH_EVENTS.loginSuccess, function () {
            $scope.firePageLoadEvent();
            $scope.init();
        });

        var caseSettled = function () {
            $scope.$broadcast('rhaCaseSettled');
        };

        $scope.loadingWatcher = $scope.$watch('loading', function (loadingObj) {
            if ($.isEmptyObject(loadingObj)) {
                return;
            }
            var allLoaded = true;
            for (var key in loadingObj) {
                if (loadingObj[key] !== false) {
                    allLoaded = false;
                }
            }
            if (allLoaded && !HeaderService.pageLoadFailure) {
                caseSettled();
            }
        }, true);

        $scope.loadingRecWatcher = $scope.$watch('recommendationsLoading', function (newVal) {
            if (newVal === false) {
                caseSettled();
            }
        });

        $scope.$watch('CaseService.kase.product', function () {
            setOpenShiftProductFlag();
        });

        $scope.$watch('CaseService.caseRMEEscalation', function () {
            showRmeBox();
        });

        $scope.$watch('CaseService.hydraCaseDetail', function () {
            updateOwnerTooltip();
        });

        var showRmeBox = function () {
            if (!CaseService.caseRMEEscalation || securityService.loginStatus.authedUser.is_internal) {
                return;
            }
            if (CaseService.caseRMEEscalation.length === 0) {
                $scope.isShowRmeEscalationBox = false;
                $scope.isCreateRmeEscalationBox = true;
                return;
            }
            if (RHAUtils.isNotEmpty(_.find(CaseService.caseRMEEscalation, (es) => es && es.status !== 'Closed'))) {
                $scope.isShowRmeEscalationBox = true;
                $scope.isCreateRmeEscalationBox = false;
                return;
            }
            if (RHAUtils.isNotEmpty(_.find(CaseService.caseRMEEscalation, (es) => es && es.status === 'Closed'))) {
                $scope.isShowRmeEscalationBox = true;
                $scope.isCreateRmeEscalationBox = true;
                return;
            }
        }

        var setOpenShiftProductFlag = function () {
            if (RHAUtils.isNotEmpty(CaseService.kase) && RHAUtils.isNotEmpty(CaseService.kase.product) && CaseService.kase.product === 'Openshift Online') {
                CaseService.kase.isOpenShiftOnlineProduct = true;
            } else {
                CaseService.kase.isOpenShiftOnlineProduct = false;
            }
        };

        $scope.$on(CASE_EVENTS.received, function () {
            document.title = gettextCatalog.getString('{{caseNumber}} | {{caseSummary}}', { caseNumber: $stateParams.id, caseSummary: CaseService.kase.summary });
        })

        $scope.$on('$locationChangeSuccess', function () {
            var splitUrl = $location.path().split('/');
            if (splitUrl[2] !== undefined && $location.path().search(/case\/[0-9]{1,8}/i) !== -1) {
                var newCaseId = splitUrl[2];
                var oldCaseId = $scope.CaseService.kase.case_number;
                if (newCaseId !== oldCaseId) {
                    $stateParams.id = newCaseId;
                    CaseService.clearCase();
                    $scope.init();
                }
            }
        });
        $scope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
            if (from.url.indexOf('/case/new') === 0) {
                $scope.fromNewCase = true;
            }
        });
    }
}
