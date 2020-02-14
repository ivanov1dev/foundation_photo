
<div id="take-photo-wrapper">

  <div class="row">
    <div class="col-sm-9">
      <div id="take-photo-image-wrapper">
        <div class="photo-image"></div>
        <canvas id="canvas"></canvas>
      </div>
    </div>
    <div class="col-sm-3">
      <div class="camera">
        <video id="video" width="<?php print $form['photo_instance']['#value']['settings']['width']; ?>" autoplay></video>
      </div>
      <div class="preview">
        <div id="photo-preview" style="overflow: hidden; width: <?php print $form['photo_instance']['#value']['settings']['width']; ?>px; height: <?php print $form['photo_instance']['#value']['settings']['height']; ?>px;"></div>
      </div>
      <a href="#" id="btnTakePhoto" class="btn btn-lite glyphicon glyphicon-camera"></a>
      <?php print drupal_render($form['save']); ?>
    </div>
  </div>

  <?php print drupal_render_children($form); ?>
</div>

