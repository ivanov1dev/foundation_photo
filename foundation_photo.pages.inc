<?php

/**
 * @param null $js
 * @param string $action
 */
function foundation_photo_ajax_actions($js = NULL, $action) {
  if ($js) {
    ctools_include('modal');
    ctools_include('ajax');

    $args = func_get_args();
    array_shift($args);
    array_shift($args);

    $action = str_replace('-', '_', $action);

    $map = [
      'take_photo' => t('Take photo'),
      'upload_photo' => t('Upload photo'),
    ];

    $output = [];

    $callback = sprintf('foundation_photo_%s_action', $action);

    if (isset($map[$action])) {
      $form_state = [
        'title' => $map[$action],
        'ajax' => TRUE,
        'build_info' => [
          'args' => $args
        ]
      ];

      form_load_include($form_state, 'inc', 'foundation_photo', 'foundation_photo.pages');

      $output = ctools_modal_form_wrapper('foundation_photo_' . $action . '_form', $form_state);
      if (!empty($form_state['executed'])) {
        $output = call_user_func_array($callback, array_merge($args, [$form_state]));
      }
    }
    elseif (function_exists($callback)) {
      $output = call_user_func_array($callback, $args);
    }

    print ajax_render($output);
    exit;
  }
}

/**
 * @param $form
 * @param $form_state
 * @return mixed
 */
function foundation_photo_take_photo_form($form, &$form_state, $entity_type, $bundle, $field_name, $delta) {

  $form['#attached'] = [
    'js' => [
      libraries_get_path('cropperjs') . '/dist/cropper.min.js',
      libraries_get_path('jquery-cropper') . '/dist/jquery-cropper.js',
      ctools_attach_js('photo_field_take_widget', 'foundation_photo'),
    ],
    'css' => [
      libraries_get_path('cropperjs') . '/dist/cropper.min.css',
      ctools_attach_css('photo_field_take_widget', 'foundation_photo'),
    ],
  ];

  $instance = field_info_instance($entity_type, $field_name, $bundle);

  $form['photo_entity_type'] = array('#type' => 'value', '#value' => $entity_type);
  $form['photo_field'] = array('#type' => 'value', '#value' => field_info_field($field_name));
  $form['photo_instance'] = array('#type' => 'value', '#value' => $instance);
  $form['photo_delta'] = array('#type' => 'value', '#value' => $delta);

  $form['photo_field_name'] = array('#type' => 'hidden', '#value' => $field_name);
  $form['photo_field_delta'] = array('#type' => 'hidden', '#value' => $delta);

  $form['save'] = array(
    '#attributes' => [
      'id' => 'btnSave',
    ],
    '#type' => 'submit',
    '#value' => t('Save'),
  );

  return $form;
}

/**
 * @param $form
 * @param $form_state
 * @return mixed
 */
function foundation_photo_upload_photo_form($form, &$form_state, $entity_type, $bundle, $field_name, $delta) {

  $form['#attached'] = [
    'js' => [
      libraries_get_path('cropperjs') . '/dist/cropper.min.js',
      libraries_get_path('jquery-cropper') . '/dist/jquery-cropper.js',
      ctools_attach_js('photo_field_upload_widget', 'foundation_photo'),
    ],
    'css' => [
      libraries_get_path('cropperjs') . '/dist/cropper.min.css',
      ctools_attach_css('photo_field_upload_widget', 'foundation_photo'),
    ],
  ];

  $form['photo_entity_type'] = array('#type' => 'value', '#value' => $entity_type);
  $form['photo_field'] = array('#type' => 'value', '#value' => field_info_field($field_name));
  $form['photo_delta'] = array('#type' => 'value', '#value' => $delta);

  $form['photo_field_name'] = array('#type' => 'hidden', '#value' => $field_name);
  $form['photo_field_delta'] = array('#type' => 'hidden', '#value' => $delta);

  $form['save'] = array(
    '#attributes' => [
      'id' => 'btnSave',
    ],
    '#type' => 'submit',
    '#value' => t('Save'),
  );

  return $form;
}

/**
 * @param $entity_type
 * @param $bundle
 * @param $field_name
 * @param $delta
 * @param $form_state
 * @return array
 */
function foundation_photo_take_photo_action($entity_type, $bundle, $field_name, $delta, $form_state) {
  $commands = [];
  $commands[] = ctools_modal_command_dismiss();
  $commands[] = ajax_command_invoke('[data-field="'. $field_name .'"]', 'trigger', ['preview']);
  return $commands;
}

/**
 * @param $entity_type
 * @param $bundle
 * @param $field_name
 * @param $delta
 * @param $form_state
 * @return array
 */
function foundation_photo_upload_photo_action($entity_type, $bundle, $field_name, $delta, $form_state) {
  $commands = [];
  $commands[] = ctools_modal_command_dismiss();
  $commands[] = ajax_command_invoke('[data-field="'. $field_name .'"]', 'trigger', ['preview']);
  return $commands;
}

/**
 * @param $file_name
 * @param $destination
 * @return array
 * @throws \Exception
 */
function foundation_photo_save_file_action($file_name, $destination) {
  $q = func_get_args();
  array_shift($q);
  array_shift($q);

  if (!empty($q['validators'])) {
    $validators = $q['validators'];
  }
  else {
    $validators = [
      'file_validate_extensions' => ['jpeg', 'jpg', 'png'],
      'file_validate_size' => 30 * 1024,
    ];
  }

  $destination = file_default_scheme() . '://' . $destination . '/' . implode('/', $q);

  if (file_prepare_directory($destination, FILE_MODIFY_PERMISSIONS|FILE_CREATE_DIRECTORY)) {
    $f = file_save_upload($file_name, $validators, $destination);
    if ($f) {
      $f->realPath = file_create_url($f->uri);
      return ['file' => $f];
    }
    else {
      throw new Exception('File not upload!');
    }
  }
}

/**
 * @param $fid
 * @return array
 */
function foundation_photo_delete_file_action($fid) {
  return ['result' => file_delete(file_load($fid))];
}
