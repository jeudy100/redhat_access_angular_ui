'use strict';

import * as FileSaver from 'filesaver.js';
import { solrCaseFields } from '../constants/solrCaseFields';

export default class List {
    constructor($scope, $rootScope, $filter, $location, $state, $uibModal, securityService, AlertService, SearchCaseService, CaseService, strataService, AUTH_EVENTS, NEW_CASE_CONFIG, CASE_EVENTS, CASE_GROUPS, STATUS, gettextCatalog, RHAUtils, HeaderService) {
        'ngInject';

        $scope.busy = false;
        $scope.SearchCaseService = SearchCaseService;
        $scope.securityService = securityService;
        $scope.AlertService = AlertService;
        $scope.CaseService = CaseService;
        $scope.NEW_CASE_CONFIG = NEW_CASE_CONFIG;
        $scope.ie8 = window.ie8;
        $scope.ie9 = window.ie9;
        $scope.exporting = false;
        $scope.fetching = false;
        $scope.displayedCaseText = gettextCatalog.getString('Open Support Cases');
        $scope.RHAUtils = RHAUtils;

        $rootScope.$on('$locationChangeSuccess', function () {
            if ($location.path() === '/case/list') {
                CaseService.populateGroups(securityService.loginStatus.authedUser.sso_username, true);
            }
        });

        $scope.showCaseList = () => securityService.loginStatus.isLoggedIn && !HeaderService.pageLoadFailure && CaseService.sfdcIsHealthy && securityService.loginStatus.userAllowedToManageCases;

        $scope.exports = async function () {
            $scope.exporting = true;

            try {
                const accountNumber = SearchCaseService.searchParameters.accountNumber || securityService.loginStatus.authedUser.account_number;
                const query = `case_accountNumber:${accountNumber}`;
                const response = await strataService.cases.advancedSearch(query, null, 0, 1000, 'csv', solrCaseFields);

                const csvBlob = new Blob([response], {
                    type: 'text/csv'
                });
                FileSaver.saveAs(csvBlob, 'caseList.csv');
            } catch (error) {
                AlertService.addStrataErrorMessage(error);
            }

            $scope.exporting = false;
        };

        $scope.$on(CASE_EVENTS.searchSubmit, () => {
            SearchCaseService.currentPage = 1;
            $scope.doSearch();
        });

        $scope.doSearch = function () {
            SearchCaseService.clearPagination();
            if (SearchCaseService.searchParameters.caseGroup === CASE_GROUPS.manage) {

                SearchCaseService.searchParameters.caseGroup = SearchCaseService.previousGroupFilter;
                $state.go('group');
            } else {
                if (CaseService.groups.length === 0) {
                    CaseService.populateGroups(securityService.loginStatus.authedUser.sso_username).then(() => {
                        if (SearchCaseService.previousGroupFilter === CASE_GROUPS.none) {
                            SearchCaseService.searchParameters.caseGroup = CaseService.group;
                        } else {
                            SearchCaseService.searchParameters.caseGroup = SearchCaseService.previousGroupFilter;
                        }
                        $scope.busy = true;
                        return SearchCaseService.doFilter().then(() => {
                            $scope.busy = false;
                        });
                    });
                } else {
                    if (SearchCaseService.previousGroupFilter === CASE_GROUPS.none) {
                        SearchCaseService.searchParameters.caseGroup = CaseService.group;
                    }
                    $scope.busy = true;
                    return SearchCaseService.doFilter().then(() => {
                        $scope.busy = false;
                    });
                }
            }
        };

        $scope.firePageLoadEvent = function () {
            if (window.chrometwo_require !== undefined) {
                chrometwo_require(['analytics/attributes', 'analytics/main'], (attrs, paf) => {
                    attrs.harvest();
                    paf.report();
                });
            }
        };

        $scope.setBreadcrumbs = function () {
            if (window.chrometwo_require !== undefined) {
                breadcrumbs = [
                    [gettextCatalog.getString('Support'), '/support/'],
                    [gettextCatalog.getString('Support Cases'), '/support/cases/'],
                    [gettextCatalog.getString('List')]
                ];
                updateBreadCrumb();
                document.title = gettextCatalog.getString('Support Cases - Portal Case Management');
            }
        };

        /**
         * Callback after user login. Load the cases and clear alerts
         */
        if (securityService.loginStatus.isLoggedIn && securityService.loginStatus.userAllowedToManageCases) {
            $scope.firePageLoadEvent();
            //SearchCaseService.clear();
            if (CaseService.status === undefined) {
                CaseService.status = 'open';
            }
            if (RHAUtils.isEmpty(SearchCaseService.cases)) $scope.doSearch();
            $scope.setBreadcrumbs();
        }
        $scope.$on(AUTH_EVENTS.loginSuccess, function () {
            if (securityService.loginStatus.userAllowedToManageCases) {
                $scope.firePageLoadEvent();
                CaseService.status = 'open';

                if (CaseService.sessionStorageCache) {
                    if (CaseService.sessionStorageCache.get('listFilter' + securityService.loginStatus.authedUser.sso_username)) {
                        SearchCaseService.searchParameters = CaseService.sessionStorageCache.get('listFilter' + securityService.loginStatus.authedUser.sso_username);
                        SearchCaseService.previousGroupFilter = SearchCaseService.searchParameters.caseGroup;
                    }
                    if (CaseService.sessionStorageCache.get('filterSelect' + securityService.loginStatus.authedUser.sso_username)) {
                        var filterSelectCache = CaseService.sessionStorageCache.get('filterSelect' + securityService.loginStatus.authedUser.sso_username);
                        CaseService.setFilterSelectModel(filterSelectCache.sortField, filterSelectCache.sortOrder);
                    }
                }
                if (RHAUtils.isEmpty(SearchCaseService.cases)) $scope.doSearch();
                $scope.setBreadcrumbs();
            }
        });

        $scope.$on(AUTH_EVENTS.logoutSuccess, function () {
            CaseService.clearCase();
            SearchCaseService.clear();
        });

        $scope.caseLink = function (caseNumber) {
            $location.path('/case/' + caseNumber);
        };

        $scope.caseChosen = function () {
            var trues = $filter('filter')(SearchCaseService.cases, {
                selected: true
            });
            return trues.length;
        };

        $scope.closeCases = function () {
            CaseService.confirmationModal = CASE_EVENTS.caseClose;
            CaseService.confirmationModalHeader = gettextCatalog.getString('Closing Cases.');
            CaseService.confirmationModalMessage = gettextCatalog.getString('Are you sure you want to close the selected cases?');
            $uibModal.open({
                template: require('../views/commonConfirmationModal.jade'),
                controller: 'CommonConfirmationModal'
            });
        };

        $scope.getCasesText = function () {
            if (SearchCaseService.searchParameters.caseStatus === STATUS.open) {
                $scope.displayedCaseText = gettextCatalog.getString('Open Support Cases');
            } else if (SearchCaseService.searchParameters.caseStatus === STATUS.closed) {
                $scope.displayedCaseText = gettextCatalog.getString('Closed Support Cases');
            } else if (SearchCaseService.searchParameters.caseStatus === STATUS.both) {
                $scope.displayedCaseText = gettextCatalog.getString('Open and Closed Support Cases');
            }
        };

        $scope.loadingRecWatcher = $scope.$watch('SearchCaseService.searchParameters.caseStatus', function (newVal) {
            $scope.getCasesText();
        });
    }
}
