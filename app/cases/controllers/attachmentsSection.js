'use strict';

export default class AttachmentsSection {
    constructor($scope, AlertService, AttachmentsService, CaseService, strataService, TreeViewSelectorUtils, EDIT_CASE_CONFIG, gettextCatalog) {
        'ngInject';

        $scope.rhaDisabled = !EDIT_CASE_CONFIG.showAttachments;
        $scope.showServerSideAttachments = EDIT_CASE_CONFIG.showServerSideAttachments;
        $scope.isPCM = EDIT_CASE_CONFIG.isPCM;
        $scope.ie8 = window.ie8;
        $scope.ie9 = window.ie9;
        $scope.ieFileDescription = '';
        $scope.AttachmentsService = AttachmentsService;
        $scope.CaseService = CaseService;
        $scope.TreeViewSelectorUtils = TreeViewSelectorUtils;
        $scope.ie8Message = 'We’re unable to accept file attachments from Internet Explorer 8 (IE8) at this time. Please see our instructions for providing files <a href=\"https://access.redhat.com/solutions/2112\" target="_blank\">via FTP </a> in the interim.';
        $scope.doUpdate = function () {
            $scope.updatingAttachments = true;
            AttachmentsService.updateAttachments(CaseService.kase.case_number).then(function () {
                $scope.updatingAttachments = false;
                CaseService.checkForCaseStatusToggleOnAttachOrComment();
            }, function (error) {
                $scope.updatingAttachments = false;
            });
        };

        $scope.ieClearSelectedFile = function () {
            $scope.ieFileDescription = '';
        };

        $scope.ieUpload = function ($event) {
            var uploadingAlert = AlertService.addWarningMessage(gettextCatalog.getString('Uploading attachment...'));
            var form = document.getElementById('fileUploaderForm');
            var iframeId = document.getElementById('upload_target');
            form.action = 'https://' + window.location.host + '/rs/cases/' + CaseService.kase.case_number + '/attachments';

            var eventHandler = function () {
                if (iframeId.removeEventListener) {
                    iframeId.removeEventListener('load', eventHandler, false);
                } else if (iframeId.detachEvent) {
                    iframeId.detachEvent('onload', eventHandler);
                }
                if (!$scope.ie8) {
                    var content;
                    if (iframeId.contentDocument && iframeId.contentDocument.body !== null) {
                        content = iframeId.contentDocument.body.innerText;
                    } else if (iframeId.contentWindow && iframeId.contentWindow.document.body !== null) {
                        content = iframeId.contentWindow.document.body.innerText;
                    }
                    if (content !== undefined && content.length) {
                        var parser = document.createElement('a');
                        parser.href = content;
                        var splitPath = parser.pathname.split('/');
                        if (splitPath !== undefined && splitPath[4] !== undefined) {
                            AttachmentsService.clear();
                            strataService.cache.clr('attachments' + CaseService.kase.case_number);
                            strataService.cases.attachments.list(CaseService.kase.case_number).then(function (attachmentsJSON) {
                                AlertService.removeAlert(uploadingAlert);
                                AttachmentsService.defineOriginalAttachments(attachmentsJSON);
                                AlertService.addSuccessMessage(gettextCatalog.getString('Successfully uploaded attachment'));
                                CaseService.checkForCaseStatusToggleOnAttachOrComment();
                                $scope.ieClearSelectedFile();

                            }, function (error) {
                                AlertService.addStrataErrorMessage(error);
                            });
                        } else {
                            AlertService.removeAlert(uploadingAlert);
                            AlertService.addDangerMessage(gettextCatalog.getString('Error: Failed to upload attachment. Message:{{errorMessage}}', {errorMessage: content}));
                            $scope.$apply();
                        }
                    } else {
                        AlertService.removeAlert(uploadingAlert);
                        AlertService.addDangerMessage(gettextCatalog.getString('Error: Failed to upload attachment. Message:{{errorMessage}}', {errorMessage: content}));
                        $scope.$apply();
                    }
                } else {
                    strataService.cases.attachments.list(CaseService.kase.case_number).then(function (attachmentsJSON) {
                        if (attachmentsJSON.length !== AttachmentsService.originalAttachments.length) {
                            AlertService.removeAlert(uploadingAlert);
                            AttachmentsService.defineOriginalAttachments(attachmentsJSON);
                            AlertService.addSuccessMessage(gettextCatalog.getString('Successfully uploaded attachment'));
                            CaseService.checkForCaseStatusToggleOnAttachOrComment();
                            $scope.ieClearSelectedFile();
                        } else {
                            AlertService.removeAlert(uploadingAlert);
                            AlertService.addDangerMessage(gettextCatalog.getString('Error: Failed to upload attachment'));
                        }

                    }, function (error) {
                        AlertService.addStrataErrorMessage(error);
                    });
                }
                setTimeout(function () {
                    },
                    100
                );
            };

            if (iframeId.addEventListener) {
                iframeId.addEventListener('load', eventHandler, false);
            } else if (iframeId.attachEvent) {
                iframeId.attachEvent('onload', eventHandler);
            }
            form.submit();
        };
    }
}
