
(function ($) {
    Drupal.behaviors.photo_field_take_widget = {
        attach: function(context, settings) {

            if (navigator.mediaDevices === undefined) {
                navigator.mediaDevices = {};
            }

            if (navigator.mediaDevices.getUserMedia === undefined) {
                navigator.mediaDevices.getUserMedia = function(constraints) {

                    var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

                    if (!getUserMedia) {
                        return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
                    }

                    return new Promise(function(resolve, reject) {
                        getUserMedia.call(navigator, constraints, resolve, reject);
                    });
                }
            }

            var $wr = $('#take-photo-wrapper', context);
            var fieldName = $wr.find('[name="photo_field_name"]').val();
            var fieldDelta = $wr.find('[name="photo_field_delta"]').val();

            if (Drupal.settings.fieldPhotoSettings[fieldName] !== undefined) {
                var settingField = Drupal.settings.fieldPhotoSettings[fieldName];
                var $btnSave = $wr.find('#btnSave');
                var $form = $wr.parents('form');
                var ajaxForm = Drupal.ajax[$form.attr('id')];
                var $btnTakePhoto = $('#btnTakePhoto');

                var $video = $('video');
                var photo = null;
                var imageCapture;
                var webcamStream;

                if ($video.length) {
                    navigator.mediaDevices.getUserMedia({ audio: false, video: true })
                        .then(function(stream) {
                            var video = $video[0];
                            if ("srcObject" in video) {
                                video.srcObject = stream;
                            } else {
                                video.src = window.URL.createObjectURL(stream);
                            }
                            video.onloadedmetadata = function(e) {
                                video.play();
                            };

                            var mediaStreamTrack = stream.getVideoTracks()[0];
                            imageCapture = new ImageCapture(mediaStreamTrack);
                            webcamStream = mediaStreamTrack;
                        })
                        .catch(function(err) {
                            switch (err.name) {
                                case 'NotAllowedError':
                                    $wr.html('<div class="alert alert-warning" role="alert">Доступ к камере запрещен!</div>');
                                    break;
                                case 'NotSupportedError':
                                    $wr.html('<div class="alert alert-warning" role="alert">Устройство не поддерживается!</div>');
                                    break;
                            }

                            console.log(err.name + ": " + err.message);
                        });

                    $btnTakePhoto.on('click', function (e) {

                        imageCapture.takePhoto()
                            .then(function (blob) {

                                window.scrollTo(0, parseFloat($('#modalContent').css('top')));

                                var url = window.URL.createObjectURL(blob);

                                var $img = $wr.find('.photo-image').find('img');
                                if ($img.length) {
                                    $img.data('cropper').destroy();
                                    $img.remove()
                                }

                                $img = $('<img>', {
                                    id: 'photo',
                                    src: url
                                })
                                    .width($wr.find('.photo-image').width())
                                    .appendTo($wr.find('.photo-image'));

                                $img.cropper({
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
                                    preview: $wr.find('#photo-preview')
                                });
                            })
                            .catch(function () {

                            });
                    });

                    $btnSave.on('click', function (e) {
                        e.preventDefault();

                        $(this).addClass('progress-disabled').attr('disabled', true);

                        var $img = $wr.find('#photo');

                        $img.data('cropper').getCroppedCanvas().toBlob(function (blob) {

                            var file = window.URL.createObjectURL(blob);
                            var fileName = file.replace(/^.*[\\\/]/, '').concat('.png');
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
                                        webcamStream.stop();
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

                    $(document).on("CToolsDetachBehaviors", function(e, modal) {
                        if (webcamStream) {
                            webcamStream.stop();
                        }
                    });
                }
            }
        }
    };
}(jQuery));
