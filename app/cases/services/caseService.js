'use strict';

import _ from 'lodash';
import hydrajs from '../../shared/hydrajs.js';
import { getTnCUrl } from '../../shared/TnC';

export default class CaseService {
    constructor(strataService, AlertService, RHAUtils, securityService, $q, gettextCatalog, CacheFactory, $rootScope, CASE_EVENTS, ConstantsService, HeaderService, $location, ConfigService) {
        'ngInject';

        this.localStorageCache = CacheFactory.get('localStorageCache');
        if (RHAUtils.isEmpty(this.localStorageCache)) {
            this.localStorageCache = CacheFactory('localStorageCache', {
                storageMode: 'localStorage',
                verifyIntegrity: true
            })
        }
        this.sessionStorageCache = CacheFactory.get('sessionStorageCache');
        if (RHAUtils.isEmpty(this.sessionStorageCache)) {
            this.sessionStorageCache = CacheFactory('sessionStorageCache', {
                storageMode: 'sessionStorage',
                verifyIntegrity: true
            })
        }
        this.updatingCase = false;
        this.submittingCase = false;
        this.kase = {};
        this.loadingCase = false;
        this.prestineKase = {};
        this.caseDataReady = false;
        this.isCommentPublic = true;
        this.loadingAccountNumber = false;
        this.requiredCaseGroup = false;
        this.versions = [];
        this.products = [];
        this.severities = [];
        this.groups = [];
        this.users = [];
        this.comments = [];
        this.externalUpdates = [];
        this.originalNotifiedUsers = [];
        this.internalNotificationContacts = [];
        this.account = {};
        this.draftComment = {};
        this.draftCommentOnServerExists = false;
        this.commentText = '';
        this.commentReplyText = '';
        this.escalationCommentText = '';
        this.escalationSubject = '';
        this.escalationDescription = '';
        this.escalationExpectations = '';
        this.rmeEscalationGeo = '';
        this.status = '';
        this.severity = '';
        this.type = '';
        this.group = '';
        this.owner = '';
        this.product = '';
        this.isOpenShiftOnlineProduct = false;
        this.bugzillaList = {};
        this.entitlement = '';
        this.updatingNewCaseSummary = false;
        this.updatingNewCaseDescription = false;
        // Added common modal variables for Status/Severity/CaseClose confirmation
        this.cepModalEvent = '';
        this.isNewPageCEP = false;
        this.newPageCEPComment = '';
        this.confirmationModal = '';
        this.confirmationModalHeader = '';
        this.confirmationModalMessage = '';
        this.confirmationModalProperty = '';
        this.sfdcIsHealthy = HeaderService.sfdcIsHealthy;
        this.creationStartedEventSent = false;
        this.showKTFields = true;
        this.redhatUsersLoading = false;
        this.redhatSecureSupportUsersLoading = false;
        this.submittingCep = false;
        this.solutionEngineProduct = '';
        this.redhatUsers = [];
        this.partners = [];
        this.loadingPartners = false;
        this.eligiblePartnersToShareCase = [];
        this.savedPartners = [];
        this.redhatSecureSupportUsers = [];
        this.managedAccount = null;
        this.externalCaseCreateKey;
        this.loggedInAccountUsers = [];
        this.managedAccountUsers = [];
        this.caseRMEEscalation = [];
        this.hydraCaseDetail = {};
        this.internalStatuses = [
            "Unassigned",
            "Waiting on Customer",
            "Waiting on Collaboration",
            "Waiting on Contributor",
            "Waiting on Engineering",
            "Waiting on PM",
            "Waiting on Sales",
            "Waiting on QA",
            "Waiting on Owner",
            "Waiting on 3rd Party Vendor",
            "Waiting on Collaboration - Native",
            "Waiting on Translation",
            "Closed"
        ];

        this.sbrList = [
            "API Mgmt",
            "Anaconda",
            "Ansible",
            "Business Rule Frameworks",
            "CEE Ops",
            "CFME",
            "Ceph",
            "Certification",
            "Clusterha",
            "Containers",
            "Customer Portal",
            "Desktop",
            "Filesystem",
            "FuseSource",
            "Gluster",
            "Identity Management",
            "JBDS",
            "JBoss Base AS",
            "JBoss Clustering",
            "JBoss Portal",
            "JBoss Security",
            "JON",
            "JVM & Diagnostics",
            "Kernel",
            "Low Volume",
            "MRG",
            "Messaging",
            "Networking",
            "Non-Technical",
            "OpenShift Online",
            "RHN",
            "ROLE",
            "Red Hat Mobile",
            "Red Hat Mobile - Consulting",
            "SAP",
            "Security Vulnerabilities",
            "Services",
            "Shells",
            "Shift",
            "Spinalstack",
            "Stack",
            "Storage",
            "SysMgmt",
            "Teiid/MMX",
            "Tools",
            "Transactions & JCA & SQL",
            "Virtualization",
            "Web Services",
            "Webservers"
        ];
        this.TnCUrl = getTnCUrl();

        // pcm-5478 : only the below products would see premium plus entitlements if account has this entitlement
        this.premiumPlusProducts = [
            'Red Hat Virtualization',
            'Red Hat Insights',
            'Red Hat Satellite or Proxy',
            'Red Hat Cluster Suite',
            'Red Hat Enterprise IPA',
            'Red Hat Enterprise Linux'
        ];

        this.isLoadingRHUsers = false;
        this.noResultsForRHUsersSearch = false;

        // Add a custom email address to a case's notifications
        this.customNotificationEmails = [];
        this.newCustomEmail = '';
        this.loadingCustomNotificationEmails = false;
        this.isLinkedEmail = () => this.customNotificationEmails.find((email) => email.emailAddress === this.newCustomEmail);
        this.onChangeCustomEmail = () => {
            const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            this.isValidCustomEmail = this.newCustomEmail.match(mailformat);
        };

        this.getCustomNotificationEmails = async () => {
            try {
                this.loadingCustomNotificationEmails = true;
                const response = await hydrajs.kase.getCustomEmailsFromCase(this.kase.case_number);
                this.customNotificationEmails = response.caseNotificationAddresses;
                this.loadingCustomNotificationEmails = false;
            } catch (error) {
                this.loadingCustomNotificationEmails = false;
                this.customNotificationEmails = [];
                AlertService.addDangerMessage(gettextCatalog.getString('Could not fetch custom notification emails'));
            }
        };

        this.postCustomNotificationEmail = async () => {
            try {
                this.loadingCustomNotificationEmails = true;
                await hydrajs.kase.addCustomEmailToCase(this.kase.account_number, this.kase.case_number, this.newCustomEmail);
                this.customNotificationEmails.push({ emailAddress: this.newCustomEmail, caseNumber: this.kase.case_number });
                this.newCustomEmail = '';
                this.loadingCustomNotificationEmails = false;
            } catch (error) {
                this.loadingCustomNotificationEmails = false;
                AlertService.addDangerMessage(gettextCatalog.getString('Could not post custom email {{email}}', {
                    email: this.newCustomEmail
                }));
                this.newCustomEmail = '';
            }
        };

        this.removeCustomNotificationEmail = async (emailToDelete) => {
            try {
                this.loadingCustomNotificationEmails = true;
                await hydrajs.kase.deleteCustomEmailFromCase(this.kase.case_number, emailToDelete.emailAddress);
                this.customNotificationEmails = this.customNotificationEmails.filter((email) => email !== emailToDelete);
                this.loadingCustomNotificationEmails = false;
            } catch (error) {
                this.loadingCustomNotificationEmails = false;
                AlertService.addDangerMessage(gettextCatalog.getString('Could not delete custom email {{email}}', {
                    email: emailToDelete.emailAddress
                }));
            }
        };

        this.setSeverities = function (severities) {
            this.severities = severities;
            angular.forEach(this.severities, function (severity) {
                severity.responseTimes = {};
                if (severity.name === '1 (Urgent)') {
                    severity.responseTimes.standard = gettextCatalog.getString('{{hours}} business hour', { hours: 1 });
                    severity.responseTimes.premium = gettextCatalog.getString('{{hours}} hour', { hours: 1 });
                    severity.details = gettextCatalog.getString('A problem that severely impacts your use of the software in a production environment ' +
                        '(such as loss of production data or in which your production systems are not functioning). ' +
                        'The situation halts your business operations and no procedural workaround exists.');
                } else if (severity.name === '2 (High)') {
                    severity.responseTimes.standard = gettextCatalog.getString('{{hours}} business hours', { hours: 4 });
                    severity.responseTimes.premium = gettextCatalog.getString('{{hours}} hours', { hours: 2 });
                    severity.details = gettextCatalog.getString('A problem where the software is functioning but your use in a production environment ' +
                        'is severely reduced. The situation is causing a high impact to portions of your business ' +
                        'operations and no procedural workaround exists.');
                } else if (severity.name === '3 (Normal)') {
                    severity.responseTimes.standard = gettextCatalog.getString('{{days}} business day', { days: 1 });
                    severity.responseTimes.premium = gettextCatalog.getString('{{hours}} business hours', { hours: 4 });
                    severity.details = gettextCatalog.getString('A problem that involves partial, non-critical loss of use of the software in ' +
                        'a production environment or development environment. For production environments, there is a ' +
                        'medium-to-low impact on your business, but your business continues to function, including by ' +
                        'using a procedural workaround. For development environments, where the situation is causing ' +
                        'your project to no longer continue or migrate into production.');
                } else if (severity.name === '4 (Low)') {
                    severity.responseTimes.standard = gettextCatalog.getString('{{days}} business days', { days: 2 });
                    severity.responseTimes.premium = gettextCatalog.getString('{{hours}} business hours', { hours: 8 });
                    severity.details = gettextCatalog.getString('A general usage question, reporting of a documentation error, or recommendation ' +
                        'for a future product enhancement or modification. For production environments, there is ' +
                        'low-to-no impact on your business or the performance or functionality of your system. For ' +
                        'development environments, there is a medium-to-low impact on your business, but your business ' +
                        'continues to function, including by using a procedural workaround.');
                }
            });
        };

        this.onFilterSelectChanged = function () {
            if (this.sessionStorageCache) {
                this.sessionStorageCache.put('filterSelect' + securityService.loginStatus.authedUser.sso_username, this.filterSelect);
            }
            $rootScope.$broadcast(CASE_EVENTS.filterChanged);
            $rootScope.$broadcast(CASE_EVENTS.searchSubmit);
        };
        this.onSelectChanged = function () {
            $rootScope.$broadcast(CASE_EVENTS.searchSubmit);
        };
        this.onOwnerSelectChanged = function (ownerSelect = false) {
            if (RHAUtils.isNotEmpty(this.account.number) && RHAUtils.isNotEmpty(this.managedAccountUsers) && !_.includes(_.map(this.managedAccountUsers, 'sso_username'), this.owner)) {
                if (RHAUtils.isNotEmpty(_.first(_.filter(this.managedAccountUsers, (user) => user.org_admin)))) {
                    this.virtualOwner = _.first(_.filter(this.managedAccountUsers, (user) => user.org_admin)).sso_username;
                } else {
                    this.virtualOwner = this.managedAccountUsers[0].sso_username;
                }
            }
            if (ownerSelect) {
                this.solutionEngineProduct = '';
            }
            $rootScope.$broadcast(CASE_EVENTS.ownerChange);
        };
        this.onGroupSelectChanged = function () {
            $rootScope.$broadcast(CASE_EVENTS.searchSubmit);
            this.validateNewCase();
        };
        this.onProductSelectChange = function () {
            $rootScope.$broadcast(CASE_EVENTS.productSelectChange);
        };
        this.onAccountSelectChange = function () {
            $rootScope.$broadcast(CASE_EVENTS.searchSubmit);
        };
        this.groupOptions = [];
        this.showsearchoptions = false;
        this.disableAddComment = true;
        this.fts = false;
        this.fts_contact = '';
        this.draftSaved = false;
        this.sortBy = 'lastModifiedDate';
        this.sortOrder = 'desc';
        this.filterSelect = '';
        this.problemString = gettextCatalog.getString('What problem/issue/behavior are you having trouble with?  What do you expect to see?');
        this.environmentString = gettextCatalog.getString('Where are you experiencing the behavior?  What environment?');
        this.occuranceString = gettextCatalog.getString('When does the behavior occur? Frequently?  Repeatedly?   At certain times?');
        this.urgencyString = gettextCatalog.getString('What information can you provide around timeframes and the business impact?');
        /**
         * Add the necessary wrapper objects needed to properly display the data.
         *
         * @param rawCase
         */
        this.defineCase = function (rawCase) {
            /*jshint camelcase: false */
            rawCase.severity = { 'name': rawCase.severity };
            rawCase.status = { 'name': rawCase.status };
            rawCase.group = { 'number': rawCase.folder_number };
            rawCase.type = { 'name': rawCase.type };
            this.kase = rawCase;
            this.ungroupedCaseModifier();
            angular.copy(this.kase, this.prestineKase);
            this.fetchHydraCaseDetails();
            this.bugzillaList = rawCase.bugzillas;
            this.caseDataReady = true;
            this.onProductSelectChange();
        };
        this.resetCase = function () {
            angular.copy(this.prestineKase, this.kase);
        };
        this.setCase = function (jsonCase) {
            jsonCase.severity = { 'name': jsonCase.severity };
            jsonCase.status = { 'name': jsonCase.status };
            jsonCase.group = { 'number': jsonCase.folder_number };
            jsonCase.type = { 'name': jsonCase.type };
            this.kase = jsonCase;
            this.ungroupedCaseModifier();
            angular.copy(this.kase, this.prestineKase);
            this.bugzillaList = jsonCase.bugzillas;
            this.fetchHydraCaseDetails();
            this.caseDataReady = true;
            this.onProductSelectChange();
        };

        this.fetchHydraCaseDetails = async function () {
            if (securityService.loginStatus.authedUser.is_internal && RHAUtils.isNotEmpty(this.kase) && this.kase.case_number) {
                try {
                    this.hydraCaseDetail = await hydrajs.kase.getCase(this.kase.case_number, hydrajs.fields.getCaseFields({ includeCaseOwner: true }));
                } catch (error) {
                    this.hydraCaseDetail = {};
                }
            }
        }

        //Explicitly assigning group_number = '-1' for ungrouped case when case payload has no group information
        this.ungroupedCaseModifier = function () {
            if (RHAUtils.isEmpty(this.kase.group.number)) {
                this.kase.group = { "number": "-1", "name": "Ungrouped Case", "is_private": false, "is_default": false };
            }
        };

        this.defineAccount = function (account) {
            this.account = account;
        };
        this.defineNotifiedUsers = function () {
            /*jshint camelcase: false */
            if (RHAUtils.isNotEmpty(this.kase.notified_users)) {
                _.each(this.kase.notified_users.link, (user) => {
                    user.sso_username && this.originalNotifiedUsers.push(user.sso_username);
                });
                securityService.loginStatus.authedUser.is_internal && this.setInternalNotificationContacts(this.originalNotifiedUsers);
            }
        };
        this.setInternalNotificationContacts = async (originalNotifiedUsers) => {
            if (originalNotifiedUsers.length > 0) {
                let queryParams = {
                    internal: false, // to get non-ldap contacts
                    isInternalContact: true,
                    ssoUsernameIn: originalNotifiedUsers.join(',')
                }
                try {
                    const response = await hydrajs.contacts.getSFDCContacts(queryParams);
                    this.internalNotificationContacts = (response && response.items && response.items.length) ? response.items : [];
                } catch (e) {
                    console.warn(`Unable to get contacts, error: ${e}`);
                }
            } else {
                this.internalNotificationContacts = [];
            }
        }
        this.getGroups = function () {
            return this.groups;
        };
        this.sbrDiff = function (a, b) {
            if (!a) return b;
            if (!b) return a;
            return _.filter(a, (i) => b.indexOf(i) < 0);
        };
        this.clearCase = function () {
            this.caseDataReady = false;
            this.isCommentPublic = true;
            this.updatingCase = false;
            this.kase = {};
            this.prestineKase = {};
            this.versions = [];
            this.products = [];
            this.statuses = [];
            this.severities = [];
            this.account = {};
            this.comments = [];
            this.bugzillaList = {};
            this.draftComment = undefined;
            this.draftCommentLocalStorage = undefined;
            this.commentText = undefined;
            this.commentReplyText = undefined;
            this.escalationCommentText = undefined;
            this.escalationSubject = undefined;
            this.escalationDescription = undefined;
            this.escalationExpectations = undefined;
            this.rmeEscalationGeo = undefined;
            this.status = undefined;
            this.severity = undefined;
            this.type = undefined;
            this.group = '';
            this.owner = undefined;
            this.product = undefined;
            this.originalNotifiedUsers = [];
            this.groupOptions = [];
            this.fts = false;
            this.fts_contact = '';
            this.entitlement = '';
            this.updatingNewCaseSummary = false;
            this.updatingNewCaseDescription = false;
            this.virtualOwner = undefined;
            this.isOpenShiftOnlineProduct = false;
            this.caseRMEEscalation = [];
            this.hydraCaseDetail = {};
            this.cepModalEvent = '';
            this.isNewPageCEP = false;
            this.newPageCEPComment = '';
            this.solutionEngineProduct = '';
        };
        this.groupsLoading = false;
        this.populateGroups = function (ssoUsername, flushCache) {
            var deferred = $q.defer();
            if (!this.groupsLoading) {
                this.groupsLoading = true;
                var username = ssoUsername;
                if (username === undefined) {
                    this.groups = [];
                    this.buildGroupOptions();
                    this.groupsLoading = false;
                    deferred.resolve(this.groups)
                } else {
                    strataService.groups.list(username, flushCache).then(angular.bind(this, function (groups) {
                        this.groups = groups;
                        if (this.groups.length > 0) {
                            this.group = '';
                        }
                        this.buildGroupOptions(this);
                        this.groupsLoading = false;
                        deferred.resolve(groups);
                    }), angular.bind(this, function (error) {
                        this.groupsLoading = false;
                        AlertService.addStrataErrorMessage(error);
                        deferred.reject();
                    }));
                }
            }
            return deferred.promise;
        };
        this.usersLoading = false;

        this.isManagedAccount = (accountNumber) => {
            if (RHAUtils.isNotEmpty(accountNumber)) {
                if (RHAUtils.isNotEmpty(securityService.loginStatus.authedUser.managedAccounts) &&
                    RHAUtils.isNotEmpty(securityService.loginStatus.authedUser.managedAccounts.accounts) &&
                    _.includes(_.map(securityService.loginStatus.authedUser.managedAccounts.accounts, 'accountNum'), accountNumber)) {
                    return true;
                } else {
                    return false;
                }
            }
            return false;
        };

        this.isAuthedUserAccount = (accountNumber) => {
            if (RHAUtils.isNotEmpty(accountNumber) && securityService.loginStatus.authedUser.account_number == accountNumber) {
                return true;
            }
            return false;
        };

        this.populatePartners = async (caseNumber, caseAccountNumber) => {
            try {
                this.loadingPartners = true;
                const _partners = securityService.loginStatus.authedUser.account.number === caseAccountNumber ? securityService.loginStatus.authedUser.accountManagers : (await strataService.accounts.accountManagers.get(caseAccountNumber));
                const partners = _.get(_partners, 'accounts');
                if (!_.isEmpty(partners)) {
                    const response = await hydrajs.kase.access.getCaseAccessList(caseNumber);
                    const hasAccountLevelAccess = (access) => (access.accessScope === "Account" && access.permission === "Write");
                    const hasCaseLevelAccess = (access) => (access.accessScope === "Case" && access.permission === "Write");

                    const getAccountName = (partnerAccess) => {
                        const account = _.find(partners, (p) => (p.accountNum === partnerAccess.accountNumber));
                        return _.get(account, 'name');
                    }
                    const appendAccountName = (list) => _.map(list, (partnerAccess) => _.merge({}, partnerAccess, { accountName: getAccountName(partnerAccess) }));
                    this.savedPartners = appendAccountName(_.filter(response.accessList, (p) => (hasCaseLevelAccess(p))));
                    const eligiblePartnerAccessList = _.filter(response.accessList, (access) => {
                        return !hasAccountLevelAccess(access) && !hasCaseLevelAccess(access);
                    });
                    this.eligiblePartnersToShareCase = appendAccountName(eligiblePartnerAccessList);
                }
            } catch (e) {
                console.error(e);
            }
            finally {
                this.loadingPartners = false;
            }
        }

        this.savePartnerCaseAccess = async (caseNumber, partnerAccountNumber, confirmationNumber) => {
            this.sharingCaseWithPartner = true;
            const alert = AlertService.addWarningMessage(gettextCatalog.getString(`In progress, sharing case with the partner ${partnerAccountNumber}.`));
            try {
                const body = {
                    access: { permission: 'Write', accountNumber: partnerAccountNumber },
                    confirmationNumber
                }
                await hydrajs.kase.access.patchCaseAccess(caseNumber, body);
                AlertService.addSuccessMessage(gettextCatalog.getString(`Successfully shared case with the partner ${partnerAccountNumber}.`))
            } catch (e) {
                console.error(e);
                AlertService.addDangerMessage(`Problem sharing case with the partner. ${e.message}`);
            }
            AlertService.removeAlert(alert);
            this.sharingCaseWithPartner = false;
        }

        this.getTnCUrl = (selectedPartners) => {
            return getTnCUrl(_.get(selectedPartners, [0, 'accountNumber']));
        }
        /**
         *  Intended to be called only after user is logged in and has account details
         *  See securityService.
         */
        this.populateUsers = () => {
            if (securityService.loginStatus.authedUser.org_admin || securityService.loginStatus.authedUser.is_internal || (RHAUtils.isNotEmpty(this.account.number) && this.isManagedAccount(this.account.number))) {
                this.usersLoading = true;
                var accountNumber;
                if (this.kase.account_number) {
                    accountNumber = this.kase.account_number;
                } else if (RHAUtils.isNotEmpty(this.account.number)) {
                    accountNumber = this.account.number;
                } else if (RHAUtils.isNotEmpty(securityService.loginStatus.authedUser.account_number)) {
                    accountNumber = securityService.loginStatus.authedUser.account_number;
                } else {
                    accountNumber = securityService.loginStatus.authedUser.account.number;
                }
                if (RHAUtils.isNotEmpty(accountNumber)) {
                    const previousOwner = this.owner;
                    this.owner = undefined;
                    return strataService.accounts.users(accountNumber).then((users) => {
                        _.each(users, (user) => {
                            if (user.sso_username === securityService.loginStatus.authedUser.sso_username) {
                                this.owner = user.sso_username;
                            }
                        });

                        if (this.owner && previousOwner && this.owner !== previousOwner) {
                            this.onOwnerSelectChanged();
                        }

                        //PCM-1520 Case insensitive sorting on sso_username
                        users.sort(function (a, b) {
                            var userA = a.sso_username.toUpperCase();
                            var userB = b.sso_username.toUpperCase();
                            return (userA < userB) ? -1 : (userA > userB) ? 1 : 0;
                        });
                        this.usersLoading = false;
                        this.users = users;

                        if (this.isAuthedUserAccount(accountNumber)) {
                            this.loggedInAccountUsers = users;
                        }
                        if (this.isManagedAccount(accountNumber)) {
                            this.managedAccountUsers = users;
                            this.users = _.concat(this.managedAccountUsers, this.loggedInAccountUsers);
                        }
                    }, (error) => {
                        this.users = [];
                        this.usersLoading = false;
                        if (error && error.xhr.status === 502) {
                            AlertService.addDangerMessage(gettextCatalog.getString('Error: No contacts available for the selected account.'));
                        } else {
                            AlertService.addStrataErrorMessage(error);
                        }
                    });
                } else {
                    const deferred = $q.defer();
                    deferred.resolve();
                    return deferred.promise;

                }
            } else {
                const loggedInUser = _.pick(securityService.loginStatus.authedUser, ['sso_username', 'first_name', 'last_name']);
                this.loggedInAccountUsers = [loggedInUser];
                this.users = [loggedInUser];
                const deferred = $q.defer();
                deferred.resolve();
                return deferred.promise;
            }
        };

        this.populateRedhatSecureSupportUsers = () => {
            const accountNumber = "5487648";
            this.redhatSecureSupportUsersLoading = true;
            return strataService.accounts.users(accountNumber).then((users) => {
                this.redhatSecureSupportUsers = users;
                if (securityService.loginStatus.authedUser.is_internal && !_.find(this.redhatUsers, { sso_username: securityService.loginStatus.authedUser.sso_username })) {
                    this.redhatSecureSupportUsers.unshift(securityService.loginStatus.authedUser);
                }
                this.redhatSecureSupportUsersLoading = false;
            });
        };

        this.scrollToComment = function (commentID) {
            if (!commentID) {
                return;
            }
            var commentElem = document.getElementById(commentID);
            if (commentElem) {
                commentElem.scrollIntoView(true);
            }
        };

        this.feedbackComment = async function (element, feedback) {
            if (RHAUtils.isNotEmpty(this.kase) && RHAUtils.isNotEmpty(element) && !element.applyingFeedback) {
                const commJson = {
                    feedback: feedback,
                    accountNumber: this.kase.account_number,
                    commentId: element.id,
                    commentCreatedBy: element.created_by
                }
                element.applyingFeedback = true;
                try {
                    if (element.feedback !== undefined) {
                        await hydrajs.commentFeedback.updateCommentFeedback(this.kase.case_number, commJson);
                    } else {
                        await hydrajs.commentFeedback.createCommentFeedback(this.kase.case_number, commJson)
                    }
                    element.feedback = feedback;
                } catch (error) {
                    AlertService.addStrataErrorMessage(error);
                } finally {
                    element.applyingFeedback = false;
                }
            }
        };
        this.populateComments = function (caseNumber) {
            var promise = strataService.cases.comments.get(caseNumber);
            var draftId;
            promise.then(angular.bind(this, function (comments) {
                angular.forEach(comments, angular.bind(this, function (comment, index) {
                    if (comment.draft === true) {
                        this.draftComment = comment;
                        this.draftCommentOnServerExists = true;
                        draftId = this.draftComment.id;
                        this.commentText = comment.text;
                        this.isCommentPublic = comment.public;
                        if (RHAUtils.isNotEmpty(this.commentText)) {
                            this.disableAddComment = false;
                        } else if (RHAUtils.isEmpty(this.commentText)) {
                            this.disableAddComment = true;
                        }
                        comments.slice(index, index + 1);
                    }
                    // let commentFeedback = _.filter(comments[1], (comm) => comm.commentId === comment.id);
                    // if (RHAUtils.isNotEmpty(commentFeedback[0])) {
                    //     comment.feedback = commentFeedback[0].feedback;
                    // } else {
                    //     comment.feedback = undefined;
                    // }
                }));
                if (this.localStorageCache) {
                    var cacheKey = (caseNumber + securityService.loginStatus.authedUser.sso_username);
                    var fromCache = this.localStorageCache.get(cacheKey);
                    if (fromCache) {
                        this.draftComment = fromCache;
                        this.commentText = this.draftComment.text;
                        this.isCommentPublic = this.draftComment['public'];
                        if (this.draftCommentOnServerExists) {
                            this.draftComment.id = draftId;
                        }
                        if (RHAUtils.isNotEmpty(this.commentText)) {
                            this.disableAddComment = false;
                        } else if (RHAUtils.isEmpty(this.commentText)) {
                            this.disableAddComment = true;
                        }
                    }
                }
                this.comments = comments;
                this.populateCommentsFeedback(caseNumber);
            }), function (error) {
            });
            return promise;
        };

        this.populateCommentsFeedback = function (caseNumber) {
            var promise = hydrajs.commentFeedback.getCommentFeedback(caseNumber);
            promise.then(angular.bind(this, function (response) {
                _.forEach(this.comments, (comment) => {
                    let commentFeedback = _.filter(response, (comm) => comm.commentId === comment.id);
                    if (RHAUtils.isNotEmpty(commentFeedback[0])) {
                        comment.feedback = commentFeedback[0].feedback;
                    } else {
                        comment.feedback = undefined;
                    }
                });
            }), function (error) {
                console.log('error fetching comment feedback');
            });
            return promise;
        };
        this.populateExternalUpdates = function (caseNumber) {
            var promise = strataService.cases.externalUpdates.list(caseNumber);
            promise.then(angular.bind(this, function (externalUpdates) {
                this.externalUpdates = externalUpdates;
            }), function (error) {
            });
            return promise;
        };

        this.entitlementsLoading = false;
        this.populateEntitlements = function (ssoUserName) {
            this.entitlementsLoading = true;
            strataService.entitlements.get(false, ssoUserName).then(angular.bind(this, function (entitlementsResponse) {
                // if the user has any premium or standard level entitlement, then allow them
                // to select it, regardless of the product.
                // TODO: strata should respond with a filtered list given a product.
                //       Adding the query param ?product=$PRODUCT does not work.
                var uniqueEntitlements = function (entitlements) {
                    var uEntitlements = [];
                    entitlements.forEach(function (e) {
                        if (uEntitlements.indexOf(e.sla) < 0) {
                            uEntitlements.push(e.sla);
                        }
                    });
                    return uEntitlements;
                };
                var entitlements = uniqueEntitlements(entitlementsResponse.entitlement);
                var unknownIndex = entitlements.indexOf('UNKNOWN');
                if (unknownIndex > -1) {
                    entitlements.splice(unknownIndex, 1);
                }
                this.originalEntitlements = entitlements;
                this.entitlements = entitlements;

                //Added this for PCM 996
                //If the customer has only one SLA , make it selected by default on create case page
                if (RHAUtils.isNotEmpty(this.entitlements) && this.entitlements.length === 1) {
                    this.entitlement = this.entitlements[0];
                }

                this.entitlementsLoading = false;
            }), angular.bind(this, function (error) {
                AlertService.addStrataErrorMessage(error);
            }));
        };

        this.updateAndValidateEntitlements = function (product) {
            // case_number is empty means its new case create page
            if (_.isEmpty(this.kase.case_number)) {
                if (!_.isEmpty(this.kase.product) && !_.isEmpty(product)) {
                    this.entitlements = product.serviceLevels;
                    this.entitlement = product.preferredServiceLevel;
                }
            } else {
                // case_number is not empty means its case edit page
                if (!_.isEmpty(this.kase.entitlement.sla) && (this.kase.entitlement.sla === 'PREMIUMPLUS' || this.kase.entitlement.sla === 'PREMIUM PLUS')) {
                    if (!_.isEmpty(this.kase.product) && !_.includes(this.premiumPlusProducts, this.kase.product)) {
                        AlertService.addWarningMessage(gettextCatalog.getString('Selected product {{productName}} is not entitled for Premium Plus support level.', { productName: this.kase.product }));
                        this.kase.product = this.prestineKase.product;
                    }
                }
            }
        };

        this.isPremiumEntitlement = function () {
            if (this.entitlements !== undefined && this.entitlements.length === 1) {
                if (this.entitlements[0] === 'PREMIUM' || this.entitlements[0] === 'AMC' || this.entitlements[0] === 'PREMIUMPLUS' || this.entitlements[0] === 'PREMIUM PLUS') {
                    return true;
                }
            } else if (this.entitlement === 'PREMIUM' || this.entitlement === 'AMC' || this.entitlement === 'PREMIUMPLUS' || this.entitlement === 'PREMIUM PLUS') {
                return true;
            } else if (RHAUtils.isNotEmpty(this.kase.entitlement) && (this.kase.entitlement.sla === 'PREMIUM' || this.kase.entitlement.sla === 'AMC' || this.kase.entitlement.sla === 'PREMIUMPLUS' || this.kase.entitlement.sla === 'PREMIUM PLUS')) {
                return true;
            } else {
                return false;
            }
        }

        this.isSev1 = function () {
            return RHAUtils.isNotEmpty(this.severities) && RHAUtils.isNotEmpty(this.kase.severity) && this.kase.severity.name.charAt(0) === '1';
        }

        this.isSev1Sev2 = function () {
            return RHAUtils.isNotEmpty(this.severities) && RHAUtils.isNotEmpty(this.kase.severity) && (this.kase.severity.name.charAt(0) === '1' || this.kase.severity.name.charAt(0) === '2');
        }

        this.onChangeFTSCheckEditPage = function () {
            var showFts = this.isPremiumEntitlement() && this.isSev1();
            this.fts = showFts;
            this.kase.fts = showFts;
        };

        this.onChangeFTSCheckCreationPage = function () {
            var showFts = this.isPremiumEntitlement() && this.isSev1();
            this.fts = showFts;
            this.kase.fts = showFts;
        };

        this.showFtsOnCreatePage = function () {
            return this.isPremiumEntitlement() && this.isSev1();
        };

        this.showFtsOnEditPage = function () {
            return this.isPremiumEntitlement() && this.isSev1Sev2();
        };

        this.isFtsEditableOnEditPage = () => {
            return this.isPremiumEntitlement() && this.isSev1();
        };

        this.newCaseIncomplete = true;

        this.allowedSeveritiesForProductAndVersion = () => {
            const config = ConfigService.getField('product_severity', 'JSON-HASHMAP');
            const allSeverities = _.map(this.severities, (v) => (v.name));
            const productConfig = _.get(config, this.kase.product);
            if (!productConfig) return allSeverities;
            const versionConfig = _.find(productConfig.versionSeverities, (v) => (v.version === this.kase.version));
            return _.get(versionConfig, 'severities') || productConfig.severities || allSeverities;
        };

        this.isValidSeverity = (severity) => {
            const allowedSeverities = this.allowedSeveritiesForProductAndVersion();
            return Boolean(_.find(allowedSeverities, (v) => (v === severity)));
        };

        this.getValidSeverity = (severity) => {
            const allowedSeverities = this.allowedSeveritiesForProductAndVersion();
            const isValid = Boolean(_.find(allowedSeverities, (v) => (v === severity || v === (severity && severity.name))));
            return isValid ? severity : allowedSeverities[0];
        };

        this.validateNewCase = function () {
            if (!this.isValidSeverity(_.get(this.kase.severity, 'name')) || RHAUtils.isEmpty(this.kase.product) || RHAUtils.isEmpty(this.kase.version) || RHAUtils.isEmpty(this.kase.summary)
                || (!this.showKTFields && RHAUtils.isEmpty(this.kase.description))
                || (this.showKTFields
                    && RHAUtils.isEmpty(this.kase.problem)
                    && RHAUtils.isEmpty(this.kase.environment)
                    && RHAUtils.isEmpty(this.kase.occurance)
                    && RHAUtils.isEmpty(this.kase.urgency)
                )
                || RHAUtils.isEmpty(this.kase.type)
                || (securityService.loginStatus.authedUser.is_internal && RHAUtils.isEmpty(this.owner))
                || (this.requireCaseGroup && RHAUtils.isEmpty(this.group))) {
                this.newCaseIncomplete = true;
            } else {
                this.newCaseIncomplete = false;
            }
        };

        this.buildGroupOptions = function () {
            this.groupOptions = [];
            var sep = '────────────────────────────────────────';
            this.groups.sort(function (a, b) {
                if (a.name < b.name) {
                    return -1;
                }
                if (a.name > b.name) {
                    return 1;
                }
                return 0;
            });

            if (this.showsearchoptions === true) {
                this.groupOptions.push({
                    value: '',
                    label: gettextCatalog.getString('All Groups')
                }, {
                        value: 'ungrouped',
                        label: gettextCatalog.getString('Ungrouped Cases')
                    });
            } else {
                this.groupOptions.push({
                    value: '',
                    label: gettextCatalog.getString('Ungrouped Case')
                });
            }
            if (this.showsearchoptions === true && this.groups.length > 0) {
                this.groupOptions.push({
                    isDisabled: true,
                    label: sep
                });
            }
            angular.forEach(this.groups, function (group) {
                if (group.number !== '-1') {
                    this.groupOptions.push({
                        value: group.number,
                        label: group.name
                    });
                    if (group.is_default) {
                        this.kase.group = group.number;
                        this.group = group.number;
                    }
                }
            }, this);
            if (this.showsearchoptions === true) {
                this.groupOptions.push({
                    isDisabled: true,
                    label: sep
                }, {
                        value: 'manage',
                        label: gettextCatalog.getString('Manage Case Groups')
                    });
            }
        };

        this.clearLocalStorageCacheForNewCase = function () {
            if (this.localStorageCache && RHAUtils.isNotEmpty(this.localStorageCache.get(securityService.loginStatus.authedUser.sso_username))) {
                this.localStorageCache.remove(securityService.loginStatus.authedUser.sso_username);
            }
        };

        this.createCase = function (recommendations) {
            var self = this;
            var deferred = $q.defer();

            /*jshint camelcase: false */
            var caseJSON = {
                'product': this.kase.product,
                'version': this.kase.version,
                'summary': this.kase.summary,
                'description': this.kase.description,
                'severity': this.kase.severity.name
            };
            if (RHAUtils.isNotEmpty(this.kase.type)) {
                caseJSON.type = this.kase.type.name;
            }
            if (RHAUtils.isNotEmpty(this.kase.hostname)) {
                caseJSON.hostname = this.kase.hostname;
            }
            if (this.showKTFields) {
                if (RHAUtils.isNotEmpty(this.kase.problem)) {
                    caseJSON.issue = this.kase.problem;
                }
                if (RHAUtils.isNotEmpty(this.kase.environment)) {
                    caseJSON.environment = this.kase.environment;
                }
                if (RHAUtils.isNotEmpty(this.kase.occurance)) {
                    caseJSON.periodicityOfIssue = this.kase.occurance;
                }
                if (RHAUtils.isNotEmpty(this.kase.urgency)) {
                    caseJSON.timeFramesAndUrgency = this.kase.urgency;
                }
            }
            if (RHAUtils.isNotEmpty(this.group)) {
                caseJSON.folderNumber = this.group;
            }
            if (RHAUtils.isNotEmpty(this.entitlement)) {
                caseJSON.entitlement = {};
                caseJSON.entitlement.sla = this.entitlement;
            }
            if (RHAUtils.isNotEmpty(this.account)) {
                caseJSON.accountNumber = this.account.number;
            }
            if (RHAUtils.isNotEmpty(this.kase.enhanced_sla)) {
                caseJSON.enhancedSLA = this.kase.enhanced_sla;
            }
            if (this.fts) {
                caseJSON.fts = true;
                if (this.fts_contact) {
                    caseJSON.contactInfo24X7 = this.fts_contact;
                }
            }
            if (RHAUtils.isNotEmpty(this.owner)) {
                caseJSON.contactSsoUsername = this.owner;
            }

            if (RHAUtils.isNotEmpty(recommendations)) {
                caseJSON.recommendations = {
                    recommendation: []
                };
                recommendations.forEach(function (rec, index) {
                    caseJSON.recommendations.recommendation.push(this.getRecommendationObject(rec, index));
                }, this);
            }

            this.correctSupportLevelAndFTS(caseJSON);

            this.submittingCase = true;
            AlertService.addWarningMessage(gettextCatalog.getString('Creating case...'));
            strataService.cases.post(caseJSON).then(function (caseNumber) {
                AlertService.clearAlerts();
                AlertService.addSuccessMessage(gettextCatalog.getString('Successfully created case number {{caseNumber}}', { caseNumber: caseNumber }));
                self.clearLocalStorageCacheForNewCase();
                // Send the newly created case number to API as mentioned in PCM-5350
                // Once, the data is sent, delete the caseCreateKey entry from localStorage
                if (RHAUtils.isNotEmpty(self.externalCaseCreateKey) && self.externalCaseCreateKey.includes('se-')) {
                    const caseNumObj = {
                        caseNumber: caseNumber
                    };
                    const guid = JSON.parse(window.localStorage.getItem(self.externalCaseCreateKey)).guid;
                    strataService.solutionEngine.sendCaseNumber(caseNumObj, guid).then(function () {
                        window.localStorage.removeItem(self.externalCaseCreateKey);
                    }, function (error) {
                        AlertService.clearAlerts();
                        AlertService.addStrataErrorMessage(error);
                    });
                }
                deferred.resolve(caseNumber);
            }, function (error) {
                AlertService.clearAlerts();
                AlertService.addStrataErrorMessage(error);
                self.submittingCase = false;
                deferred.reject();
            });
            return deferred.promise;
        };

        this.getRecommendationObject = function (rec, index) {
            var recommendation = {};
            recommendation.resourceId = rec.id;
            recommendation.resourceURI = rec.uri;
            recommendation.resourceViewURI = rec.view_uri;
            recommendation.title = rec.title;
            recommendation.resourceType = rec.documentKind;
            recommendation.client = "portal-case-management";
            recommendation.clientVersion = window.pcmVersion;
            recommendation.analysisAlgorithm = "Text Analysis";
            recommendation.analysisService = "calaveras";
            recommendation.algorithmScore = rec.score;
            recommendation.resource = "Summary";
            var bucket = index === 0 ? 4 : 3;
            recommendation.bucket = bucket;
            recommendation.analysisCategory = "Text Analysis";
            if (rec.documentKind === "Solution") {
                recommendation.solutionOwnerSSOName = rec.authorSSOName;
                recommendation.solutionAbstract = rec.abstract;
                recommendation.solutionTitle = rec.title;
                recommendation.solutionKcsState = rec.kcsState;
                recommendation.solutionUrl = rec.view_uri;
            }
            return recommendation;
        };


        this.correctSupportLevelAndFTS = function (caseJson) {
            if (RHAUtils.isEmpty(caseJson.entitlement) || RHAUtils.isEmpty(caseJson.entitlement.sla)) {
                caseJson.entitlement = {};
                var supportLevelPriorities = ['PREMIUM', 'ENTERPRISE', 'STANDARD', 'PROFESSIONAL', 'AMC', 'PREMIUMPLUS', 'PREMIUM PLUS'];
                supportLevelPriorities.forEach(angular.bind(this, function (entitlement) {
                    if (RHAUtils.isEmpty(caseJson.entitlement.sla) && RHAUtils.isNotEmpty(this.entitlements) && this.entitlements.indexOf(entitlement) >= 0) {
                        // user has the support level and no support level is selected, we can select it
                        caseJson.entitlement.sla = entitlement;
                    }
                }));

                var ftsSupportLevels = ['PREMIUM', 'AMC', 'PREMIUMPLUS', 'PREMIUM PLUS'];
                if (caseJson.severity === '1 (Urgent)' && RHAUtils.isNotEmpty(caseJson.entitlement.sla)
                    && ftsSupportLevels.indexOf(caseJson.entitlement.sla) >= 0) {
                    // for PREMIUM and AMC we auto set FTS if severity is 1
                    caseJson.fts = true;
                }
            }
        };

        this.updateCase = async function () {
            this.updatingCase = true;
            var caseJSON = {};
            if (this.kase.type !== undefined && !angular.equals(this.prestineKase.type, this.kase.type)) {
                caseJSON.type = this.kase.type.name;
            }
            if (this.kase.severity !== undefined && !angular.equals(this.prestineKase.severity, this.kase.severity)) {
                caseJSON.severity = this.kase.severity.name;
            }
            if (this.kase.status !== undefined && !angular.equals(this.prestineKase.status, this.kase.status)) {
                caseJSON.status = this.kase.status.name;
            }
            if (this.kase.internal_status !== undefined && !angular.equals(this.prestineKase.internal_status, this.kase.internal_status)) {
                caseJSON.internalStatus = this.kase.internal_status;
            }
            if (this.kase.alternate_id !== undefined && !angular.equals(this.prestineKase.alternate_id, this.kase.alternate_id)) {
                caseJSON.alternateId = this.kase.alternate_id;
            }
            if (this.kase.product !== undefined && !angular.equals(this.prestineKase.product, this.kase.product)) {
                caseJSON.product = this.kase.product;
            }
            if (this.kase.version !== undefined && !angular.equals(this.prestineKase.version, this.kase.version)) {
                caseJSON.product = this.kase.product;
                caseJSON.version = this.kase.version;
            }
            if (this.kase.hostname !== null && !angular.equals(this.prestineKase.hostname, this.kase.hostname)) {
                caseJSON.hostname = this.kase.hostname;
            }
            if (RHAUtils.isNotEmpty(this.kase.group) && this.kase.group.number !== undefined && !angular.equals(this.prestineKase.group, this.kase.group)) {
                caseJSON.folderNumber = this.kase.group.number;
            } else if (!angular.equals(this.prestineKase.group, this.kase.group)) {
                caseJSON.folderNumber = '';
            }
            if (RHAUtils.isNotEmpty(this.kase.fts) && !angular.equals(this.prestineKase.fts, this.kase.fts)) {
                caseJSON.fts = this.kase.fts;
            }
            if (this.kase.fts && !angular.equals(this.prestineKase.contact_info24_x7, this.kase.contact_info24_x7)) {
                caseJSON.contactInfo24X7 = this.kase.contact_info24_x7;
            }
            if (this.kase.notes !== null && !angular.equals(this.prestineKase.notes, this.kase.notes)) {
                caseJSON.notes = this.kase.notes;
            }
            if (this.kase.action_plan !== null && !angular.equals(this.prestineKase.action_plan, this.kase.action_plan)) {
                caseJSON.actionPlan = this.kase.action_plan;
            }
            if (this.kase.summary !== null && !angular.equals(this.prestineKase.summary, this.kase.summary)) {
                caseJSON.summary = this.kase.summary;
            }
            if (this.kase.case_summary !== null && !angular.equals(this.prestineKase.case_summary, this.kase.case_summary)) {
                caseJSON.caseSummary = this.kase.case_summary;
            }
            if (this.kase.enhanced_sla !== null && !angular.equals(this.prestineKase.enhanced_sla, this.kase.enhanced_sla)) {
                caseJSON.enhancedSLA = this.kase.enhanced_sla;
            }
            if (this.kase.contact_sso_username !== null && !angular.equals(this.prestineKase.contact_sso_username, this.kase.contact_sso_username)) {
                caseJSON.contactSsoUsername = this.kase.contact_sso_username;
            }

            let deletedSbrs = [];
            let addedSbrs = [];
            if (RHAUtils.isNotEmpty(this.kase.sbr_groups.sbr_group) || RHAUtils.isNotEmpty(this.prestineKase.sbr_groups.sbr_group)) {
                //Sbr logic  - http://pastebin.test.redhat.com/492854
                if (this.prestineKase.sbr_groups.sbr_group) {
                    deletedSbrs = this.sbrDiff(this.prestineKase.sbr_groups.sbr_group, this.kase.sbr_groups.sbr_group);
                }
                addedSbrs = this.sbrDiff(this.kase.sbr_groups.sbr_group, this.prestineKase.sbr_groups.sbr_group);
            }

            try {
                let addSbrJSON = {};
                let removeSbrJSON = {};
                if (addedSbrs.length > 0 && deletedSbrs.length > 0) {
                    addSbrJSON.sbrGroup = addedSbrs;
                    removeSbrJSON.sbrGroup = deletedSbrs;
                    await strataService.cases.sbrs.add(this.kase.case_number, addSbrJSON);
                    await strataService.cases.sbrs.remove(this.kase.case_number, removeSbrJSON);
                } else if (addedSbrs.length > 0 && deletedSbrs.length === 0) {
                    addSbrJSON.sbrGroup = addedSbrs;
                    await strataService.cases.sbrs.add(this.kase.case_number, addSbrJSON);
                } else if (deletedSbrs.length > 0 && addedSbrs.length === 0) {
                    removeSbrJSON.sbrGroup = deletedSbrs;
                    await strataService.cases.sbrs.remove(this.kase.case_number, removeSbrJSON);
                }
                await strataService.cases.put(this.kase.case_number, caseJSON);
                this.updatingCase = false;
                angular.copy(this.kase, this.prestineKase);
            } catch (error) {
                this.updatingCase = false;
            }
        };

        this.updateCaseDescription = function () {
            this.updatingCase = true;
            var deferred = $q.defer();
            var caseJSON = {};
            if (this.kase.description !== null && !angular.equals(this.prestineKase.description, this.kase.description)) {
                caseJSON.description = this.kase.description;
            }
            strataService.cases.put(this.kase.case_number, caseJSON).then(angular.bind(this, function () {
                this.updatingCase = false;
                angular.copy(this.kase, this.prestineKase);
                deferred.resolve();
            }), (error) => {
                deferred.reject(error);
                this.updatingCase = false;
            });
            return deferred.promise;
        };

        this.updateLocalStorageForNewCase = function () {
            //as we have common component for product and version, adding extra condition for confirming its on new case
            if (this.localStorageCache && RHAUtils.isEmpty(this.kase.case_number)) {
                var draftNewCase = {};
                if (RHAUtils.isNotEmpty(this.kase.description)) {
                    draftNewCase.description = this.kase.description;
                }
                if (RHAUtils.isNotEmpty(this.kase.problem)) {
                    draftNewCase.problem = this.kase.problem;
                }
                if (RHAUtils.isNotEmpty(this.kase.environment)) {
                    draftNewCase.environment = this.kase.environment;
                }
                if (RHAUtils.isNotEmpty(this.kase.occurance)) {
                    draftNewCase.occurance = this.kase.occurance;
                }
                if (RHAUtils.isNotEmpty(this.kase.urgency)) {
                    draftNewCase.urgency = this.kase.urgency;
                }
                if (RHAUtils.isNotEmpty(this.kase.hostname)) {
                    draftNewCase.hostname = this.kase.hostname;
                }
                if (RHAUtils.isNotEmpty(this.kase.summary)) {
                    draftNewCase.summary = this.kase.summary;
                }
                if (RHAUtils.isNotEmpty(this.kase.product)) {
                    draftNewCase.product = this.kase.product;
                }
                if (RHAUtils.isNotEmpty(this.kase.version)) {
                    draftNewCase.version = this.kase.version;
                }
                if (RHAUtils.isNotEmpty(this.kase.hostname)) {
                    draftNewCase.hostname = this.kase.hostname;
                }
                if (RHAUtils.isNotEmpty(this.kase.type)) {
                    draftNewCase.type = this.kase.type;
                }
                var newCaseDescLocalStorage = { 'text': draftNewCase };
                this.localStorageCache.put(securityService.loginStatus.authedUser.sso_username, newCaseDescLocalStorage);
            }
        };
        this.clearProdVersionFromLS = function () {
            this.kase.product = undefined;
            this.kase.version = undefined;
            this.updateLocalStorageForNewCase();
        };
        this.checkForCaseStatusToggleOnAttachOrComment = function () {
            var status = {};
            if (!securityService.loginStatus.authedUser.is_internal && this.kase.status.name === 'Closed') {
                status = { name: 'Waiting on Red Hat' };
                this.kase.status = status;
            }

            if (!securityService.loginStatus.authedUser.is_internal && this.kase.status.name === 'Waiting on Customer') {
                status = { name: 'Waiting on Red Hat' };
                this.kase.status = status;
            }
        };
        this.setFilterSelectModel = function (sortField, sortOrder) {
            if (sortOrder === 'ASC') {
                if (sortField === 'lastModifiedDate') {
                    this.filterSelect = ConstantsService.sortByParams[1];
                } else if (sortField === 'severity') {
                    this.filterSelect = ConstantsService.sortByParams[2];
                } else if (sortField === 'createdDate') {
                    this.filterSelect = ConstantsService.sortByParams[5];
                } else if (sortField === 'owner') {
                    this.filterSelect = ConstantsService.sortByParams[6];
                } else if (sortField === 'status') {
                    this.filterSelect = ConstantsService.sortByParams[8];
                }
            } else if (sortOrder === 'DESC') {
                if (sortField === 'lastModifiedDate') {
                    this.filterSelect = ConstantsService.sortByParams[0];
                } else if (sortField === 'severity') {
                    this.filterSelect = ConstantsService.sortByParams[3];
                } else if (sortField === 'createdDate') {
                    this.filterSelect = ConstantsService.sortByParams[4];
                } else if (sortField === 'owner') {
                    this.filterSelect = ConstantsService.sortByParams[7];
                } else if (sortField === 'status') {
                    this.filterSelect = ConstantsService.sortByParams[9];
                }
            }
        };

        this.sendCreationStartedEvent = function ($event) {
            if (window.chrometwo_require !== undefined && !this.creationStartedEventSent && $location.path() === '/case/new') {
                chrometwo_require(['analytics/main'], (analytics) => {
                    analytics.trigger('ABTestImpressionAsyncPCM', $event);
                    this.creationStartedEventSent = true;
                });
            }
        };

        this.setCreationStartedEventSent = function (flag) {
            this.creationStartedEventSent = flag;
        };

        this.getCaseEscalation = async function (accountNumber, caseNumber) {
            try {
                if (RHAUtils.isNotEmpty(caseNumber) && RHAUtils.isNotEmpty(accountNumber)) {
                    const options = { caseNumber, accountNumber };
                    const escalations = await hydrajs.escalations.getEscalations(options);
                    if (escalations && escalations.length >= 0) {
                        const rmeEscalation = _.filter(escalations, (es) => es && es.escalationSource === 'RME Escalation');
                        if (rmeEscalation && rmeEscalation.length >= 0) {
                            this.caseRMEEscalation = _.without(_.uniqBy(rmeEscalation, (es) => es && es.name), null, undefined);
                        }
                    }
                } else {
                    this.caseRMEEscalation = [];
                }
            } catch (error) {
                this.caseRMEEscalation = [];
                console.log('error getting case escalation' + error);
            }

        }
        this.searchRHUsers = async (searchQuery) => {
            this.noResultsForRHUsersSearch = false;
            // if (_.isNil(searchQuery) || searchQuery.length < 2) return [];
            let queryParams = {
                limit: 10,
                internal: false, // to get non-ldap contacts
                isInternalContact: true,
                nameLookup: searchQuery || ''
            }
            let options = [];
            try {
                this.isLoadingRHUsers = true;
                const response = await hydrajs.contacts.getSFDCContacts(queryParams);
                options = (response && response.items && response.items.length) ? response.items : [];
                options = _.filter(options, (c) => !_.includes(this.originalNotifiedUsers, c.ssoUsername));
                this.isLoadingRHUsers = false;
            } catch (e) {
                console.warn(`Unable to search contacts, error: ${e}`);
                this.isLoadingRHUsers = false;
            }
            this.noResultsForRHUsersSearch = options.length === 0;
            return options;
        };

        this.mapUsers = (users) => {
            return _.compact(_.map(users, (userSSO) => _.find(this.internalNotificationContacts, { 'ssoUsername': userSSO })))
        };
    }
}
