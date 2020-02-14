
(function ($) {
    Drupal.behaviors.photo_field_widget = {
        attach: function(context, settings) {
            if (Drupal.settings.fieldPhotoSettings !== undefined) {
                for (var fieldName in Drupal.settings.fieldPhotoSettings) {

                    $('.field-name-' + fieldName.replace(/_/g, '-'))
                        .find('.photo-preview-wrapper .photo-preview')
                        .hide()
                        .on('preview', function (e) {
                            var $preview = $(e.target);
                            var fieldSettings = Drupal.settings.fieldPhotoSettings[fieldName].settings;

                            $preview.find('img').remove();

                            $preview.show();

                            var $photo = $('[name="' + $preview.data('field') + '[und][' + $preview.data('delta') + '][fid]"]');
                            var fileData = $photo.data('fielddata');

                            if (!fileData) {
                                return;
                            }

                            var $img = $('<img>', {
                                src: fileData.realPath,
                                width: fieldSettings.width + 'px',
                                height: fieldSettings.height + 'px'
                            }).appendTo($preview);

                            $preview.find('button.close').once(function () {
                                $(this).on('click', function (e) {
                                    var $preview = $(e.target).parents('.photo-preview');
                                    var fieldName = $preview.data('field');
                                    var fieldDelta = $preview.data('delta');
                                    var $photo = $('[name="' + fieldName + '[und][' + fieldDelta + '][fid]"]');
                                    var fileData = $photo.data('fielddata');

                                    $.ajax(Drupal.settings.basePath + 'photo/ajax/delete-file/' + fileData.fid, {
                                        success: function (data) {
                                            data = JSON.parse(data);
                                            if (data.result) {
                                                var $el = $('[name="' + fieldName + '[und][' + fieldDelta + '][fid]"]');
                                                $el.val(null);
                                                $img.remove();
                                                $preview.hide();

                                                $('.field-photo-container-' + fieldName + '.field-photo-container-' + fieldDelta)
                                                    .find('.btn-field-photo')
                                                    .show();

                                                Drupal.settings.fieldPhotoSettings[fieldName].value[fieldDelta] = null;
                                            }
                                        },
                                        error: function () {
                                            console.log('error');
                                        },
                                        complete: function () {
                                            console.log('complete');
                                        }
                                    });
                                });
                            });
                        });

                    var fieldSettings = Drupal.settings.fieldPhotoSettings[fieldName];
                    var $items = $('input[type="hidden"][name^="' + fieldName + '[und]["]');
                    $.each($items, function (delta) {
                        if ($(this).val() && parseInt($(this).val())) {
                            if ($(this).data('fielddata') === undefined) {
                                $(this).data('fielddata', fieldSettings.value[delta]);
                            }

                            $('.field-photo-container-' + fieldName + '.field-photo-container-' + delta)
                                .find('.btn-field-photo')
                                .hide();

                            $(this).next().find('.photo-preview').trigger('preview');
                        }
                    });
                }
            }
        }
    };
}(jQuery));
