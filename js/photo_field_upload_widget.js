
(function ($) {
    Drupal.behaviors.photo_field_upload_widget = {
        attach: function(context, settings) {

            var $wr = $('#upload-photo-wrapper', context);
            var fieldName = $wr.find('[name="photo_field_name"]').val();
            var fieldDelta = $wr.find('[name="photo_field_delta"]').val();

            if (Drupal.settings.fieldPhotoSettings[fieldName] !== undefined) {

                var settingField = Drupal.settings.fieldPhotoSettings[fieldName];
                var $btnSave = $wr.find('#btnSave');
                var $form = $wr.parents('form');
                var ajaxForm = Drupal.ajax[$form.attr('id')];
                var $inputPhoto = $('#inputPhoto');

                $btnSave.hide();

                $btnSave.on('click', function (e) {
                    e.preventDefault();

                    $(this).addClass('progress-disabled').attr('disabled', true);

                    var $img = $wr.find('#upload-photo-img');

                    $img.data('cropper').getCroppedCanvas().toBlob(function (blob) {

                        var file = $img.data('file');

                        var fileName = file.name.replace(/^.*[\\\/]/, '');
                        var fileNameWithoutExt = fileName.slice(0, -4);
                        var destination = settingField.settings.file_directory;

                        var formData = new FormData();
                        formData.append('files[' + fileNameWithoutExt + ']', blob, fileName);

                        $.ajax(Drupal.settings.basePath + 'photo/ajax/save-file/' + fileNameWithoutExt + '/' + destination, {
                            method: 'POST',
                            data: formData,
                            processData: false,
                            contentType: false,

                            success: function (data) {
                                data = JSON.parse(data);
                                if (data.file) {
                                    var $el = $('[name="' + fieldName + '[und][' + fieldDelta + '][fid]"]');
                                    $el.val(data.file.fid);
                                    $el.data('fielddata', data.file);
                                    settingField.value[fieldDelta] = data.file;
                                    $form.trigger(ajaxForm.event);
                                }
                            },
                            error: function () {
                                $btnSave.removeClass('progress-disabled').removeAttr('disabled');
                                console.log('error');
                            },
                            complete: function () {
                                $btnSave.removeClass('progress-disabled').removeAttr('disabled');
                                console.log('complete');
                            }
                        });
                    });

                });

                var URL = window.URL || window.webkitURL;
                if (URL) {
                    $inputPhoto.on('change', function (e) {

                        var $canvas = $('#upload-photo-img-wrapper');

                        var files = this.files;
                        var file;

                        if (files && files.length) {
                            file = files[0];

                            $wr.find('#upload-photo-img-wrapper').html('');

                            var $imgEl = $('<img>', {
                                id: 'upload-photo-img',
                                src: URL.createObjectURL(file)
                            }).data('file', file).appendTo($canvas);

                            $imgEl.cropper({
                                restore: false,
                                guides: false,
                                center: false,
                                highlight: false,
                                cropBoxMovable: false,
                                cropBoxResizable: false,
                                toggleDragModeOnDblclick: false,
                                dragMode: 'move',
                                aspectRatio: settingField.settings.width / settingField.settings.height,
                                viewMode: 1,
                                preview: $wr.find('#upload-photo-img-cropper-preview')
                            });

                            $btnSave.show();
                        }
                    });
                } else {
                    $inputPhoto.prop('disabled', true);
                    $('<div>', {
                        class: 'alert alert-warning',
                        role: 'alert',
                        text: 'Браузер не поддерживает загрузку файлов!'
                    }).prependTo($('.photo-upload'));
                }
            }

        }
    };
}(jQuery));
