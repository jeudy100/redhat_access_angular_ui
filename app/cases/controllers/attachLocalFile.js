'use strict';

export default class AttachLocalFile {
    constructor($scope, AlertService, AttachmentsService, CaseService, securityService, RHAUtils, gettextCatalog, AUTH_EVENTS) {
        'ngInject';

        $scope.AttachmentsService = AttachmentsService;
        $scope.CaseService = CaseService;
        $scope.NO_FILE_CHOSEN = 'No file chosen';
        $scope.fileDescription = '';

        $scope.$watch('CaseService.account.number', async () => {
            await AttachmentsService.reEvaluateS3EnabledForAccount();
        }, true);

        $scope.getAttachFileTT = function (s3Enabled) {
            return s3Enabled ?
                gettextCatalog.getString('Can now accept large attachments (~250 GB)') :
                _.get(AttachmentsService.s3AccountConfigurations, 's3UploadFunctionality') === 'disable_all' ?
                    _.get(AttachmentsService.s3AccountConfigurations, 's3UploadTooltip') : '';
        }

        $scope.init = function () {
            AttachmentsService.fetchMaxAttachmentSize();
        };

        $scope.clearSelectedFile = function () {
            $scope.fileName = $scope.NO_FILE_CHOSEN;
            $scope.fileDescription = '';
        };
        $scope.addFile = function (file) {
            /*jshint camelcase: false */
            var createdDate = RHAUtils.convertToTimezone(new Date());
            AttachmentsService.addNewAttachment({
                file_name: file.name,
                description: $scope.fileDescription,
                fileObj: file,
                length: file.size,
                created_by: securityService.loginStatus.authedUser.last_name + ', ' + securityService.loginStatus.authedUser.first_name,
                last_modified_by: securityService.loginStatus.authedUser.last_name + ', ' + securityService.loginStatus.authedUser.first_name,
                created_date: RHAUtils.formatDate(createdDate, 'MMM DD YYYY'),
                created_time: RHAUtils.formatDate(createdDate, 'hh:mm A Z')
            });
            $scope.clearSelectedFile();
            if ($scope.$root.$$phase !== '$apply' && $scope.$root.$$phase !== '$digest') {
                $scope.$apply();
            }
        };
        $scope.getFile = function () {
            $('#fileUploader').click();
        };
        $scope.selectFile = function () {
            const minSize = 0;
            const maxSize = AttachmentsService.s3EnabledForAccount ? 1e12 : (AttachmentsService.maxAttachmentSize / 1024) * 1000000000;

            // Array.prototype.forEach is needed becasue the file input object is not an actual array so it does not
            // have forEach method (https://developer.mozilla.org/en-US/docs/Web/API/FileList).
            Array.prototype.forEach.call($('#fileUploader')[0].files, (file) => {
                const greaterThanMin = file.size > minSize;
                const lessThanMax = file.size < maxSize;
                if ((file && greaterThanMin && lessThanMax) || (file && greaterThanMin && AttachmentsService.s3EnabledForAccount)) {

                    // Check if file is readable
                    const reader = new FileReader();
                    reader.onload = () => {
                        $scope.addFile(file);
                    };
                    reader.onerror = () => {
                        const message = gettextCatalog.getString('{{fileName}} cannot be read by the browser. Check your privileges and make sure you are allowed to read the file.', {
                            errorFileName: file.name
                        });
                        AlertService.addDangerMessage(message);
                        if ($scope.$root.$$phase !== '$apply' && $scope.$root.$$phase !== '$digest') {
                            $scope.$apply();
                        }
                    };
                    reader.readAsArrayBuffer(file.slice(0, 10)); // try reading first 10 bytes
                } else if (file && file.size === minSize) {
                    var message = gettextCatalog.getString("{{fileName}} cannot be attached because it is a 0 byte file.", { fileName: file.name });
                    AlertService.addDangerMessage(message);
                } else if (file && !AttachmentsService.s3EnabledForAccount) {
                    var message = gettextCatalog.getString("{{fileName}} cannot be attached because it is larger than {{fileSize}} GB. Please FTP large files to dropbox.redhat.com.", {
                        errorFileName: file.name,
                        errorFileSize: (AttachmentsService.maxAttachmentSize / 1024)
                    });
                    AlertService.addDangerMessage(message);
                } else if (file && AttachmentsService.s3EnabledForAccount) {
                    var message = gettextCatalog.getString("{{fileName}} cannot be attached because it is larger than 1 TB.", {
                        errorFileName: file.name
                    });
                    AlertService.addDangerMessage(message);
                }
            });

            if ($scope.$root.$$phase !== '$apply' && $scope.$root.$$phase !== '$digest') {
                $scope.$apply();
            }

            $('#fileUploader')[0].value = '';
        };
        $scope.clearSelectedFile();

        if (securityService.loginStatus.isLoggedIn) {
            $scope.init();
        }
        $scope.$on(AUTH_EVENTS.loginSuccess, function () {
            $scope.init();
        });

    }
}
