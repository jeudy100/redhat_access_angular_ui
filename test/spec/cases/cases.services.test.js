'use strict';

import hydrajs from '../../../app/shared/hydrajs';

describe('Case Services', function () {
    var caseService;
    var searchCaseService;
    var securityService;
    var searchBoxService;
    var recommendationsService;
    var caseListService;
    var attachmentsService;
    var groupService;
    var groupUserService;
    var scope;
    var rootScope;
    var q;
    var mockStrataService;
    var mockStrataDataService;
    var mockTreeViewSelectorUtils;
    var rhaUtils;
    var productsService;
    var discussionService;
    beforeEach(angular.mock.module('RedhatAccess.cases'));
    beforeEach(angular.mock.module('RedhatAccess.mock'));

    beforeEach(inject(function (_CaseService_, _SearchCaseService_, _MockStrataDataService_, _strataService_, _SearchBoxService_, _RecommendationsService_, _CaseListService_, _AttachmentsService_, _GroupService_,_GroupUserService_,_TreeViewSelectorUtils_, $injector, $q, $rootScope,_ProductsService_,_DiscussionService_){
        caseService = _CaseService_;
        searchCaseService = _SearchCaseService_;
        mockStrataDataService = _MockStrataDataService_;
        mockStrataService = _strataService_;
        searchBoxService = _SearchBoxService_;
        recommendationsService = _RecommendationsService_;
        attachmentsService = _AttachmentsService_;
        caseListService = _CaseListService_;
        groupService = _GroupService_;
        groupUserService = _GroupUserService_;
        mockTreeViewSelectorUtils = _TreeViewSelectorUtils_;
        productsService = _ProductsService_;
        discussionService=_DiscussionService_;
        scope = $rootScope.$new();
        rootScope = $rootScope;
        securityService = $injector.get('securityService');
        q = $q;
        rhaUtils=$injector.get('RHAUtils');
    }));
    //Suite for CaseService
    describe('CaseService', function () {
        it('should have a method for defining case object', function () {
            expect(caseService.defineCase).toBeDefined();
            var rawCase = {
                    severity: '1',
                    status: 'closed',
                    product: 'Red Hat Enterprise Linux',
                    folder_number: '1234',
                    type: 'bug'
                };
            caseService.defineCase(rawCase);
            expect(caseService.kase.product).toEqual('Red Hat Enterprise Linux');
            expect(caseService.kase.status.name).toEqual('closed');
            expect(caseService.kase.group.number).toEqual('1234');
        });
        it('should have a method to define account', function () {
            expect(caseService.defineAccount).toBeDefined();
            caseService.defineAccount(mockStrataDataService.mockAccount);
            expect(caseService.account).toEqual(mockStrataDataService.mockAccount);
        });
        it('should have a method for populating Case Groups resolved', function () {
            expect(caseService.populateGroups).toBeDefined();
            var ssoUsername = 'testUser';
            caseService.populateGroups(ssoUsername);
            spyOn(mockStrataService.groups, 'list').and.callThrough();
            scope.$root.$digest();
            expect(caseService.groups).toEqual(mockStrataDataService.mockGroups);
            expect(caseService.groupsLoading).toBe(false);
        });
        it('should have a method for populating Case Groups rejected', function () {
            expect(caseService.populateGroups).toBeDefined();
            var ssoUsername = 'testUser';
            mockStrataService.rejectCalls();
            spyOn(mockStrataService.groups, 'list').and.callThrough();
            caseService.populateGroups(ssoUsername, false);
            scope.$root.$digest();
            expect(mockStrataService.groups.list).toHaveBeenCalledWith('testUser', false);
            expect(caseService.groups).toEqual([]);
            expect(caseService.groupsLoading).toBe(false);
        });
        it('should have a method for populating Case Groups with undefined username', function () {
            expect(caseService.populateGroups).toBeDefined();
            var ssoUsername = undefined;
            caseService.populateGroups(ssoUsername);
            spyOn(mockStrataService.groups, 'list').and.callThrough();
            scope.$root.$digest();
            expect(caseService.groups).toEqual([]);
            // expect(caseService.groupsLoading).toBe(false);
        });
        it('should have a method for populating Users For An Account resolved', function () {
            expect(caseService.populateUsers).toBeDefined();
            securityService.loginStatus.authedUser.org_admin = true;
            caseService.account.number = '540155';
            caseService.populateUsers();
            spyOn(mockStrataService.accounts, 'users').and.callThrough();
            scope.$root.$digest();
            expect(caseService.users).toEqual(mockStrataDataService.mockUsers);
            expect(caseService.usersLoading).toBe(false);
        });
        it('should have a method for populating Users For An Account non org admin', function () {
            expect(caseService.populateUsers).toBeDefined();
            securityService.loginStatus.authedUser.org_admin = false;
            securityService.loginStatus.authedUser.first_name = 'First';
            securityService.loginStatus.authedUser.last_name = 'Last';
            securityService.loginStatus.authedUser.sso_username = 'SSO';
            caseService.account.number = '540155';
            caseService.populateUsers();
            expect(caseService.users).toEqual([{'sso_username' : 'SSO', 'first_name': 'First', 'last_name': 'Last'}]);
            expect(caseService.usersLoading).toBe(false);
        });
        it('should have a method for populating Users For An Account rejected', function () {
            expect(caseService.populateUsers).toBeDefined();
            securityService.loginStatus.authedUser.org_admin = true;
            caseService.account.number = '540155';
            mockStrataService.rejectCalls();
            spyOn(mockStrataService.accounts, 'users').and.callThrough();
            caseService.populateUsers();
            scope.$root.$digest();
            expect(mockStrataService.accounts.users).toHaveBeenCalledWith('540155');
            expect(caseService.users).toEqual([]);
            expect(caseService.usersLoading).toBe(false);
        });
        xit('should have a method for populating Case Comments resolved', function () {
            expect(caseService.populateComments).toBeDefined();
            var caseNumber = '12345';
            caseService.populateComments(caseNumber);
            spyOn(mockStrataService.cases.comments, 'get').and.callThrough();
            scope.$root.$digest();
            expect(caseService.comments).toEqual(mockStrataDataService.mockComments);
        });
        it('should have a method for populating Case Comments rejected', function () {
            expect(caseService.populateComments).toBeDefined();
            var caseNumber = '12345';
            mockStrataService.rejectCalls();
            spyOn(mockStrataService.cases.comments, 'get').and.callThrough();
            caseService.populateComments(caseNumber);
            scope.$root.$digest();
            expect(mockStrataService.cases.comments.get).toHaveBeenCalledWith('12345');
            expect(caseService.comments).toEqual([]);
        });
        it('should have a method for populating User Entitlements rejected', function () {
            expect(caseService.populateEntitlements).toBeDefined();
            var ssoUsername = 'testUser';
            mockStrataService.rejectCalls();
            spyOn(mockStrataService.entitlements, 'get').and.callThrough();
            caseService.populateEntitlements(ssoUsername);
            scope.$root.$digest();
            expect(mockStrataService.entitlements.get).toHaveBeenCalledWith(false, 'testUser');
            expect(caseService.entitlements).toBeUndefined();
        });
        xit('should have a method for validating New Case Page', function () {
            expect(caseService.validateNewCase).toBeDefined();
            expect(caseService.newCaseIncomplete).toBe(true);
            caseService.kase.product = '';
            caseService.kase.version = '';
            caseService.kase.summary = '';
            caseService.kase.description = '';
            caseService.kase.type = 'Feature / Enhancement';
            caseService.showKTFields = false;
            caseService.validateNewCase();
            expect(caseService.newCaseIncomplete).toBe(true);
            caseService.kase.product = 'Red Hat Enterprise Linux';
            caseService.kase.version = '6.0';
            caseService.kase.summary = 'Test Summary';
            caseService.kase.description = 'Test Description';
            caseService.validateNewCase();
            expect(caseService.newCaseIncomplete).toBe(false);
        });
        xit('should have a method to Show/Hide the FTS flag', function () {
            expect(caseService.showFtsOnEditPage).toBeDefined();
            var fts = false;
            caseService.severities = [
                { 'name': '1 (Urgent)' },
                { 'name': '2 (High)' },
                { 'name': '3 (Normal)' },
                { 'name': '4 (Low)' }
            ];
            // Show the FTS flag for sev 1 or sev 2 cases
            caseService.kase.severity = { 'name': '1 (Urgent)' };
            fts = caseService.showFtsOnEditPage();
            expect(fts).toBe(true);
            caseService.onChangeFTSCheck();
            expect(caseService.fts).toBe(true);
            expect(caseService.kase.fts).toBe(true);
            // Hide the FTS flag for non sev1 & sev2 cases
            caseService.kase.severity = { 'name': '3 (Normal)' };
            fts = caseService.showFtsOnEditPage();
            expect(fts).toBe(false);
        });
        it('should have a method for defining Notified Users for a case', function () {
            expect(caseService.defineNotifiedUsers).toBeDefined();
            caseService.kase.contact_sso_username = 'testUser';
            caseService.kase.notified_users = {
                'link': [
                    {
                        'title': 'Denises Hughes',
                        'type': 'application/vnd.redhat.user',
                        'sso_username': 'dhughesgit'
                    },
                    {
                        'title': 'Customer Portal-Qa',
                        'type': 'application/vnd.redhat.user',
                        'sso_username': 'customerportalQA'
                    }
                ]
            };
            caseService.defineNotifiedUsers();
            expect(caseService.originalNotifiedUsers).toContain('dhughesgit', 'customerportalQA');
        });

        it('should have a method for clear case', function () {
            expect(caseService.clearCase).toBeDefined();
            caseService.clearCase();
            expect(caseService.caseDataReady).toBeFalsy();
            expect(caseService.isCommentPublic).toBeTruthy();
            expect(caseService.updatingCase).toBeFalsy();
            expect(caseService.updatingNewCaseSummary).toBeFalsy();
            expect(caseService.updatingNewCaseDescription).toBeFalsy();
            expect(caseService.draftComment).toBeUndefined();
            expect(caseService.draftCommentLocalStorage).toBeUndefined();
        });

        // commenting this as this is no longer a valid scenario : PCM-6265
        // it('should have a method for toggling of case status On attachment and comment', function () {
        //     expect(caseService.checkForCaseStatusToggleOnAttachOrComment).toBeDefined();
        //     securityService.loginStatus.authedUser.is_internal=true;
        //     //cannot use mockStrataCase as it has a different status field.
        //     caseService.kase={};
        //     caseService.kase.status={};
        //     caseService.kase.status.name = 'Waiting on Red Hat' ;
        //     caseService.checkForCaseStatusToggleOnAttachOrComment();
        //     var status=   { name: 'Waiting on Customer' };
        //     expect(caseService.kase.status).toEqual(status);
        // });

        it('should have a method for toggling of case status On attachment and comment with previous status as closed', function () {
            expect(caseService.checkForCaseStatusToggleOnAttachOrComment).toBeDefined();
            securityService.loginStatus.authedUser.is_internal=false;
            //cannot use mockStrataCase as it has a different status field.
            caseService.kase={};
            caseService.kase.status={};
            caseService.kase.status.name = 'Closed' ;
            caseService.checkForCaseStatusToggleOnAttachOrComment();
            var status=   { name: 'Waiting on Red Hat' };
            expect(caseService.kase.status).toEqual(status);
        });
        it('should have a method for toggling of case status On attachment and comment with previous status as Waiting on Customer', function () {
            expect(caseService.checkForCaseStatusToggleOnAttachOrComment).toBeDefined();
            securityService.loginStatus.authedUser.is_internal=false;
            //cannot use mockStrataCase as it has a different status field.
            caseService.kase={};
            caseService.kase.status={};
            caseService.kase.status.name = 'Waiting on Customer' ;
            caseService.checkForCaseStatusToggleOnAttachOrComment();
            var status=   { name: 'Waiting on Red Hat' };
            expect(caseService.kase.status).toEqual(status);
        });
        it('should have a method for create case', function () {
            expect(caseService.createCase).toBeDefined();
            caseService.kase=mockStrataDataService.mockCases[0];
            //adding other parameters for branch coverage
            caseService.group = mockStrataDataService.mockGroups[0];
            caseService.entitlement = mockStrataDataService.mockEntitlements;
            caseService.fts = true;
            caseService.owner = 'New Case Queue';
            caseService.kase.severity={name:"Low"};
            securityService.loginStatus.authedUser.sso_username="test";
            caseService.createCase();
            spyOn(mockStrataService.cases, 'post').and.callThrough();
            scope.$root.$digest();
            expect(caseService.localStorageCache.get(securityService.loginStatus.authedUser.sso_username)).toBeUndefined();
        });

        it('should have a method for update case', function () {
            expect(caseService.updateCase).toBeDefined();
            caseService.kase=
            {
                "created_by": "Sunil Keshari",
                "created_date": 1405416971000,
                "last_modified_by": "Sunil Keshari",
                "last_modified_date": 1405416972000,
                "id": "500K0000006FeAaIAK",
                "uri": "https://api.access.devgssci.devlab.phx1.redhat.com/rs/cases/01364190",
                "summary": "test case notified users",
                "description": "test",
                "status": "Waiting on Red Hat",
                "product": {
                    "name": "Red Hat Enterprise Linux",
                    "value": "RHEL"
                },
                "version": "7.0",
                "account_number": "940527",
                "escalated": false,
                "contact_name": "Sunil Keshari",
                "contact_sso_username": "skesharigit",
                "origin": "Web",
                "owner": "New Case Queue",
                "severity": "4 (Low)",
                "comments": {},
                "notified_users": {},
                "entitlement": {
                    "sla": "UNKNOWN"
                },
                "fts": false,
                "bugzillas": {},
                "sbr_groups": {},
                "case_number": "01364190",
                "closed": false,
                "type": "bug",
                "alternate_id":"123456",
                "group":{
                    "number": "80437",
                    "name": "sfWdBWa6La",
                    "is_private": false,
                    "is_default": false,
                    "selected": true
                }
            };
            securityService.loginStatus.authedUser.sso_username="test";
            caseService.updateCase().then(() => {
                expect(caseService.updatingCase).toBeFalsy();
                expect(caseService.prestineKase, caseService.kase);
            });
        });

        it('should have a method for update case with fts true', function () {
            expect(caseService.updateCase).toBeDefined();
            caseService.kase=
            {
                "created_by": "Sunil Keshari",
                "created_date": 1405416971000,
                "last_modified_by": "Sunil Keshari",
                "last_modified_date": 1405416972000,
                "id": "500K0000006FeAaIAK",
                "uri": "https://api.access.devgssci.devlab.phx1.redhat.com/rs/cases/01364190",
                "summary": "test case notified users",
                "description": "test",
                "status": "Waiting on Red Hat",
                "product": {
                    "name": "Red Hat Enterprise Linux",
                    "value": "RHEL"
                },
                "version": "7.0",
                "account_number": "940527",
                "escalated": false,
                "contact_name": "Sunil Keshari",
                "contact_sso_username": "skesharigit",
                "origin": "Web",
                "owner": "New Case Queue",
                "severity": "4 (Low)",
                "comments": {},
                "notified_users": {},
                "entitlement": {
                    "sla": "UNKNOWN"
                },
                "fts": true,
                "contact_info24_x7":"New user",
                "bugzillas": {},
                "sbr_groups": {},
                "case_number": "01364190",
                "closed": false,
                "type": "bug",
                "alternate_id":"123456"
            };
            securityService.loginStatus.authedUser.sso_username="test";
            caseService.updateCase().then(() => {
                expect(caseService.updatingCase).toBeFalsy();
                expect(caseService.prestineKase, caseService.kase);
            });
        });

        it('should have a method for update local storage for new case', function () {
            expect(caseService.updateLocalStorageForNewCase).toBeDefined();
            caseService.kase.description="test";
            caseService.kase.summary="test summary";
            caseService.kase.product="Red Hat Enterprise Linux";
            caseService.kase.version="7.0";
            securityService.loginStatus.authedUser.sso_username="test";
            caseService.updateLocalStorageForNewCase();
            expect(caseService.localStorageCache).toBeDefined();

        });

        it('should have a method for onOwnerSelectChanged and it should broadcast \"owner-change\" message', function () {
            expect(caseService.onOwnerSelectChanged).toBeDefined();
            spyOn(rootScope, '$broadcast');
            caseService.onOwnerSelectChanged();
            expect(rootScope.$broadcast).toHaveBeenCalled();
            expect(rootScope.$broadcast).toHaveBeenCalledWith('owner-change');
        });

        it('should have a method for onOwnerSelectChanged and it should trigger listener for \"owner-change\" message', inject(function ($controller) {
            expect(caseService.onOwnerSelectChanged).toBeDefined();
            spyOn(rootScope, '$broadcast');
            spyOn(rootScope, '$on');
            $controller('New', { $scope: scope });
            caseService.onOwnerSelectChanged();
            expect(rootScope.$on).toHaveBeenCalled();
            expect(rootScope.$on).toHaveBeenCalledWith('owner-change',jasmine.any(Function));
        }));

        it('should have a method for onFilterSelectChanged and it should broadcast \"search-submit\" message', function () {
            expect(caseService.onFilterSelectChanged).toBeDefined();
            spyOn(rootScope, '$broadcast');
            caseService.onFilterSelectChanged();
            expect(rootScope.$broadcast).toHaveBeenCalled();
            expect(rootScope.$broadcast).toHaveBeenCalledWith('search-submit');
        });

        it('should have a method for onOwnerSelectChanged and it should trigger listener for \"search-submit\" message', inject(function ($controller) {
            expect(caseService.onFilterSelectChanged).toBeDefined();
            spyOn(rootScope, '$broadcast');
            spyOn(rootScope, '$on');
            $controller('List', { $scope: scope });
            caseService.onFilterSelectChanged();
            expect(rootScope.$on).toHaveBeenCalled();
            expect(rootScope.$on).toHaveBeenCalledWith('search-submit',jasmine.any(Function));
        }));

        it('should have a method for onSelectChanged and it should broadcast \"search-submit\" message', function () {
            expect(caseService.onSelectChanged).toBeDefined();
            spyOn(rootScope, '$broadcast');
            caseService.onSelectChanged();
            expect(rootScope.$broadcast).toHaveBeenCalled();
            expect(rootScope.$broadcast).toHaveBeenCalledWith('search-submit');
        });

        it('should have a method for onSelectChanged and it should trigger listener for \"search-submit\" message', inject(function ($controller) {
            expect(caseService.onSelectChanged).toBeDefined();
            spyOn(rootScope, '$broadcast');
            spyOn(rootScope, '$on');
            $controller('List', { $scope: scope });
            caseService.onSelectChanged();
            expect(rootScope.$on).toHaveBeenCalled();
            expect(rootScope.$on).toHaveBeenCalledWith('search-submit',jasmine.any(Function));
        }));

        it('should have a method for onGroupSelectChanged and it should broadcast \"search-submit\" message', function () {
            expect(caseService.onSelectChanged).toBeDefined();
            spyOn(rootScope, '$broadcast');
            caseService.onSelectChanged();
            expect(rootScope.$broadcast).toHaveBeenCalled();
            expect(rootScope.$broadcast).toHaveBeenCalledWith('search-submit');
        });

        it('should have a method for onGroupSelectChanged and it should trigger listener for \"search-submit\" message', inject(function ($controller) {
            expect(caseService.onGroupSelectChanged).toBeDefined();
            spyOn(rootScope, '$broadcast');
            spyOn(rootScope, '$on');
            $controller('List', { $scope: scope });
            caseService.onGroupSelectChanged();
            expect(rootScope.$on).toHaveBeenCalled();
            expect(rootScope.$on).toHaveBeenCalledWith('search-submit',jasmine.any(Function));
        }));

        it('should have a method for set case and it should set to given value', function () {
            expect(caseService.setCase).toBeDefined();
            var jsonCase=
            {
                "created_by": "Sunil Keshari",
                "created_date": 1405416971000,
                "last_modified_by": "Sunil Keshari",
                "last_modified_date": 1405416972000,
                "id": "500K0000006FeAaIAK",
                "uri": "https://api.access.devgssci.devlab.phx1.redhat.com/rs/cases/01364190",
                "summary": "test case notified users",
                "description": "test",
                "status": "Waiting on Red Hat",
                "product": {
                    "name": "Red Hat Enterprise Linux",
                    "value": "RHEL"
                },
                "version": "7.0",
                "account_number": "940527",
                "escalated": false,
                "contact_name": "Sunil Keshari",
                "contact_sso_username": "skesharigit",
                "origin": "Web",
                "owner": "New Case Queue",
                "severity": "4 (Low)",
                "comments": {},
                "notified_users": {},
                "entitlement": {
                    "sla": "UNKNOWN"
                },
                "fts": false,
                "bugzillas": {},
                "sbr_groups": {},
                "case_number": "01364190",
                "closed": false,
                "group": {"number":"685","name":"RBS"}
            };
            caseService.setCase(jsonCase);
            expect(caseService.kase.id).toEqual('500K0000006FeAaIAK');
            expect(caseService.prestineKase, caseService.kase);
            expect(caseService.caseDataReady).not.toBeFalsy();

        });

        it('should have a method for reset case', function () {
            expect(caseService.resetCase).toBeDefined();
            caseService.setCase(mockStrataDataService.mockCases[1]);
            expect(caseService.prestineKase).toEqual(caseService.kase);
            //change kase object so that it is not equal to prestineKase
            caseService.kase = mockStrataDataService.mockCases[2];
            expect(caseService.prestineKase).not.toEqual(caseService.kase);
            caseService.resetCase();
            expect(caseService.prestineKase, caseService.kase);
            expect(caseService.prestineKase).toEqual(caseService.kase);
        });

        it('should have a method for get groups case and it should return groups', function () {
            expect(caseService.getGroups).toBeDefined();
            caseService.groups = mockStrataDataService.mockGroups;
            var returnValue = caseService.getGroups();
            expect(returnValue).toEqual(mockStrataDataService.mockGroups);
        });

        it('should have a method for clearing product and version from local storage', function () {
            expect(caseService.clearProdVersionFromLS).toBeDefined();
            caseService.kase=mockStrataDataService.mockCases[0];
            securityService.loginStatus.authedUser.sso_username="test";
            caseService.clearProdVersionFromLS();
            expect(caseService.kase.product).toBeUndefined;
            expect(caseService.kase.version).toBeUndefined;
        });
    });
    //Suite for SearchCaseService
    describe('searchCaseService', function () {
        it('should have a method for Search cases resolved for loggedin user', function () {
            expect(searchCaseService.doFilter).toBeDefined();
            searchCaseService.oldParams = {};
            securityService.loginStatus.login = 'testUser';
            securityService.loginStatus.isLoggedIn = true;
            searchBoxService.searchTerm = 'test';
            caseService.status = 'closed';
            caseService.product = 'Red Hat Enterprise Linux';
            caseService.owner = 'testUser';
            caseService.type = 'bug';
            caseService.severity = '1';
            searchCaseService.doFilter();
            spyOn(mockStrataService.cases, 'search').and.callThrough();
            scope.$root.$digest();
            expect(searchCaseService.searching).toBe(false);
            expect(searchCaseService.cases).toEqual(mockStrataDataService.mockFilterCaseResult);
        });

        it('should have a method for Search cases resolved for loggedin user with status as closed and empty search term', function () {
            expect(searchCaseService.doFilter).toBeDefined();
            searchCaseService.oldParams = {};
            securityService.loginStatus.login = 'testUser';
            securityService.loginStatus.isLoggedIn = true;
            searchBoxService.searchTerm = '';
            caseService.group = mockStrataDataService.mockGroups[0];
            caseService.status = 'closed';
            caseService.filterSelect = {"sortField":"owner",
                "sortOrder":"ASC"};
            caseService.product = 'Red Hat Enterprise Linux';
            caseService.owner = 'testUser';
            caseService.type = 'bug';
            caseService.severity = '1';
            searchCaseService.doFilter();
            spyOn(mockStrataService.cases, 'search').and.callThrough();
            scope.$root.$digest();
            expect(searchCaseService.searching).toBe(false);
            expect(searchCaseService.cases).toEqual(mockStrataDataService.mockFilterCaseResult);
        });

        it('should have a method for Search cases resolved for loggedin user with status as both and empty search term', function () {
            expect(searchCaseService.doFilter).toBeDefined();
            searchCaseService.oldParams = {};
            securityService.loginStatus.login = 'testUser';
            securityService.loginStatus.isLoggedIn = true;
            searchBoxService.searchTerm = '';
            caseService.filterSelect = {"sortField":"owner",
                "sortOrder":"DESC"};
            caseService.status = 'both';
            caseService.product = 'Red Hat Enterprise Linux';
            caseService.owner = 'testUser';
            caseService.type = 'bug';
            caseService.severity = '1';
            searchCaseService.doFilter();
            spyOn(mockStrataService.cases, 'search').and.callThrough();
            scope.$root.$digest();
            expect(searchCaseService.searching).toBe(false);
            expect(searchCaseService.cases).toEqual(mockStrataDataService.mockFilterCaseResult);
        });
        it('should have a method for Search cases resolved for loggedin user with status as empty and empty search term', function () {
            expect(searchCaseService.doFilter).toBeDefined();
            searchCaseService.oldParams = {};
            securityService.loginStatus.login = 'testUser';
            securityService.loginStatus.isLoggedIn = true;
            searchBoxService.searchTerm = '';
            caseService.filterSelect = {"sortField":"severity",
                "sortOrder":"ASC"};
            caseService.product = 'Red Hat Enterprise Linux';
            caseService.owner = 'testUser';
            caseService.type = 'bug';
            caseService.severity = '1';
            searchCaseService.doFilter();
            spyOn(mockStrataService.cases, 'search').and.callThrough();
            scope.$root.$digest();
            expect(searchCaseService.searching).toBe(false);
            expect(searchCaseService.cases).toEqual(mockStrataDataService.mockFilterCaseResult);
        });
        it('should have a method for Search cases resolved for loggedin user with empty status,search term and sortField', function () {
            expect(searchCaseService.doFilter).toBeDefined();
            searchCaseService.oldParams = {};
            securityService.loginStatus.login = 'testUser';
            securityService.loginStatus.isLoggedIn = true;
            searchBoxService.searchTerm = '';
            caseService.filterSelect = {"sortField":"",
                "sortOrder":"ASC"};
            caseService.product = 'Red Hat Enterprise Linux';
            caseService.owner = 'testUser';
            caseService.type = 'bug';
            caseService.severity = '1';
            searchCaseService.doFilter();
            spyOn(mockStrataService.cases, 'search').and.callThrough();
            scope.$root.$digest();
            expect(searchCaseService.searching).toBe(false);
            expect(searchCaseService.cases).toEqual(mockStrataDataService.mockFilterCaseResult);
        });

        it('should have a method for Filter cases resolved for loggedin user', function () {
            expect(searchCaseService.doFilter).toBeDefined();
            searchCaseService.oldParams = {};
            securityService.loginStatus.login = 'testUser';
            securityService.loginStatus.isLoggedIn = true;
            searchBoxService.searchTerm = '';
            caseService.filterSelect = {"sortField":"severity",
                "sortOrder":"DESC"};
            caseService.status = 'open';
            caseService.product = 'Red Hat Enterprise Linux';
            caseService.owner = 'testUser';
            caseService.type = 'bug';
            caseService.severity = '1';
            caseService.group='ungrouped';
            searchCaseService.refreshFilterCache=true;
            searchCaseService.doFilter();
            spyOn(mockStrataService.cases, 'filter').and.callThrough();
            scope.$root.$digest();
            spyOn(mockStrataService.cache, 'clr').and.callThrough();
            scope.$root.$digest();
            expect(searchCaseService.searching).toBe(false);
            expect(searchCaseService.cases).toEqual(mockStrataDataService.mockFilterCaseResult);
        });

        it('should have a method to clear the search criteria and result', function () {
            expect(searchCaseService.clear).toBeDefined();
            searchCaseService.oldParams = {};
            searchBoxService.searchTerm = 'test';
            searchCaseService.clear();
            expect(searchBoxService.searchTerm).toEqual('');
            expect(searchCaseService.cases).toEqual([]);
        });
        it('should have a method to clear the pagination of the search result', function () {
            expect(searchCaseService.clearPagination).toBeDefined();
            searchCaseService.cases = mockStrataDataService.mockCases;
            searchCaseService.clearPagination();
            expect(searchCaseService.cases).toEqual([]);
        });
    });

    describe('searchBoxService', function () {
        it('should have a method onChange() to enable search button', function () {
            expect(searchBoxService.onChange).toBeDefined();
            searchBoxService.searchTerm = 'test';
            searchBoxService.onChange();
            expect(searchBoxService.disableSearchButton).toBe(false);
        });
        it('should have a method onChange() to disable search button', function () {
            expect(searchBoxService.onChange).toBeDefined();
            searchBoxService.searchTerm = '';
            searchBoxService.onChange();
            expect(searchBoxService.disableSearchButton).toBe(true);
        });
    });

    //Suite for RecommendationsService
    describe('RecommendationsService', function () {
        it('should have a method to populate pinned recommendations but not linked', function () {
            expect(recommendationsService.populatePinnedRecommendations).toBeDefined();
            caseService.kase.recommendations = {
                'recommendation': [{
                        'linked': false,
                        'pinned_at': true,
                        'last_suggested_date': 1398756627000,
                        'lucene_score': 141,
                        'resource_id': '27450',
                        'resource_type': 'Solution',
                        'resource_uri': 'https://api.access.devgssci.devlab.phx1.redhat.com/rs/solutions/27450',
                        'solution_title': ' test solution title 1 ',
                        'solution_abstract': 'test solution abstract 1',
                        'solution_url': 'https://api.access.devgssci.devlab.phx1.redhat.com/rs/solutions/27450',
                        'title': 'test title 1',
                        'solution_case_count': 3
                    }]
                };
            recommendationsService.populatePinnedRecommendations();
            scope.$root.$digest();
            expect(recommendationsService.pinnedRecommendations).toContain(mockStrataDataService.mockRecommendations[0]);
        });
        it('should have a method to populate non pinned recommendations but linked', function () {
            expect(recommendationsService.populatePinnedRecommendations).toBeDefined();
            caseService.kase.recommendations = {
                'recommendation': [{
                        'linked': true,
                        'pinned_at': false,
                        'last_suggested_date': 1398756612000,
                        'lucene_score': 155,
                        'resource_id': '637583',
                        'resource_type': 'Solution',
                        'resource_uri': 'https://api.access.devgssci.devlab.phx1.redhat.com/rs/solutions/637583',
                        'solution_title': 'test solution title 2',
                        'solution_abstract': 'test solution abstract 2',
                        'solution_url': 'https://api.access.devgssci.devlab.phx1.redhat.com/rs/solutions/637583',
                        'title': 'test title 2',
                        'solution_case_count': 14
                    }]
                };
            recommendationsService.populatePinnedRecommendations();
            scope.$root.$digest();
            expect(recommendationsService.handPickedRecommendations).toContain(mockStrataDataService.mockSolutionLinked);
        });

        it('should have a method to get recommendations', function () {
            expect(recommendationsService.getRecommendations).toBeDefined();
            caseService.kase=mockStrataDataService.mockCases[1];
            recommendationsService.getRecommendations(true,undefined);
            recommendationsService.loadingRecommendations = false;
            mockStrataService.recommendationsForCase();
            scope.$root.$digest();
            expect(recommendationsService.loadingRecommendations).toBeFalsy();
        });
        it('should have a method to get recommendations with product as undefined', function () {
            expect(recommendationsService.getRecommendations).toBeDefined();
            caseService.kase=mockStrataDataService.mockCases[1];
            caseService.kase.product = undefined;
            recommendationsService.getRecommendations(true,undefined);
            recommendationsService.loadingRecommendations = false;
            mockStrataService.recommendationsForCase();
            scope.$root.$digest();
            expect(recommendationsService.loadingRecommendations).toBeFalsy();
        });
        it('should have a method to get recommendations with product,version as undefined', function () {
            expect(recommendationsService.getRecommendations).toBeDefined();
            caseService.kase=mockStrataDataService.mockCases[1];
            caseService.kase.product = undefined;
            caseService.kase.version = undefined;
            recommendationsService.getRecommendations(true,undefined);
            recommendationsService.loadingRecommendations = false;
            mockStrataService.recommendationsForCase();
            scope.$root.$digest();
            expect(recommendationsService.loadingRecommendations).toBeFalsy();
        });
        it('should have a method to get recommendations with product,version,summary as undefined', function () {
            expect(recommendationsService.getRecommendations).toBeDefined();
            caseService.kase=mockStrataDataService.mockCases[1];
            caseService.kase.product = undefined;
            caseService.kase.version = undefined;
            caseService.kase.summary = undefined;
            caseService.kase.description = undefined;
            recommendationsService.loadingRecommendations = false;
            recommendationsService.getRecommendations(true,undefined);
            mockStrataService.recommendationsForCase();
            scope.$root.$digest();
            expect(recommendationsService.loadingRecommendations).toBeFalsy();
        });

    });
    //Suite for CaseListService
    describe('CaseListService', function () {
        it('should have a method to define cases for case list', function () {
            expect(caseListService.defineCases).toBeDefined();
            caseListService.defineCases(mockStrataDataService.mockCases);
            expect(caseListService.cases).toEqual(mockStrataDataService.mockCases);
        });
    });
    //Suite for AttachmentsService
    describe('AttachmentsService', function () {
        // Need to add AttachmentsService.updateAttachments back based on PCM-7308
        // so these tests will be needed again.
        // it('should have a method to delete Attachment resolved', function () {
        //     expect(attachmentsService.removeOriginalAttachment).toBeDefined();
        //     attachmentsService.originalAttachments = [
        //         {
        //             'file_name': 'abc.txt',
        //             'uuid': '1234'
        //         },
        //         {
        //             'file_name': 'xyz.txt',
        //             'uuid': '4567'
        //         }
        //     ];
        //     expect(attachmentsService.originalAttachments.length).toBe(2);
        //     caseService.kase.case_number = '12345';
        //     attachmentsService.removeOriginalAttachment(mockStrataDataService.mockAttachment);
        //     spyOn(mockStrataService.cases.attachments, 'remove').and.callThrough();
        //     scope.$root.$digest();
        //     expect(attachmentsService.originalAttachments.length).toBe(1);
        // });
        // it('should have a method to delete Attachment rejected', function () {
        //     expect(attachmentsService.removeOriginalAttachment).toBeDefined();
        //     attachmentsService.originalAttachments = [
        //         {
        //             'file_name': 'abc.txt',
        //             'uuid': '1234'
        //         },
        //         {
        //             'file_name': 'xyz.txt',
        //             'uuid': '4567'
        //         }
        //     ];
        //     expect(attachmentsService.originalAttachments.length).toBe(2);
        //     caseService.kase.case_number = '12345';
        //     mockStrataService.rejectCalls();
        //     spyOn(mockStrataService.cases.attachments, 'remove').and.callThrough();
        //     attachmentsService.removeOriginalAttachment(mockStrataDataService.mockAttachment);
        //     scope.$root.$digest();
        //     expect(attachmentsService.originalAttachments.length).toBe(2);
        // });
        it('should have a method to add new Attachment', function () {
            expect(attachmentsService.addNewAttachment).toBeDefined();
            var attachment = {
                    file_name: 'test.txt',
                    uuid: '1234'
                };
            expect(attachmentsService.updatedAttachments.length).toBe(0);
            attachmentsService.addNewAttachment(attachment);
            expect(attachmentsService.updatedAttachments.length).toBe(1);
        });
        it('should have a method to remove Attachment from list', function () {
            expect(attachmentsService.removeUpdatedAttachment).toBeDefined();
            attachmentsService.updatedAttachments = [
                {
                    'file_name': 'abc.txt',
                    'uuid': '1234'
                },
                {
                    'file_name': 'xyz.txt',
                    'uuid': '4567'
                }
            ];
            expect(attachmentsService.updatedAttachments.length).toBe(2);
            attachmentsService.removeUpdatedAttachment(1);
            expect(attachmentsService.updatedAttachments.length).toBe(1);
        });

        // Need to add AttachmentsService.updateAttachments back based on PCM-7308
        // so these tests will be needed again.
        // it('should have a method to update Attachments resolved', function () {
        //     expect(attachmentsService.updateAttachments).toBeDefined();
        //     attachmentsService.originalAttachments = [
        //         {
        //             'file_name': 'abc.txt',
        //             'uuid': '1234'
        //         },
        //         {
        //             'file_name': 'xyz.txt',
        //             'uuid': '4567'
        //         }
        //     ];
        //     attachmentsService.updatedAttachments = [
        //         {
        //             'file_name': 'abc.txt',
        //             'uuid': '1234'
        //         },
        //         {
        //             'file_name': 'xyz.txt',
        //             'uuid': '4567'
        //         },
        //         {
        //             'file_name': 'pqr.txt',
        //             'uuid': '5678'
        //         }
        //     ];
        //     rhaUtils.userTimeZone="Asia/Calcutta";
        //     attachmentsService.updateAttachments('12345');
        //     spyOn(mockStrataService.cases.attachments, 'post').and.callThrough();
        //     scope.$root.$digest();
        //     expect(attachmentsService.updatedAttachments.length).toBe(0);
        // });
        // it('should have a method to update Attachments rejected', function () {
        //     expect(attachmentsService.updateAttachments).toBeDefined();
        //     attachmentsService.updatedAttachments = [mockStrataDataService.mockAttachments[0]];
        //     var formdata = new FormData();
        //                     formdata.append('file', undefined);
        //                     formdata.append('description', 'sample1 attachment');
        //     mockStrataService.rejectCalls();
        //     spyOn(mockStrataService.cases.attachments, 'post').and.callThrough();
        //     attachmentsService.updateAttachments('12345');
        //     scope.$root.$digest();
        //     expect(mockStrataService.cases.attachments.post).toHaveBeenCalledWith(formdata, '12345', jasmine.any(Function));
        //     expect(attachmentsService.originalAttachments.length).toBe(0);
        // });
        it('should have a method to define Original Attachments', function () {
            expect(attachmentsService.defineOriginalAttachments).toBeDefined();
            var attachments = [
                    {
                        'file_name': 'abc.txt',
                        'uuid': '1234'
                    },
                    {
                        'file_name': 'xyz.txt',
                        'uuid': '4567'
                    }
                ];
            attachmentsService.defineOriginalAttachments(attachments);
            expect(attachmentsService.originalAttachments).toEqual(attachments);
            attachments = null;
            attachmentsService.defineOriginalAttachments(attachments);
            expect(attachmentsService.originalAttachments).toEqual([]);
        });
        it('should have a method to update BackEnd Attachments', function () {
            expect(attachmentsService.updateBackEndAttachments).toBeDefined();
            attachmentsService.updateBackEndAttachments(mockStrataDataService.mockAttachments);
            expect(attachmentsService.backendAttachments).toEqual(mockStrataDataService.mockAttachments);
        });
        it('should have a method to fetch maximum attachment size', function () {
            expect(attachmentsService.fetchMaxAttachmentSize).toBeDefined();
            attachmentsService.fetchMaxAttachmentSize();
            spyOn(mockStrataService.values.cases.attachment, 'size').and.callThrough();
            scope.$root.$digest();
            expect(attachmentsService.maxAttachmentSize).toEqual(mockStrataDataService.mockFileSize);
        });
        it('should have a method to parse artifact html', function () {
            expect(attachmentsService.parseArtifactHtml).toBeDefined();
            attachmentsService.suggestedArtifact.description="Please attach an <a>Test</a> (optional)";
            var parsedHTML=attachmentsService.parseArtifactHtml();
            expect(parsedHTML).toBeDefined();

        });
    });
    //Suite for ProductsService

    describe('ProductsService', function () {
        it('should have a method to get products', async function () {
            expect(productsService.getProducts).toBeDefined();
            expect(hydrajs.products.getProducts).toBeDefined();
            var mockProducts = [{
                "name": mockStrataDataService.mockProducts[0].name,
                "code": mockStrataDataService.mockProducts[0].code,
                "supported": mockStrataDataService.mockProducts[0].supported_for_customer,
                "preferredServiceLevel": mockStrataDataService.mockProducts[0].preferredServiceLevel,
                "serviceLevels": mockStrataDataService.mockProducts[0].serviceLevels
            }];

            caseService.kase={};
            caseService.kase.product="Red Hat Enterprise Linux";
            caseService.owner="skesharigit";
            securityService.loginStatus.authedUser.is_internal=true;
            spyOn(hydrajs.products, 'getProducts').and.callFake(() => Promise.resolve(mockStrataDataService.mockProducts[0]));
            await productsService.getProducts(true);
            scope.$root.$digest();
            expect(productsService.products).toEqual(mockProducts);
        });

        it('should have a method to get version', async function () {
            expect(productsService.getVersions).toBeDefined();
            expect(hydrajs.products.getProductVersions).toBeDefined();
            caseService.kase={};
            caseService.kase.product="Red Hat Enterprise Linux";
            caseService.owner="skesharigit";
            var mockResponseSortedVersions = [{
                name: "7.0"
            }, {
                name: "6.3.2"
            }, {
                name: "6.3.1"
            }, {
                name: "6.3.0"
            }, {
                name: "6.2.4"
            }, {
                name: "6.2.3"
            }];

            var mockSortedVersions = [
                "7.0",
                "6.3.2",
                "6.3.1",
                "6.3.0",
                "6.2.4",
                "6.2.3"
            ];


            spyOn(hydrajs.products, 'getProductVersions').and.callFake(() => Promise.resolve(mockResponseSortedVersions));
            await productsService.getVersions(caseService.kase.product);
            scope.$root.$digest();
            expect(productsService.versions).toEqual(mockSortedVersions);

        });

        it('should have a method to get versions with different kase version', async function () {
            expect(productsService.getVersions).toBeDefined();
            expect(hydrajs.products.getProductVersions).toBeDefined();
            caseService.kase={};
            caseService.kase.product="Red Hat Enterprise Linux";
            caseService.kase.version="6.0";
            caseService.owner="skesharigit";
            var mockResponseSortedVersions = [{
                name: "7.0"
            }, {
                name: "6.3.2"
            }, {
                name: "6.3.1"
            }, {
                name: "6.3.0"
            }, {
                name: "6.2.4"
            }, {
                name: "6.2.3"
            }];

            var mockSortedVersions = [
                "7.0",
                "6.3.2",
                "6.3.1",
                "6.3.0",
                "6.2.4",
                "6.2.3"
            ];

            spyOn(hydrajs.products, 'getProductVersions').and.callFake(() => Promise.resolve(mockResponseSortedVersions));
            await productsService.getVersions(caseService.kase.product);
            //var returnValue=productsService.showVersionSunset();
            scope.$root.$digest();
            expect(productsService.versions).toEqual(mockSortedVersions);
        });

        it('should have a method for version sunset having versions which are sunset', function () {
            expect(productsService.showVersionSunset).toBeDefined();
            caseService.kase={};
            caseService.kase.product="Red Hat Enterprise Linux";
            caseService.kase.version="1.1 - eol";
            var returnValue=productsService.showVersionSunset();
            scope.$root.$digest();
            expect(returnValue).toEqual(true);
        });
        it('should have a method for version sunset having versions which are not sunset', function () {
            expect(productsService.showVersionSunset).toBeDefined();
            caseService.kase={};
            caseService.kase.product="Red Hat Enterprise Linux";
            caseService.kase.version="1.1";
            var returnValue=productsService.showVersionSunset();
            scope.$root.$digest();
            expect(returnValue).toEqual(false);
        });

    });

    describe('DiscussionService', function () {
        xit('should have a method to get discussion elements', function () {
            expect(discussionService.getDiscussionElements).toBeDefined();
            discussionService.getDiscussionElements('12345');
            spyOn(mockStrataService.cases.attachments, 'list').and.callThrough();
            scope.$root.$digest();
            expect(attachmentsService.originalAttachments ).toEqual(mockStrataDataService.mockAttachments);
        });
        it('should have a method to get discussion elements rejected', function () {
            expect(discussionService.getDiscussionElements).toBeDefined();
            mockStrataService.rejectCalls();
            discussionService.getDiscussionElements('12345');
            spyOn(mockStrataService.cases.attachments, 'list').and.callThrough();
            scope.$root.$digest();
            expect(attachmentsService.originalAttachments.length).toEqual(0);
        });
        it('should have a method to update elements', function () {
            caseService.comments=mockStrataDataService.mockComments;
            attachmentsService.originalAttachments=mockStrataDataService.mockAttachments;
            caseService.externalUpdates=mockStrataDataService.mockExternalUpdates;
            expect(discussionService.updateElements).toBeDefined();
            discussionService.chatTranscriptList = ['ABC'];
            discussionService.updateElements('12345');
            expect(discussionService.discussionElements).toEqual(caseService.comments.concat(attachmentsService.originalAttachments).concat(caseService.externalUpdates).concat(['ABC']));

        });
    });
});
