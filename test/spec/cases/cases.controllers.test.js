'use strict';
import _ from 'lodash'

describe('Case Controllers', function () {
    var mockRecommendationsService;
    var mockSearchResultsService;
    var mockStrataService;
    var mockStrataDataService;
    var mockCaseService;
    var mockAttachmentsService;
    var mockGroupService;
    var mockAlertService;
    var mockSearchBoxService;
    var mockSearchCaseService;
    var mockTreeViewSelectorData;
    var mockScope;
    var httpMock;
    var rootScope;
    var q;
    var securityService;
    var mockProductsService;
    var mockHeaderService;
    var mockRHAUtils;
    var rhaUtils;
    var mockDiscussionService;
    var searchBoxService;
    var constantsService;

    beforeEach(angular.mock.module('RedhatAccess.cases'));
    beforeEach(angular.mock.module('RedhatAccess.mock')); // TypeError: undefined is not an object (evaluating 'strataService.authentication.checkLogin') (line 2356)

    beforeEach(inject(function ($injector, $rootScope, $q, $httpBackend) {
        q = $q;
        mockStrataService = $injector.get('strataService');
        mockCaseService = $injector.get('MockCaseService');
        mockHeaderService = $injector.get('MockHeaderService');
        mockRecommendationsService = $injector.get('MockRecommendationsService');
        mockSearchResultsService = $injector.get('MockSearchResultsService');
        mockStrataDataService = $injector.get('MockStrataDataService');
        mockAttachmentsService = $injector.get('MockAttachmentsService');
        mockGroupService = $injector.get('MockGroupService');
        mockAlertService = $injector.get('MockAlertService');
        mockSearchBoxService = $injector.get('MockSearchBoxService');
        searchBoxService= $injector.get('SearchBoxService');
        mockSearchCaseService = $injector.get('MockSearchCaseService');
        mockTreeViewSelectorData = $injector.get('MockTreeViewSelectorData');
        securityService = $injector.get('securityService');
        mockProductsService = $injector.get('MockProductsService');
        mockDiscussionService= $injector.get('MockDiscussionService');
        mockRHAUtils=$injector.get('MockRHAUtils');
        rhaUtils=$injector.get('RHAUtils');
        constantsService=$injector.get('ConstantsService');
        mockScope = $rootScope.$new();
        rootScope = $rootScope;
        httpMock = $httpBackend;
    }));
    //Suite for DetailsSection
    describe('DetailsSection', function () {
        it('should have a function for initializing the selects of case types,product,status,severity and group', inject(function ($controller) {
            $controller('DetailsSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                ProductsService: mockProductsService
            });
            securityService.loginStatus.authedUser={};
            securityService.loginStatus.authedUser.is_internal=true;
            mockCaseService.kase={};
            mockCaseService.kase.contact_sso_username="test";
            expect(mockScope.init).toBeDefined();
            mockScope.init();
            spyOn(mockStrataService.values.cases, 'types').and.callThrough();
            spyOn(mockStrataService.groups, 'list').and.callThrough();
            spyOn(mockStrataService.values.cases, 'status').and.callThrough();
            spyOn(mockStrataService.values.cases, 'severity').and.callThrough();
            spyOn(mockProductsService, 'getProducts').and.callThrough();
            mockScope.$root.$digest();
            expect(mockScope.userIsCaseOwner).toBe(false);
            //expect(mockScope.groups).toEqual(mockStrataDataService.mockGroups);
            //expect(mockScope.statuses).toEqual(mockStrataDataService.mockStatuses);
            //expect(mockCaseService.severities).toEqual(mockStrataDataService.mockSeverities);
        }));
        it('should have a function for initializing the selects rejected', inject(function ($controller) {
            $controller('DetailsSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                ProductsService:mockProductsService
            });
            expect(mockScope.init).toBeDefined();
            mockStrataService.rejectCalls();
            spyOn(mockStrataService.values.cases, 'types').and.callThrough();
            spyOn(mockStrataService.groups, 'list').and.callThrough();
            spyOn(mockStrataService.values.cases, 'status').and.callThrough();
            spyOn(mockStrataService.values.cases, 'severity').and.callThrough();
            spyOn(mockProductsService, 'getProducts').and.callThrough();
            mockScope.init();
            mockScope.$root.$digest();
            expect(mockScope.caseTypes).toBeUndefined();
            expect(mockScope.groups).toBeUndefined();
            expect(mockScope.statuses).toBeUndefined();
            expect(mockCaseService.severities).toEqual([]);
        }));
        it('should have a function for updating case details resolved', inject(function ($controller) {
            $controller('DetailsSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
            });
            mockScope.summaryForm = {
                $valid: true,
                $setPristine: function () {
                }
            };
            mockScope.detailsForm = {
                $valid: true,
                $setPristine: function () {
                }
            };
            mockCaseService.kase.case_number = '1234';
            mockCaseService.kase.type = 'bug';
            mockCaseService.kase.severity = 'high';
            mockCaseService.kase.status = {
                name: 'open'
            };
            mockCaseService.kase.alternate_id = '12345';
            mockCaseService.kase.product = 'Red Hat Enterprise Linux';
            mockCaseService.kase.version = '6.0';
            mockCaseService.kase.summary = 'Test Summary';
            mockCaseService.kase.group = {
                name: 'Test Group',
                number: '123456'
            };
            mockCaseService.kase.fts = true;
            mockCaseService.kase.contact_info24_x7 = 'test@test.com';
            expect(mockScope.updateCase).toBeDefined();
            mockScope.updateCase();
            spyOn(mockCaseService, 'updateCase').and.callThrough();
            mockScope.$root.$digest();
            expect(mockScope.updatingDetails).toBe(false);
        }));
        it('should have a function for case details changed', inject(function ($controller) {
            $controller('DetailsSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService
            });
            mockScope.caseDetails={};
            mockScope.caseDetails.alternate_id = {

                    $dirty:true


            };
            mockScope.caseDetails.product = {

                $dirty:false


            };
            mockScope.caseDetails.version = {

                $dirty:false


            };
            mockScope.caseDetails.group = {

                $dirty:false


            };
            expect(mockScope.caseDetailsChanged).toBeDefined();
            var mockVal=mockScope.caseDetailsChanged();
            mockScope.$root.$digest();
            expect(mockVal).toEqual(true);

        }));

        it('should have a function for changing case owner details', inject(function ($controller) {
            $controller('DetailsSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService
            });
            mockScope.caseDetails = {
                $valid: true,
                $setPristine: function () {
                }
            };
            expect(mockScope.changeCaseOwner).toBeDefined();
            mockScope.changeCaseOwner();
            spyOn(mockStrataService.cases.owner, 'update').and.callThrough();
            mockScope.$root.$digest();
            expect(mockScope.updatingDetails).toBe(false);
            expect(mockScope.userIsCaseOwner).toBe(true);

        }));

        it('should have a function for toggle extra info', inject(function ($controller) {
            $controller('DetailsSection', {
                $scope: mockScope

            });
            mockScope.showExtraInfo = false;
            expect(mockScope.toggleExtraInfo).toBeDefined();
            mockScope.toggleExtraInfo();
            mockScope.$root.$digest();
            expect(mockScope.showExtraInfo).toBe(true);

        }));

        it('should have a function for reset data', inject(function ($controller) {
            $controller('DetailsSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                ProductsService:mockProductsService
            });
            mockScope.detailsForm = {
                $valid: true,
                $setPristine: function () {
                }
            };
            spyOn(mockProductsService, 'getVersions').and.callThrough();
            spyOn(mockCaseService, 'resetCase');
            expect(mockScope.resetData).toBeDefined();
            mockScope.resetData();
            mockScope.$root.$digest();
        }));
        it('should have a function for edit case summary', inject(function ($controller) {
            $controller('DetailsSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                ProductsService:mockProductsService
            });
            expect(mockScope.editCaseSummary).toBeDefined();
            mockScope.editCaseSummary(true);
            mockScope.$root.$digest();
            expect(mockScope.caseSummaryEditable).toBe(true);
        }));
        it('should have a function for not editing case summary', inject(function ($controller) {
            $controller('DetailsSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                ProductsService:mockProductsService
            });
            mockCaseService.kase={};
            mockCaseService.kase.summary="test";
            mockCaseService.prestineKase={};
            mockCaseService.prestineKase.summary="test";
            expect(mockScope.editCaseSummary).toBeDefined();
            mockScope.editCaseSummary(false);
            mockScope.$root.$digest();
            expect(mockScope.caseSummaryEditable).toBe(false);
        }));
        it('should have a function for validate page with versions loading', inject(function ($controller) {
            $controller('DetailsSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                ProductsService:mockProductsService
            });
            mockProductsService.versionLoading=true;
            expect(mockScope.validatePage).toBeDefined();
            var result=mockScope.validatePage();
            mockScope.$root.$digest();
            expect(result).toBe(true);
        }));
        it('should have a function for validate page with no versions loading with product blank', inject(function ($controller) {
            $controller('DetailsSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                ProductsService:mockProductsService
            });
            mockProductsService.versionLoading=false;
            mockCaseService.kase.product='';
            expect(mockScope.validatePage).toBeDefined();
            var result=mockScope.validatePage();
            mockScope.$root.$digest();
            expect(result).toBe(true);
        }));
        it('should have a function for validate page with no versions loading with version not blank and product not blank', inject(function ($controller) {
            $controller('DetailsSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                ProductsService:mockProductsService
            });
            mockProductsService.versionLoading=false;
            mockCaseService.kase.product='Test';
            mockCaseService.kase.version="1.1";
            expect(mockScope.validatePage).toBeDefined();
            var result=mockScope.validatePage();
            mockScope.$root.$digest();
            expect(result).toBe(true);
        }));
        it('should have a function for validate page with no versions loading with version and product blank', inject(function ($controller) {
            $controller('DetailsSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                ProductsService:mockProductsService
            });
            mockProductsService.versionLoading=false;
            mockCaseService.kase.product='';
            mockCaseService.kase.version='';
            expect(mockScope.validatePage).toBeDefined();
            var result=mockScope.validatePage();
            mockScope.$root.$digest();
            expect(result).toBe(true);
        }));
    });

    //Suite for AddCommentSection
    describe('AddCommentSection', function () {
        xit('should have a function for adding comments to case resolved', inject(function ($controller) {
            $controller('AddCommentSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService
            });
            mockCaseService.kase.case_number = '1234';
            mockCaseService.commentText = 'test comment';
            mockScope.saveDraftPromise = '3';
            mockCaseService.kase.status = { name: 'Closed' };
            expect(mockScope.addComment).toBeDefined();
            mockScope.addComment();
            spyOn(mockStrataService.cases.comments, 'post').and.callThrough();
            mockScope.$root.$digest();
            expect(mockCaseService.kase.status.name).toEqual('Waiting on Red Hat');
        }));
        xit('should have a function for adding comments to case rejected', inject(function ($controller) {
            $controller('AddCommentSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService
            });
            mockCaseService.kase.case_number = '1234';
            mockCaseService.commentText = 'test comment';
            mockScope.saveDraftPromise = '3';
            mockCaseService.kase.status = { name: 'Waiting on Red Hat' };
            expect(mockScope.addComment).toBeDefined();
            mockStrataService.rejectCalls();
            spyOn(mockStrataService.cases.comments, 'post').and.callThrough();
            mockScope.addComment();
            mockScope.$root.$digest();
            expect(mockCaseService.kase.status.name).toEqual('Waiting on Red Hat');
            expect(mockScope.addingComment).toBe(false);
        }));
        xit('should have a function for adding draft comments to case', inject(function ($controller) {
            $controller('AddCommentSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService
            });
            mockCaseService.kase.case_number = '1234';
            mockCaseService.commentText = 'test comment';
            mockScope.saveDraftPromise = '3';
            mockCaseService.kase.status = { name: 'Closed' };
            mockCaseService.draftComment = {};
            mockCaseService.draftComment.id = '1111';
            expect(mockScope.addComment).toBeDefined();
            mockScope.addComment();
            spyOn(mockStrataService.cases.comments, 'put').and.callThrough();
            mockScope.$root.$digest();
            expect(mockCaseService.kase.status.name).toEqual('Waiting on Red Hat');
        }));
        it('should have a function for saving non draft comments', inject(function ($controller) {
            $controller('AddCommentSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService
            });
            mockCaseService.kase.case_number = '1234';
            mockCaseService.commentText = 'test comment';
            expect(mockScope.saveDraft).toBeDefined();
            mockScope.saveDraft();
            spyOn(mockStrataService.cases.comments, 'post').and.callThrough();
            mockScope.$root.$digest();
            expect(mockCaseService.draftSaved).toBe(true);
            expect(mockCaseService.draftComment.case_number).toEqual('1234');
        }));
        it('should have a function for saving draft comments', inject(function ($controller) {
            $controller('AddCommentSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService
            });
            mockCaseService.kase.case_number = '1234';
            mockCaseService.commentText = 'test comment';
            mockCaseService.draftComment = {};
            expect(mockScope.saveDraft).toBeDefined();
            mockScope.saveDraft();
            spyOn(mockStrataService.cases.comments, 'put').and.callThrough();
            mockScope.$root.$digest();
            expect(mockCaseService.draftSaved).toBe(true);
            expect(mockCaseService.draftComment.text).toEqual('test comment');
        }));
        it('should have a function for saving draft comments rejected', inject(function ($controller) {
            $controller('AddCommentSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService
            });
            mockCaseService.kase.case_number = '1234';
            mockCaseService.commentText = 'test comment';
            mockCaseService.draftComment = {};
            expect(mockScope.saveDraft).toBeDefined();
            mockStrataService.rejectCalls();
            spyOn(mockStrataService.cases.comments, 'put').and.callThrough();
            mockScope.saveDraft();
            mockScope.$root.$digest();
            expect(mockScope.savingDraft).toBe(false);
        }));
        it('should have a function for on New Comment Keypress', inject(function ($controller) {
            $controller('AddCommentSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService
            });
            mockScope.addingComment = false;
            mockCaseService.commentText = 'test comment';
            expect(mockScope.onNewCommentKeypress).toBeDefined();
            mockScope.onNewCommentKeypress();
            expect(mockCaseService.disableAddComment).toBe(false);
        }));
        it('should have a function for clearing comment', inject(function ($controller) {
            $controller('AddCommentSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                DiscussionService:mockDiscussionService,
                AttachmentsService:mockAttachmentsService
            });
            mockScope.addingComment = false;
            mockCaseService.commentText = 'test comment';
            mockDiscussionService.commentTextBoxEnlargen=true;
            expect(mockScope.clearComment).toBeDefined();
            mockScope.clearComment();
            mockScope.$root.$digest();
            expect(mockCaseService.commentText).toEqual('');
            expect(mockDiscussionService.commentTextBoxEnlargen).toBe(false);
        }));
        it('should have a function for comment public change', inject(function ($controller) {
            $controller('AddCommentSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                DiscussionService:mockDiscussionService,
                AttachmentsService:mockAttachmentsService
            });
            mockCaseService.localStorageCache=false;
            mockScope.addingComment=false;
            mockCaseService.commentText = 'test comment';
            expect(mockScope.onCommentPublicChange).toBeDefined();
            mockScope.onCommentPublicChange();
            mockScope.$root.$digest();
            expect(mockCaseService.disableAddComment).toBe(false);
        }));
        it('should have a function for text box minimize', inject(function ($controller) {
            $controller('AddCommentSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                DiscussionService:mockDiscussionService,
                AttachmentsService:mockAttachmentsService
            });

            mockCaseService.commentText = '';
            expect(mockScope.shouldTextboxMinimize).toBeDefined();
            mockScope.shouldTextboxMinimize();
            mockScope.$root.$digest();
            expect(mockDiscussionService.commentTextBoxEnlargen).toBe(false);
        }));
    });
    //Suite for New
    describe('New', function () {
        it('should have a function for submitting case', inject(function ($controller) {
            $controller('New', {
                $scope: mockScope,
                CaseService: mockCaseService,
                RecommendationsService: mockRecommendationsService,
                SearchResultsService: mockSearchResultsService,
                strataService: mockStrataService,
                AttachmentsService: mockAttachmentsService,
                NEW_DEFAULTS: mockStrataDataService.value,
                NEW_CASE_CONFIG: mockStrataDataService.value
            });
            mockCaseService.kase.version = '6.0';
            mockCaseService.kase.summary = 'Test Summary';
            mockCaseService.kase.description = 'Test Description';
            mockCaseService.kase.severity = {
                name: 'high',
                value: '1'
            };
            mockCaseService.kase.product = {
                name: 'Red Hat Enterprise Linux',
                code: '123456'
            };
            mockCaseService.group = 'open';
            mockCaseService.entitlement = 'premium';
            mockCaseService.fts = true;
            mockCaseService.fts_contact = 'testUser@test.com';
            mockCaseService.owner = 'testUser';
            mockCaseService.kase.account = {
                name: 'testAccount',
                number: '12345'
            };
            securityService.loginStatus.authedUser.can_add_attachments=true;
            expect(mockScope.doSubmit).toBeDefined();
            mockScope.doSubmit();
            spyOn(mockStrataService.cases, 'post').and.callThrough();
            mockScope.$root.$digest();
            expect(mockScope.submittingCase).toBe(false);
        }));
        it('should have a function for initializing the drop downs of product,severity and group', inject(function ($controller) {
            $controller('New', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                ProductsService:mockProductsService,
                //NEW_DEFAULTS: mockStrataDataService.value,
                NEW_CASE_CONFIG: mockStrataDataService.value
            });
            expect(mockScope.initSelects).toBeDefined();
            mockScope.initSelects();
            spyOn(mockStrataService.values.cases, 'severity').and.callThrough();
            spyOn(mockStrataService.groups, 'list').and.callThrough();
            spyOn(mockProductsService, 'getProducts').and.callThrough();
            mockScope.$root.$digest();
            expect(mockCaseService.severities).toEqual(mockStrataDataService.mockSeverities);
            expect(mockCaseService.groups).toEqual(mockStrataDataService.mockGroups);
        }));
        it('should have a function for get locations solution text for refining top solutions', inject(function ($controller) {
            $controller('New', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                ProductsService:mockProductsService,
                //NEW_DEFAULTS: mockStrataDataService.value,
                NEW_CASE_CONFIG: mockStrataDataService.value
            });
            mockCaseService.kase={};
            mockCaseService.kase.product="Red Hat Enterprise Linux";
            mockCaseService.kase.version="7.0";
            mockCaseService.kase.description="test";
            mockCaseService.kase.summary="test";
            expect(mockScope.getLocatingSolutionText).toBeDefined();
            var text=mockScope.getLocatingSolutionText();
            mockScope.$root.$digest();
            expect(text).toEqual("Refining top solutions");
        }));

        it('should have a function for get locations solution text for locating top solutions', inject(function ($controller) {
            $controller('New', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                ProductsService:mockProductsService,
                //NEW_DEFAULTS: mockStrataDataService.value,
                NEW_CASE_CONFIG: mockStrataDataService.value
            });
            mockCaseService.kase={};
            mockCaseService.kase.product="Red Hat Enterprise Linux";
            mockCaseService.kase.version="7.0";
            expect(mockScope.getLocatingSolutionText).toBeDefined();
            var text=mockScope.getLocatingSolutionText();
            mockScope.$root.$digest();
            expect(text).toEqual("Locating top solutions");
        }));
        it('should have a function for initializing description', inject(function ($controller) {
            $controller('New', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                ProductsService:mockProductsService,
                $location:mockStrataDataService.mockLocation,
                NEW_CASE_CONFIG: mockStrataDataService.value
            });
            expect(mockScope.initDescription).toBeDefined();
            var text=mockScope.initDescription();
        }));
        it('should have a function for set search options when group length is 0', inject(function ($controller) {
            $controller('New', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                ProductsService:mockProductsService,
                $location:mockStrataDataService.mockLocation,
                NEW_CASE_CONFIG: mockStrataDataService.value
            });
            expect(mockScope.setSearchOptions).toBeDefined();
            mockCaseService.groups=[];
            mockScope.setSearchOptions(true);
            mockScope.$root.$digest();
            spyOn(mockCaseService, 'populateGroups').and.callThrough();
            mockScope.$root.$digest();

        }));
        it('should have a function for set search options when group length is not 0', inject(function ($controller) {
            $controller('New', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                ProductsService:mockProductsService,
                $location:mockStrataDataService.mockLocation,
                NEW_CASE_CONFIG: mockStrataDataService.value
            });
            expect(mockScope.setSearchOptions).toBeDefined();
            mockCaseService.groups={};
            mockScope.setSearchOptions(true);
            mockScope.$root.$digest();
            expect(mockCaseService.showsearchoptions).toBe(true);
            expect(mockCaseService.kase.group).toEqual(mockStrataDataService.mockGroups[1]);
        }));
    });

    //Suite for RecommendationsSection
    describe('RecommendationsSection', function () {
        it('should have a function to pin Recommendations', inject(function ($controller) {
            $controller('EditCaseRecommendationsController', {
                $scope: mockScope,
                RecommendationsService: mockRecommendationsService,
                CaseService: mockCaseService,
                strataService: mockStrataService
            });
            expect(mockScope.pinRecommendation).toBeDefined();
            mockCaseService.kase.case_number = '1234';
            mockRecommendationsService.pinnedRecommendations = mockStrataDataService.mockRecommendations;
            mockScope.pinRecommendation(mockStrataDataService.mockSolutionNotPinned, undefined, undefined);
            spyOn(mockStrataService.cases, 'put').and.callThrough();
            mockScope.$root.$digest();
            expect(mockScope.currentRecPin.pinned).toBe(true);
            expect(mockScope.currentRecPin.pinning).toBe(false);
            expect(mockRecommendationsService.pinnedRecommendations.length).toBe(3);
        }));
        it('should have a function to unpin Recommendations', inject(function ($controller) {
            $controller('EditCaseRecommendationsController', {
                $scope: mockScope,
                RecommendationsService: mockRecommendationsService,
                CaseService: mockCaseService,
                strataService: mockStrataService
            });
            expect(mockScope.pinRecommendation).toBeDefined();
            mockCaseService.kase.case_number = '1234';
            mockRecommendationsService.pinnedRecommendations = mockStrataDataService.mockRecommendations;
            mockScope.pinRecommendation(mockStrataDataService.mockRecommendationPinned, undefined, undefined);
            spyOn(mockStrataService.cases, 'put').and.callThrough();
            mockScope.$root.$digest();
            expect(mockScope.currentRecPin.pinned).toBe(false);
            expect(mockScope.currentRecPin.pinning).toBe(false);
            expect(mockRecommendationsService.pinnedRecommendations.length).toBe(1);
        }));
        it('should have a function to pin Recommendations rejected', inject(function ($controller) {
            $controller('EditCaseRecommendationsController', {
                $scope: mockScope,
                RecommendationsService: mockRecommendationsService,
                CaseService: mockCaseService,
                strataService: mockStrataService
            });
            expect(mockScope.pinRecommendation).toBeDefined();
            mockCaseService.kase.case_number = '1234';
            mockStrataService.rejectCalls();
            spyOn(mockStrataService.cases, 'put').and.callThrough();
            mockScope.pinRecommendation(mockStrataDataService.mockSolutionNotPinned, undefined, undefined);
            mockScope.$root.$digest();
            expect(mockScope.currentRecPin.pinned).toBe(false);
            expect(mockScope.currentRecPin.pinning).toBe(false);
        }));
    });

    //Suite for ListNewAttachments
    describe('ListNewAttachments', function () {
        it('should have a function to remove Local Attachment', inject(function ($controller) {
            $controller('ListNewAttachments', {
                $scope: mockScope,
                AttachmentsService: mockAttachmentsService
            });
            expect(mockScope.removeLocalAttachment).toBeDefined();
            mockAttachmentsService.updatedAttachments = mockStrataDataService.mockAttachments;
            expect(mockAttachmentsService.updatedAttachments.length).toBe(2);
            mockScope.removeLocalAttachment(1);
            expect(mockAttachmentsService.updatedAttachments.length).toBe(1);
        }));
    });

    //Suite for EmailNotifySelect
    describe('EmailNotifySelect', function () {
        it('should have a function to update Notified Users resolved', inject(function ($controller) {
            $controller('EmailNotifySelect', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                EDIT_CASE_CONFIG: mockStrataDataService.value
            });
            expect(mockScope.selectedUsersChanged).toBeDefined();
            mockCaseService.kase.case_number = '1234';
            mockCaseService.originalNotifiedUsers = mockStrataDataService.mockOriginalNotifiedUsers;
            mockScope.selectedUsers = _.map(mockStrataDataService.mockUpdatedNotifiedUsers, 'sso_username');
            spyOn(mockStrataService.cases.notified_users, 'remove').and.callThrough();
            spyOn(mockStrataService.cases.notified_users, 'add').and.callThrough();
            mockScope.selectedUsersChanged().then(() => {
                mockScope.$root.$digest();
                expect(mockScope.saving).toBe(false);
                expect(_.map(mockCaseService.originalNotifiedUsers, 'sso_username')).toEqual(mockScope.selectedUsers);
            });
        }));
        it('should have a function to update Notified Users rejected', inject(function ($controller) {
            $controller('EmailNotifySelect', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                EDIT_CASE_CONFIG: mockStrataDataService.value
            });
            expect(mockScope.selectedUsersChanged).toBeDefined();
            mockCaseService.kase.case_number = '1234';
            mockCaseService.originalNotifiedUsers = mockStrataDataService.mockOriginalNotifiedUsers;
            mockScope.selectedUsers = _.map(mockStrataDataService.mockUpdatedNotifiedUsers, 'sso_username');
            mockStrataService.rejectCalls();
            spyOn(mockStrataService.cases.notified_users, 'remove').and.callThrough();
            spyOn(mockStrataService.cases.notified_users, 'add').and.callThrough();
            mockScope.selectedUsersChanged().then(() => {
                mockScope.$root.$digest();
                expect(mockScope.saving).toBe(false);
                expect(mockCaseService.originalNotifiedUsers).toEqual(mockStrataDataService.mockOriginalNotifiedUsers);
            });
        }));
    });

    //Suite for DeleteGroupButton
    describe('DeleteGroupButton', function () {
        it('should have a function to delete Groups resolved', inject(function ($controller) {
            $controller('DeleteGroupButton', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                GroupService: mockGroupService,
                AlertService: mockAlertService
            });
            expect(mockScope.deleteGroups).toBeDefined();
            mockCaseService.groups = mockStrataDataService.mockGroups;
            mockScope.deleteGroups();
            spyOn(mockStrataService.groups, 'remove').and.callThrough();
            mockScope.$root.$digest();
            expect(mockAlertService.alerts[0].message).toEqual('Successfully deleted groups.');
        }));
        it('should have a function to delete Groups rejected', inject(function ($controller) {
            $controller('DeleteGroupButton', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                GroupService: mockGroupService,
                AlertService: mockAlertService
            });
            expect(mockScope.deleteGroups).toBeDefined();
            mockCaseService.groups = mockStrataDataService.mockGroups;
            mockStrataService.rejectCalls();
            spyOn(mockStrataService.groups, 'remove').and.callThrough();
            mockScope.deleteGroups();
            mockScope.$root.$digest();
            expect(mockAlertService.alerts[0].message).toEqual('Deleting groups...');
            expect(mockAlertService.alerts[1].message).toEqual('strata error');
        }));
    });

    //Suite for CreateGroupModal
    describe('CreateGroupModal', function () {
        it('should have a function to create a Group resolved', inject(function ($controller) {
            $controller('CreateGroupModal', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                GroupService: mockGroupService,
                AlertService: mockAlertService,
                $uibModalInstance: mockStrataDataService.mockModalInstance
            });
            expect(mockScope.createGroup).toBeDefined();
            mockScope.createGroup();
            spyOn(mockStrataService.groups, 'create').and.callThrough();
            mockScope.$root.$digest();
            expect(mockAlertService.alerts[0].message).toContain('Successfully created group');
            expect(mockCaseService.groups[0].number).toEqual(mockStrataDataService.mockGroups[0].number);
        }));
        it('should have a function to create a Group resolved with success null', inject(function ($controller) {
            mockStrataService.returnNull();
            $controller('CreateGroupModal', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                GroupService: mockGroupService,
                AlertService: mockAlertService,
                $uibModalInstance: mockStrataDataService.mockModalInstance
            });
            expect(mockScope.createGroup).toBeDefined();
            mockScope.createGroup();
            spyOn(mockStrataService.groups, 'create').and.callThrough();
            mockScope.$root.$digest();
            expect(mockAlertService.alerts[0].message).toContain('Successfully created group');
            expect(mockCaseService.groups[0].number).toEqual(mockStrataDataService.mockGroups[0].number);
        }));
        it('should have a function to create a Group rejected', inject(function ($controller) {
            $controller('CreateGroupModal', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                GroupService: mockGroupService,
                AlertService: mockAlertService,
                $uibModalInstance: mockStrataDataService.mockModalInstance
            });
            expect(mockScope.createGroup).toBeDefined();
            mockStrataService.rejectCalls();
            spyOn(mockStrataService.groups, 'create').and.callThrough();
            mockScope.createGroup();
            mockScope.$root.$digest();
            expect(mockAlertService.alerts[0].message).toEqual('strata error');
            expect(mockAlertService.alerts[0].type).toEqual('danger');
        }));
        it('should have a function to close Modal window', inject(function ($controller) {
            $controller('CreateGroupModal', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                GroupService: mockGroupService,
                AlertService: mockAlertService,
                $uibModalInstance: mockStrataDataService.mockModalInstance
            });
            expect(mockScope.closeModal).toBeDefined();
            mockScope.closeModal();
        }));
        it('should have a function to trigger create group on GroupName KeyPress', inject(function ($controller) {
            $controller('CreateGroupModal', {
                $scope: mockScope,
                CaseService: mockCaseService,
                strataService: mockStrataService,
                GroupService: mockGroupService,
                AlertService: mockAlertService,
                $uibModalInstance: mockStrataDataService.mockModalInstance
            });
            expect(mockScope.onGroupNameKeyPress).toBeDefined();
            var event = { 'keyCode': 13 };
            mockScope.onGroupNameKeyPress(event);
        }));
    });

    //Suite for SearchBox
    describe('SearchBox', function () {
        it('should have a function to do search on filter key press', inject(function ($controller) {
            $controller('SearchBox', {
                $scope: mockScope,
                SearchBoxService: mockSearchBoxService
            });
            expect(mockScope.onFilterKeyPress).toBeDefined();
            var event = { 'keyCode': 13 };
            mockScope.onFilterKeyPress(event);
        }));
        it('should have a function to to check key press', inject(function ($controller) {
            $controller('SearchBox', {
                $scope: mockScope,
                SearchBoxService: mockSearchBoxService
            });
            expect(mockScope.onFilterKeyPress).toBeDefined();
            var event = { 'keyCode': 14 };
            mockScope.onFilterKeyPress(event);
        }));
        it('should have a function to clear search', inject(function ($controller) {
            $controller('SearchBox', {
                $scope: mockScope,
                SearchBoxService: mockSearchBoxService
            });
            expect(mockScope.clearSearch).toBeDefined();
            mockScope.clearSearch();
            expect(mockSearchBoxService.searchTerm).toBeUndefined();

        }));
    });

    //Suite for AttachLocalFile
    describe('AttachLocalFile', function () {
        it('should have a function to clear filename and file description', inject(function ($controller) {
            $controller('AttachLocalFile', {
                $scope: mockScope,
                AttachmentsService: mockAttachmentsService
            });
            mockScope.fileName = 'test_file';
            mockScope.fileDescription = 'test_description';
            expect(mockScope.clearSelectedFile).toBeDefined();
            mockScope.fileName = 'Test fileName';
            mockScope.fileDescription = 'Test file description';
            mockScope.clearSelectedFile();
            expect(mockScope.fileName).toEqual('No file chosen');
            expect(mockScope.fileDescription).toEqual('');
        }));
        it('should have a function to get selected file', inject(function ($controller) {
            $controller('AttachLocalFile', {
                $scope: mockScope,
                AttachmentsService: mockAttachmentsService,
                AlertService: mockAlertService,
                RHAUtils:mockRHAUtils
            });
            var file = {
                files: [{
                    size: 32323,
                    name: 'gfdsfds'
                }]
            };
            var fileUploader = [file];
            spyOn(window, '$').and.returnValue(fileUploader);
            expect(mockScope.selectFile).toBeDefined();
            // TODO -- This line is throwing: TypeError: undefined is not an object (evaluating '$('#fileUploader')[0].files') (line 106980)
            // mockScope.selectFile();
        }));
        it('should add file to the list of attachments', inject(function ($controller) {
            $controller('AttachLocalFile', {
                $scope: mockScope,
                AttachmentsService: mockAttachmentsService,
                RHAUtils:mockRHAUtils
            });

            var file = {
                size: 32323,
                name: 'gfdsfds',
                fileDescription: '',
            };

            expect(mockScope.addFile).toBeDefined();
            mockScope.addFile(file);
            expect(mockAttachmentsService.updatedAttachments.length).toEqual(1);
            expect(mockAttachmentsService.updatedAttachments[0].description).toEqual('');
        }));
    });

    //Suite for ExportCSVButton
    describe('ExportCSVButton', function () {
        it('shoud have a function to export all cases as CSV resolved', inject(function ($controller) {
            $controller('ExportCSVButton', {
                $scope: mockScope,
                strataService: mockStrataService,
                AlertService: mockAlertService
            });
            expect(mockScope.exports).toBeDefined();
            mockScope.exports();
            spyOn(mockStrataService.cases, 'csv').and.callThrough();
            mockScope.$root.$digest();
            expect(mockScope.exporting).toEqual(false);
        }));
        it('shoud have a function to export all cases as CSV rejected', inject(function ($controller) {
            $controller('ExportCSVButton', {
                $scope: mockScope,
                strataService: mockStrataService,
                AlertService: mockAlertService
            });
            expect(mockScope.exports).toBeDefined();
            mockStrataService.rejectCalls();
            spyOn(mockStrataService.cases, 'csv').and.callThrough();
            mockScope.exports();
            mockScope.$root.$digest();
            expect(mockAlertService.alerts[0].message).toEqual('strata error');
        }));
    });

    //Suite for Edit
    describe('Edit', function () {
        it('should have a function to initialize the case edit page rejected', inject(function ($controller) {
            $controller('Edit', {
                $scope: mockScope,
                $stateParams: mockStrataDataService.value,
                EDIT_CASE_CONFIG: mockStrataDataService.value,
                AttachmentsService: mockAttachmentsService,
                strataService: mockStrataService,
                CaseService: mockCaseService,
                RecommendationsService: mockRecommendationsService,
                AlertService: mockAlertService
            });
            mockScope.failedToLoadCase = true;
            expect(mockScope.init).toBeDefined();
            mockStrataService.rejectCalls();
            spyOn(mockStrataService.cases, 'get').and.callThrough();
            spyOn(mockStrataService.products, 'versions').and.callThrough();
            spyOn(mockStrataService.accounts, 'get').and.callThrough();
            spyOn(mockStrataService.cases.attachments, 'list').and.callThrough();
            spyOn(mockStrataService.cases.comments, 'get').and.callThrough();
            mockScope.init();
            mockScope.$root.$digest();
            expect(mockHeaderService.pageLoadFailure).toEqual(true);
        }));
        it('should have a function to initialize the case edit page accepted', inject(function ($controller) {
            $controller('Edit', {
                $scope: mockScope,
                $stateParams: mockStrataDataService.value,
                EDIT_CASE_CONFIG: mockStrataDataService.value,
                AttachmentsService: mockAttachmentsService,
                strataService: mockStrataService,
                CaseService: mockCaseService,
                RecommendationsService: mockRecommendationsService,
                AlertService: mockAlertService,
                HeaderService:mockHeaderService
            });
            mockScope.failedToLoadCase = false;
            expect(mockScope.init).toBeDefined();
            spyOn(mockStrataService.cases, 'get').and.callThrough();
            spyOn(mockStrataService.accounts, 'get').and.callThrough();
            mockStrataDataService.value.showRecommendations=false;
            spyOn(mockRecommendationsService, 'getRecommendations').and.callThrough();;
            mockScope.init();
            mockScope.$root.$digest();
            expect(mockHeaderService.pageLoadFailure).toEqual(false);
            mockStrataDataService.value.showRecommendations=true;
        }));

    });
    //Suite for AttachmentsSection
    describe('AttachmentsSection', function () {
        it('should have a function to update attachment in attachment list', inject(function ($controller) {
            $controller('AttachmentsSection', {
                $scope: mockScope,
                AttachmentsService: mockAttachmentsService,
                CaseService: mockCaseService
            });
            expect(mockScope.doUpdate).toBeDefined();
            mockCaseService.kase.case_number = '12345';
            mockScope.doUpdate();
            spyOn(mockAttachmentsService, 'updateAttachments').and.callThrough();
            mockScope.$root.$digest();
            expect(mockScope.updatingAttachments).toEqual(false);
            expect(mockAttachmentsService.updatedAttachments).toContain(mockStrataDataService.mockAttachments[0]);
        }));
        it('should have a function to clear selected file', inject(function ($controller) {
            $controller('AttachmentsSection', {
                $scope: mockScope,
                AttachmentsService: mockAttachmentsService,
                CaseService: mockCaseService
            });
            expect(mockScope.ieClearSelectedFile).toBeDefined();
            mockScope.ieClearSelectedFile();
            expect(mockScope.ieFileDescription).toEqual('');
        }));
    });

    describe('GroupList', function () {
        it('should have a init function', inject(function ($controller) {
            $controller('GroupList', {
                $scope: mockScope,
                strataService: mockStrataService,
                CaseService: mockCaseService,
                GroupService: mockGroupService,
                SearchBoxService: mockSearchBoxService
            });
            securityService.loginStatus.account={};
            securityService.loginStatus.account.has_group_acls =true;
            securityService.loginStatus.authedUser={};
            securityService.loginStatus.authedUser.org_admin=true;
            securityService.loginStatus.authedUser.sso_username="test_user";
            expect(mockScope.init).toBeDefined();
            mockGroupService.groupsOnScreen = mockStrataDataService.mockGroups;
            mockScope.init();
            spyOn(mockStrataService.groups, 'list').and.callThrough();
            mockScope.$root.$digest();
            expect(mockScope.canManageGroups).toBe(true);
            expect(mockScope.groupsLoading).toBe(false);
        }));
        it('should have a function to handle Master Checkbox Click', inject(function ($controller) {
            $controller('GroupList', {
                $scope: mockScope,
                strataService: mockStrataService,
                CaseService: mockCaseService,
                GroupService: mockGroupService,
                SearchBoxService: mockSearchBoxService
            });
            expect(mockScope.onMasterCheckboxClicked).toBeDefined();
            mockGroupService.groupsOnScreen = mockStrataDataService.mockGroups;
            mockScope.onMasterCheckboxClicked();
            expect(mockGroupService.groupsOnScreen[0].selected).toBe(false);
        }));
        it('should have a function to handle group select Click', inject(function ($controller) {
            $controller('GroupList', {
                $scope: mockScope,
                strataService: mockStrataService,
                CaseService: mockCaseService,
                GroupService: mockGroupService,
                SearchBoxService: mockSearchBoxService
            });
            expect(mockScope.onGroupSelected).toBeDefined();
            mockGroupService.groupsOnScreen = mockStrataDataService.mockGroups;
            mockScope.onGroupSelected();
            expect(mockGroupService.disableDeleteGroup).toBe(false);
        }));
    });

    //Suite for StatusSelect
    describe('StatusSelect', function () {
        it('should have status of cases as open', inject(function ($controller) {
            $controller('StatusSelect', {
                $scope: mockScope,
                CaseService: mockCaseService,
                STATUS: mockStrataDataService.mockStatus
            });
            expect(mockScope.STATUS).toEqual(mockStrataDataService.mockStatus);
            expect(mockScope.statuses[0].name).toEqual('Open and Closed');
            expect(mockScope.statuses[1].name).toEqual('Open');
            expect(mockScope.statuses[2].name).toEqual('Closed');
        }));
    });

    //Suite for DiscussionSection
    describe('DiscussionSection', function () {
        it('should have a maxNotesCharacterCheck function', inject(function ($controller) {
            $controller('DiscussionSection', {
                $scope: mockScope,
                strataService: mockStrataService,
                CaseService: mockCaseService,
                AttachmentsService: mockAttachmentsService
            });
            mockCaseService.kase.notes="this is a test note";
            expect(mockScope.maxNotesCharacterCheck).toBeDefined();
            mockScope.maxNotesCharacterCheck();
            mockScope.$root.$digest();
            expect(mockScope.noteCharactersLeft).toEqual(236);
        }));
        it('should have a on sort order change function ascending', inject(function ($controller) {
            $controller('DiscussionSection', {
                $scope: mockScope,
                strataService: mockStrataService,
                CaseService: mockCaseService,
                AttachmentsService: mockAttachmentsService,
                DiscussionService:mockDiscussionService
            });
            mockDiscussionService.commentSortOrder={};
            mockDiscussionService.commentSortOrder.sortOrder="ASC";
            expect(mockScope.onSortOrderChange).toBeDefined();
            mockScope.onSortOrderChange();
            mockScope.$root.$digest();
            expect(mockScope.commentSortOrder).toBe(false);
        }));
        it('should have a on sort order change function descending', inject(function ($controller) {
            $controller('DiscussionSection', {
                $scope: mockScope,
                strataService: mockStrataService,
                CaseService: mockCaseService,
                AttachmentsService: mockAttachmentsService,
                DiscussionService:mockDiscussionService
            });
            mockDiscussionService.commentSortOrder={};
            mockDiscussionService.commentSortOrder.sortOrder="DESC";
            expect(mockScope.onSortOrderChange).toBeDefined();
            mockScope.onSortOrderChange();
            mockScope.$root.$digest();
            expect(mockScope.commentSortOrder).toBe(true);
        }));
        it('should have a function to toggle bugzillas', inject(function ($controller) {
            $controller('DiscussionSection', {
                $scope: mockScope,
                strataService: mockStrataService,
                CaseService: mockCaseService,
                AttachmentsService: mockAttachmentsService,
                DiscussionService:mockDiscussionService
            });
            expect(mockScope.toggleBugzillas).toBeDefined();
            mockScope.toggleBugzillas();
            expect(mockScope.discussion).toBe(false);
            expect(mockScope.attachments).toBe(false);
            expect(mockScope.notes).toBe(false);
            expect(mockScope.bugzillas).toBe(true);
        }));
        it('should have a function to toggle notes', inject(function ($controller) {
            $controller('DiscussionSection', {
                $scope: mockScope,
                strataService: mockStrataService,
                CaseService: mockCaseService,
                AttachmentsService: mockAttachmentsService,
                DiscussionService:mockDiscussionService
            });
            expect(mockScope.toggleNotes).toBeDefined();
            mockScope.toggleNotes();
            expect(mockScope.discussion).toBe(false);
            expect(mockScope.attachments).toBe(false);
            expect(mockScope.notes).toBe(true);
            expect(mockScope.bugzillas).toBe(false);
        }));
        it('should have a function to toggle attachments', inject(function ($controller) {
            $controller('DiscussionSection', {
                $scope: mockScope,
                strataService: mockStrataService,
                CaseService: mockCaseService,
                AttachmentsService: mockAttachmentsService,
                DiscussionService:mockDiscussionService
            });
            expect(mockScope.toggleAttachments).toBeDefined();
            mockScope.toggleAttachments();
            expect(mockScope.discussion).toBe(false);
            expect(mockScope.attachments).toBe(true);
            expect(mockScope.notes).toBe(false);
            expect(mockScope.bugzillas).toBe(false);
        }));
        it('should have a function to toggle discussion', inject(function ($controller) {
            $controller('DiscussionSection', {
                $scope: mockScope,
                strataService: mockStrataService,
                CaseService: mockCaseService,
                AttachmentsService: mockAttachmentsService,
                DiscussionService:mockDiscussionService
            });
            expect(mockScope.toggleDiscussion).toBeDefined();
            mockScope.toggleDiscussion();
            expect(mockScope.discussion).toBe(true);
            expect(mockScope.attachments).toBe(false);
            expect(mockScope.notes).toBe(false);
            expect(mockScope.bugzillas).toBe(false);
        }));
        it('should have a function to parse comment html', inject(function ($controller) {
            $controller('DiscussionSection', {
                $scope: mockScope,
                strataService: mockStrataService,
                CaseService: mockCaseService,
                AttachmentsService: mockAttachmentsService,
                DiscussionService:mockDiscussionService,
                $sce:mockStrataDataService.mockSce
            });
            var comment={};
            comment.body="Title";
            expect(mockScope.parseCommentHtml).toBeDefined();
            var parsedHtml= mockScope.parseCommentHtml(comment);
            expect(parsedHtml).toEqual("Title");
        }));
        it('should have a function to discard notes', inject(function ($controller) {
            $controller('DiscussionSection', {
                $scope: mockScope,
                strataService: mockStrataService,
                CaseService: mockCaseService,
                AttachmentsService: mockAttachmentsService,
                DiscussionService:mockDiscussionService
            });
            mockScope.notesForm = {
                $valid: true,
                $setPristine: function () {
                }
            };
            mockCaseService.prestineKase={};
            mockCaseService.prestineKase.notes="test";
            expect(mockScope.discardNotes).toBeDefined();
            mockScope.discardNotes();
            expect(mockCaseService.kase.notes).toEqual("test");
        }));



    });


    //Suite for AccountSelect
    describe('AccountSelect', function () {
        it('should have a function to fetch user account number resolved', inject(function ($controller) {
            $controller('AccountSelect', {
                $scope: mockScope,
                strataService: mockStrataService,
                AlertService: mockAlertService,
                CaseService: mockCaseService
            });
            expect(mockScope.selectUserAccount).toBeDefined();
            mockScope.selectUserAccount();
            spyOn(mockStrataService.accounts, 'list').and.callThrough();
            mockScope.$root.$digest();
            expect(mockScope.loadingAccountNumber).toEqual(false);
            expect(mockCaseService.account.number).toEqual(mockStrataDataService.mockAccount[0].number);
        }));
        it('should have a function to fetch user account number rejected', inject(function ($controller) {

            $controller('AccountSelect', {
                $scope: mockScope,
                strataService: mockStrataService,
                AlertService: mockAlertService,
                CaseService: mockCaseService
            });
            expect(mockScope.selectUserAccount).toBeDefined();
            mockStrataService.rejectCalls();
            spyOn(mockStrataService.accounts, 'list').and.callThrough();
            mockScope.selectUserAccount();
            mockScope.$root.$digest();
            expect(mockScope.loadingAccountNumber).toEqual(false);
            expect(mockCaseService.account.number).toBeUndefined();
            expect(mockAlertService.alerts[0].message).toEqual('strata error');
        }));
        it('should have a function to populate account specific fields', inject(function ($controller) {
            $controller('AccountSelect', {
                $scope: mockScope,
                strataService: mockStrataService,
                AlertService: mockAlertService,
                CaseService: mockCaseService
            });
            expect(mockScope.populateAccountSpecificFields).toBeDefined();
            mockScope.alertInstance = 'Account found';
            mockScope.populateAccountSpecificFields();
            spyOn(mockStrataService.accounts, 'get').and.callThrough();
            mockScope.$root.$digest();
            expect(mockCaseService.users).toEqual([]);
        }));
        it('should have a function to populate account specific fields rejected', inject(function ($controller) {
            mockStrataService.rejectCalls();
            $controller('AccountSelect', {
                $scope: mockScope,
                strataService: mockStrataService,
                AlertService: mockAlertService,
                CaseService: mockCaseService
            });
            expect(mockScope.populateAccountSpecificFields).toBeDefined();
            mockCaseService.account.number="123";
            mockScope.alertInstance = 'Account found';
            mockScope.populateAccountSpecificFields();

            spyOn(mockStrataService.accounts, 'get').and.callThrough();
            mockScope.$root.$digest();
            expect(mockCaseService.users).toEqual([]);
        }));
    });


    //Suite for TypeSelect
    describe('TypeSelect', function () {
        it('should load all the case types resolved', inject(function ($controller) {
            $controller('TypeSelect', {
                $scope: mockScope,
                strataService: mockStrataService,
                AlertService: mockAlertService,
                CaseService: mockCaseService
            });
            spyOn(mockStrataService.values.cases, 'types').and.callThrough();
            mockScope.$root.$digest();
            expect(mockCaseService.types).toEqual(mockStrataDataService.mockTypes);
        }));
        it('should load all the case types resolved rejected', inject(function ($controller) {
            mockStrataService.rejectCalls();
            $controller('TypeSelect', {
                $scope: mockScope,
                strataService: mockStrataService,
                AlertService: mockAlertService,
                CaseService: mockCaseService
            });
            spyOn(mockStrataService.values.cases, 'types').and.callThrough();
            mockScope.$root.$digest();
            expect(mockScope.typesLoading).toBe(false);
        }));
    });
    //Suite for Group
    describe('Group', function () {
        it('should have a on change function', inject(function ($controller) {
            $controller('Group', {
                $scope: mockScope,
                GroupService: mockGroupService,
                SearchBoxService: mockSearchBoxService
            });
            expect(mockScope.onChange).toBeDefined();
            mockScope.onChange();
            //nothing to expect as this just calls a mock service
        }));
        it('should have a on key press function', inject(function ($controller) {
            $controller('Group', {
                $scope: mockScope,
                GroupService: mockGroupService,
                SearchBoxService:searchBoxService
            });
            expect(searchBoxService.onKeyPress).toBeDefined();
            searchBoxService.onKeyPress();
            //nothing to expect as this just calls a mock service
        }));
        it('should have a default case group function', inject(function ($controller) {
            $controller('Group', {
                $scope: mockScope,
                GroupService: mockGroupService,
                SearchBoxService: mockSearchBoxService,
                $location:mockStrataDataService.mockLocation
            });
            expect(mockScope.defaultCaseGroup).toBeDefined();
            mockScope.defaultCaseGroup();
            //nothing to expect as this just calls a mock service
        }));
    });

    //Suite for List
    describe('List', function () {
        it('should have a function to handle login success event', inject(function ($controller) {
            $controller('List', {
                $scope: mockScope,
                SearchCaseService: mockSearchCaseService,
                CaseService: mockCaseService,
                AlertService: mockAlertService,
                SearchBoxService: mockSearchBoxService
            });
            mockSearchCaseService.cases = mockStrataDataService.mockCases;
            securityService.loginStatus.userAllowedToManageCases = true;
            rootScope.$broadcast('auth-login-success');
            spyOn(mockSearchBoxService, 'doSearch');
            mockScope.$root.$digest();
        }));
        it('should have a function for get cases text for closed support cases', inject(function ($controller) {
            $controller('List', {
                $scope: mockScope,
                SearchCaseService: mockSearchCaseService,
                CaseService: mockCaseService,
                AlertService: mockAlertService,
                SearchBoxService: mockSearchBoxService
            });
            mockSearchCaseService.searchParameters.caseStatus="closed";
            expect(mockScope.getCasesText).toBeDefined();
            mockScope.getCasesText();
            expect(mockScope.displayedCaseText).toEqual("Closed Support Cases");
        }));
        it('should have a function for get cases text for both support cases', inject(function ($controller) {
            $controller('List', {
                $scope: mockScope,
                SearchCaseService: mockSearchCaseService,
                CaseService: mockCaseService,
                AlertService: mockAlertService,
                SearchBoxService: mockSearchBoxService
            });
            mockSearchCaseService.searchParameters.caseStatus="both";
            expect(mockScope.getCasesText).toBeDefined();
            mockScope.getCasesText();
            expect(mockScope.displayedCaseText).toEqual("Open and Closed Support Cases");
        }));
        it('should have a function for export', inject(function ($controller) {
            $controller('List', {
                $scope: mockScope,
                SearchCaseService: mockSearchCaseService,
                CaseService: mockCaseService,
                AlertService: mockAlertService,
                SearchBoxService: mockSearchBoxService
            });
            expect(mockScope.exports).toBeDefined();
            //mockScope.exports();
            //spyOn(mockStrataService.cases, 'csv').and.callThrough();
            //mockScope.$root.$digest();
            //expect(mockScope.exporting).toBe(false);
        }));
        xit('should have a function for case chosen', inject(function ($controller) {
            $controller('List', {
                $scope: mockScope,
                SearchCaseService: mockSearchCaseService,
                CaseService: mockCaseService,
                AlertService: mockAlertService,
                SearchBoxService: mockSearchBoxService,
                $filter:mockStrataDataService.mockFilter
            });
            expect(mockScope.caseChosen).toBeDefined();
            mockScope.caseChosen();
           // expect(mockScope.exporting).toBe(false);
        }));
        it('should have a function for case closure', inject(function ($controller) {
            $controller('List', {
                $scope: mockScope,
                SearchCaseService: mockSearchCaseService,
                CaseService: mockCaseService,
                AlertService: mockAlertService,
                SearchBoxService: mockSearchBoxService,
                $uibModal:mockStrataDataService.mockModal
            });
            expect(mockScope.closeCases).toBeDefined();
            mockScope.closeCases();
            // nothing to expect
        }));
    });

    //Suite for ListFilter
    describe('ListFilter', function () {
        it('should default case filter status to OPEN', inject(function ($controller) {
            $controller('ListFilter', {
                $scope: mockScope,
                STATUS: mockStrataDataService.mockStatus,
                CaseService: mockCaseService
            });
            expect(mockCaseService.status).toEqual(mockStrataDataService.mockStatus.open);
        }));
        it('should have a function for set search options with groups length 0', inject(function ($controller) {
            $controller('ListFilter', {
                $scope: mockScope,
                STATUS: mockStrataDataService.mockStatus,
                CaseService: mockCaseService
            });
            expect(mockScope.setSearchOptions).toBeDefined();
            mockCaseService.groups=[];
            mockScope.setSearchOptions(true);
            spyOn(mockCaseService, 'populateGroups').and.callThrough();
            mockScope.$root.$digest();
            //nothing  to expect as this calls a service

        }));

        it('should have a function for set search options with groups length greater than 0', inject(function ($controller) {
            $controller('ListFilter', {
                $scope: mockScope,
                STATUS: mockStrataDataService.mockStatus,
                CaseService: mockCaseService
            });
            expect(mockScope.setSearchOptions).toBeDefined();
            mockCaseService.groups=[1,2];
            mockScope.setSearchOptions(true);
            spyOn(mockCaseService, 'populateGroups').and.callThrough();
            mockScope.$root.$digest();
            //nothing  to expect as this calls a service

        }));});

    //Suite for CreateGroupButton
    describe('CreateGroupButton', function () {
        var mockModal = jasmine.createSpyObj('modal', ['open']);
        it('should have a function to open Create Group Dialog', inject(function ($controller) {
            $controller('CreateGroupButton', {
                $scope: mockScope,
                $uibModal: mockModal
            });
            expect(mockScope.openCreateGroupDialog).toBeDefined();
            mockScope.openCreateGroupDialog();
        }));
    });
    //Suite for DescriptionSection
    describe('DescriptionSection', function () {
        var mockModal = jasmine.createSpyObj('modal', ['open']);
        it('should have a function for update case', inject(function ($controller) {
            $controller('DescriptionSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                $uibModal:mockModal
            });
            expect(mockScope.updateCase).toBeDefined();
            mockCaseService.kase.status = { name: 'Closed' };
            mockScope.updateCase();
            //nothing to expect as it just opens a modal
        }));
        it('should have a function for update severity', inject(function ($controller) {
            $controller('DescriptionSection', {
                $scope: mockScope,
                CaseService: mockCaseService,
                $uibModal:mockModal
            });
            expect(mockScope.updateSeverity).toBeDefined();
            mockCaseService.kase.severity = { name: 'HIGH' };
            mockScope.updateSeverity();
            //nothing to expect as it just opens a modal
        }));
    });
    //Suite for BackEndAttachmentsCtrl
    describe('BackEndAttachmentsCtrl', function () {
        it('should have a function for backend attachements control', inject(function ($controller) {
            $controller('BackEndAttachmentsCtrl', {
                $scope: mockScope,
                AttachmentsService: mockAttachmentsService,
                NEW_CASE_CONFIG: mockStrataDataService.value,
                EDIT_CASE_CONFIG: mockStrataDataService.value,
                TreeViewSelectorData: mockTreeViewSelectorData
            });
            spyOn(mockTreeViewSelectorData, 'getTree');
            mockScope.$root.$digest();
            expect(mockAttachmentsService.backendAttachments).toEqual(mockStrataDataService.mockAttachments);
            expect(mockScope.attachmentTree).toEqual(mockStrataDataService.mockAttachments);
        }));
    });

    //Suite for VersionSelect
    describe('VersionSelect', function () {
        it('should have a controller for version select', inject(function ($controller) {
            $controller('VersionSelect', {
                $scope: mockScope,
                SearchCaseService: mockSearchCaseService,
                CaseService: mockCaseService,
                ProductsService:mockProductsService ,
                RecommendationsService:mockRecommendationsService
            });
            expect(mockScope.SearchCaseService).toEqual(mockSearchCaseService);
            expect(mockScope.CaseService).toEqual(mockCaseService);
            expect(mockScope.ProductsService).toEqual(mockProductsService);
            expect(mockScope.RecommendationsService).toEqual(mockRecommendationsService);

        }));
    });

    //Suite for SeveritySelect
    describe('SeveritySelect', function () {
        xit('should have a controller for severity select', inject(function ($controller) {
            mockScope.severities = [{name: "1"}, {name: "2"}];
            $controller('SeveritySelect', {
                $scope: mockScope
            });
            var event = {
                stopPropagation: function () {}
            };
            expect(mockScope.openedDetails).toBeDefined();
            expect(mockScope.openedDetails["1"]).toEqual(false);
            expect(mockScope.openedDetails["2"]).toEqual(false);
            expect(mockScope.toggleDetails).toBeDefined();
            mockScope.toggleDetails(mockScope.severities[0], event);
            expect(mockScope.openedDetails["1"]).toEqual(true);
            expect(mockScope.openedDetails["2"]).toEqual(false);
            mockScope.toggleDetails(mockScope.severities[1], event);
            expect(mockScope.openedDetails["1"]).toEqual(true);
            expect(mockScope.openedDetails["2"]).toEqual(true);
        }));
    });

    //Suite for ProductSelect
    describe('ProductSelect', function () {
        it('should have a controller for product select', inject(function ($controller) {
            $controller('ProductSelect', {
                $scope: mockScope,
                SearchCaseService: mockSearchCaseService,
                CaseService: mockCaseService,
                ProductsService:mockProductsService ,
                RecommendationsService:mockRecommendationsService
            });
            expect(mockScope.SearchCaseService).toEqual(mockSearchCaseService);
            expect(mockScope.CaseService).toEqual(mockCaseService);
            expect(mockScope.ProductsService).toEqual(mockProductsService);
            expect(mockScope.RecommendationsService).toEqual(mockRecommendationsService);
        }));
    });

    //Suite for OwnerSelect
    describe('OwnerSelect', function () {
        it('should have a controller for owner select', inject(function ($controller) {
            $controller('OwnerSelect', {
                $scope: mockScope,
                SearchCaseService: mockSearchCaseService,
                CaseService: mockCaseService
            });
            expect(mockScope.CaseService).toEqual(mockCaseService);
            expect(mockScope.SearchCaseService).toEqual(mockSearchCaseService);

        }));
    });

    //Suite for NewCaseRecommendationsController
    describe('NewCaseRecommendationsController', function () {
        it('should have a function for select page', inject(function ($controller) {
            $controller('NewCaseRecommendationsController', {
                $scope: mockScope,
                SearchCaseService: mockSearchCaseService,
                CaseService: mockCaseService,
                SearchResultsService:mockSearchResultsService,
                RecommendationsService:mockRecommendationsService
            });
            mockScope.itemsPerPage=2;
            mockRecommendationsService.recommendations=mockStrataDataService.mockRecommendations;
            expect(mockScope.selectPage).toBeDefined();
            mockScope.selectPage(1);
            mockScope.$root.$digest();
            expect(mockScope.currentPage).toEqual(1);
            expect(mockScope.results.length).toEqual(2);
        }));

        it('should have a function for find last page', inject(function ($controller) {
            $controller('NewCaseRecommendationsController', {
                $scope: mockScope,
                SearchCaseService: mockSearchCaseService,
                CaseService: mockCaseService,
                SearchResultsService:mockSearchResultsService,
                RecommendationsService:mockRecommendationsService
            });
            mockScope.itemsPerPage=2;
            mockRecommendationsService.recommendations=mockStrataDataService.mockRecommendations;
            expect(mockScope.findLastPage).toBeDefined();
            mockScope.findLastPage();
            mockScope.$root.$digest();
            expect(mockScope.lastPage).toEqual(1);

        }));
    });
    //Suite for GroupSelect
    describe('GroupSelect', function () {
        it('should have a function for setSearchOptions in groupSelect', inject(function ($controller) {
            $controller('GroupSelect', {
                $scope: mockScope,
                SearchCaseService: mockSearchCaseService,
                CaseService: mockCaseService
            });
            expect(mockScope.setSearchOptions).toBeDefined();
            mockCaseService.groups=mockStrataDataService.mockGroups;
            mockScope.setSearchOptions(true);
            expect(mockCaseService.showsearchoptions).toBe(true);
            expect(mockCaseService.kase.group.number).toEqual('49496');
        }));
    });

    //Suite for FilterSelect
    describe('FilterSelect', function () {
        it('should have a controller for filter select', inject(function ($controller) {
            $controller('FilterSelect', {
                $scope: mockScope,
                CaseService: mockCaseService,
                ConstantsService:constantsService
            });
            expect(mockScope.init).toBeDefined();
            mockCaseService.localStorageCache=undefined;
            mockScope.init();
            var sortParams= {
                    name: 'Newest Date Modified',
                    sortField: 'lastModifiedDate',
                    sortOrder: 'DESC'
                };

            expect(mockCaseService.filterSelect).toEqual(sortParams);
        }));
    });

    //Suite for RequestEscalation
    describe('RequestEscalation', function () {
        it('should have a function to do requestManagementEscalation', inject(function ($controller) {
            $controller('RequestEscalation', {
                $scope: mockScope,
                $uibModal:mockStrataDataService.mockModal
            });
            expect(mockScope.requestManagementEscalation).toBeDefined();
            mockScope.requestManagementEscalation();
        }));
    });

    //Suite for CommonConfirmationModal
    describe('CommonConfirmationModal', function () {
        it('should have a function for confirming status/severity change', inject(function ($controller) {
            $controller('CommonConfirmationModal', {
                $scope: mockScope,
                $uibModalInstance:mockStrataDataService.mockModalInstance,
                SearchCaseService: mockSearchCaseService,
                CaseService: mockCaseService
            });
            expect(mockScope.confirm).toBeDefined();
            mockCaseService.confirmationModal = 'case-status-change';
            spyOn(mockCaseService, 'updateCase').and.callThrough();
            mockScope.confirm();
            mockScope.$root.$digest();
            expect(mockCaseService.updatingCase).toBe(false);
        }));
        it('should have a function for closing cases confirmation', inject(function ($controller) {
            $controller('CommonConfirmationModal', {
                $scope: mockScope,
                $uibModalInstance:mockStrataDataService.mockModalInstance,
                SearchCaseService: mockSearchCaseService,
                CaseService: mockCaseService
            });
            expect(mockScope.confirm).toBeDefined();
            mockCaseService.confirmationModal = 'case-close';
            spyOn(mockStrataService.cases, 'put').and.callThrough();
            mockScope.confirm();
            mockScope.$root.$digest();
            expect(mockSearchCaseService.refreshFilterCache).toBe(true);
        }));
        it('should have a function for closing modal after status change', inject(function ($controller) {
            $controller('CommonConfirmationModal', {
                $scope: mockScope,
                $uibModalInstance:mockStrataDataService.mockModalInstance,
                SearchCaseService: mockSearchCaseService,
                CaseService: mockCaseService
            });
            expect(mockScope.closeModal).toBeDefined();
            mockCaseService.confirmationModal = 'case-status-change';
            mockCaseService.prestineKase={};
            mockCaseService.prestineKase.status="Waiting on Red Hat";
            mockCaseService.kase.status = "Waiting on Customer"
            expect(mockScope.closeModal).toBeDefined();
            mockScope.closeModal();
            expect(mockCaseService.kase.status).toEqual("Waiting on Red Hat");
        }));
        it('should have a function for closing modal after severity change', inject(function ($controller) {
            $controller('CommonConfirmationModal', {
                $scope: mockScope,
                $uibModalInstance:mockStrataDataService.mockModalInstance,
                SearchCaseService: mockSearchCaseService,
                CaseService: mockCaseService
            });
            expect(mockScope.closeModal).toBeDefined();
            mockCaseService.confirmationModal = 'case-severity-change';
            mockCaseService.prestineKase={};
            mockCaseService.prestineKase.severity="4 (Low)";
            mockCaseService.kase.severity = "1 (High)"
            expect(mockScope.closeModal).toBeDefined();
            mockScope.closeModal();
            expect(mockCaseService.kase.severity).toEqual("4 (Low)");
        }));
    });

    //Suite for ProceedWithoutAttachModal
    describe('ProceedWithoutAttachModal', function () {
        it('should have a function for close Modal', inject(function ($controller) {
            $controller('ProceedWithoutAttachModal', {
                $scope: mockScope,
                $uibModalInstance:mockStrataDataService.mockModalInstance,
                AttachmentsService: mockAttachmentsService,
                RHAUtils: rhaUtils
            });
            expect(mockScope.closeModal).toBeDefined();
            mockScope.closeModal(true);
            expect(mockAttachmentsService.proceedWithoutAttachments).toBe(true);
        }));
        it('should have a function for parsing artifact html', inject(function ($controller) {
            $controller('ProceedWithoutAttachModal', {
                $scope: mockScope,
                $uibModalInstance:mockStrataDataService.mockModalInstance,
                AttachmentsService: mockAttachmentsService,
                RHAUtils: rhaUtils,
                $sce:mockStrataDataService.mockSce
            });
            expect(mockScope.parseArtifactHtml).toBeDefined();
            var html="<b>Test</b>";
            mockAttachmentsService.suggestedArtifact={};
            mockAttachmentsService.suggestedArtifact.description=html;
            var resultHtml=mockScope.parseArtifactHtml(true);
            mockScope.$root.$digest();
            expect(resultHtml).toEqual(html);
        }));
    });

    //Suite for RequestManagementEscalationModal
    describe('RequestManagementEscalationModal', function () {
        xit('should have a function for new escalation comment with escalation comment text empty ', inject(function ($controller) {
            $controller('RequestManagementEscalationModal', {
                $scope: mockScope,
                $uibModalInstance:mockStrataDataService.mockModalInstance,
                CaseService: mockCaseService,
                RHAUtils:rhaUtils,
                strataService:mockStrataService
            });
            mockScope.submittingRequest=true;
            mockCaseService.commentText="Test";
            expect(mockScope.onNewEscalationComment).toBeDefined();
            mockScope.onNewEscalationComment();
            expect(mockScope.disableSubmitRequest).toBe(true);

        }));
        xit('should have a function for onNewEscalationComment with escalation comment text non empty ', inject(function ($controller) {
            $controller('RequestManagementEscalationModal', {
                $scope: mockScope,
                $uibModalInstance:mockStrataDataService.mockModalInstance,
                CaseService: mockCaseService,
                RHAUtils:rhaUtils,
                strataService:mockStrataService
            });
            mockCaseService.escalationCommentText='escalation comment';
            expect(mockScope.onNewEscalationComment).toBeDefined();
            mockScope.onNewEscalationComment();
            expect(mockScope.disableSubmitRequest).toBe(false);
        }));
        it('should have a function for close modal ', inject(function ($controller) {
            $controller('RequestManagementEscalationModal', {
                $scope: mockScope,
                $uibModalInstance:mockStrataDataService.mockModalInstance,
                CaseService: mockCaseService,
                RHAUtils:rhaUtils,
                strataService:mockStrataService
            });
            mockCaseService.escalationCommentText="test";
            expect(mockScope.closeModal).toBeDefined();
            mockScope.closeModal();
            expect(mockCaseService.escalationCommentText).toBeUndefined();
        }));

    });
});
