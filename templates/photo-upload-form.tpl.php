
<div id="upload-photo-wrapper">

  <div class="photo-upload">
    <input type="file" accept="image/*" id="inputPhoto">
  </div>

  <div id="upload-photo-img-canvas">
    <div class="row">
      <div class="col-sm-6">
        <div id="upload-photo-img-wrapper"></div>
      </div>
      <div class="col-sm-6">
        <div id="upload-photo-img-cropper-preview" style="overflow: hidden; width: 300px; height: 380px;"></div>
        <div class="actions">
          <?php print drupal_render($form['save']); ?>
        </div>
      </div>
    </div>
  </div>

  <?php print drupal_render_children($form); ?>
</div>

