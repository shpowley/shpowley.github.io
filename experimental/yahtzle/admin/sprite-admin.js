/**
 * sprite sheet admin tool
 *
 * REQUIRES: canvas.js, sprites.js, util.js
 */

/* global CANVAS SPRITES UTIL */
var
  $id = document.getElementById.bind(document),
  $create = document.createElement.bind(document),

  xhttp = new XMLHttpRequest(),

  LOCALSTORAGE_DATA = "SPRITE-SHEET-ADMIN-DATA",
  LOCALSTORAGE_SPRITESHEET = "SPRITE-SHEET-ADMIN-CONFIGURATION",
  ADMIN_SHEET_ID = "ADMIN",
  BUILDER_CANVAS = "BUILDER-CANVAS",
  BUILDER_ROW_BREAK = "--- ROW BREAK ---",
  COLOR_DISABLED = "color-disabled",

  JSON_TYPES = {
    DESCRIPTOR: "DESCRIPTOR FILE",
    MAP: "SPRITE MAP",
    COMBINED: "SPRITE SHEET + MAP"
  },

  ADMIN_TABS = {
    DESCRIPTOR: "tab-descriptor",
    BUILDER: "tab-builder",
    CACHE: "tab-cache"
  },

  DESCRIPTOR_MODE = {
    ADDING: 0,
    EDITING: 1
  },

  current_tab = ADMIN_TABS.DESCRIPTOR,
  save_data, // localStorage cache data for admin tool
  builder_sprite_buttons_disabled = true,
  builder_base_url = null,
  builder_sprite_sheet = null,
  builder_canvas = null,

  // tabs selectors
  tab_descriptors, tab_builder, tab_cache,

  // content sections
  section_descriptors, section_builder, section_cache,

  // descriptor sprite list
  list_descriptors,
  list_descriptors_selected_index = -1,
  list_descriptors_mode = DESCRIPTOR_MODE.ADDING,

  // descriptor elements
  button_descriptor_up, button_descriptor_edit, button_descriptor_delete, button_descriptor_down,
  button_descriptor_add, button_descriptor_update, button_descriptor_cancel,
  button_descriptor_save, button_descriptor_download,
  text_descriptor_filename, text_descriptor_url,
  label_descriptor_message,

  // builder sprite list
  list_builder,
  list_builder_selected_index = -1,
  list_builder_selected_sprite = null,

  // builder save options
  list_builder_save,

  // builder elements
  button_builder_up, button_builder_preview, button_builder_copy, button_builder_delete, button_builder_next_row, button_builder_down,
  button_builder_set, button_builder_sheet_set, button_builder_generate_sheet,
  button_builder_download, button_builder_save, button_builder_backup, button_builder_restore,
  section_builder_generate_sheet, section_builder_edit, section_builder_preview_content,
  text_builder_url, text_builder_id, text_builder_scale, text_builder_rotation, text_builder_sheet_version, text_builder_sheet_scale,
  label_builder_message,

  // cache sprite list
  list_cache,

  // cache elements
  button_cache_refresh;

function bindHTMLElements() {
  // all tabs
  tab_descriptors = $id("tab-descriptor");
  tab_builder = $id("tab-builder");
  tab_cache = $id("tab-cache");
  section_descriptors = $id("section-descriptor");
  section_builder = $id("section-builder");
  section_cache = $id("section-cache");

  // descriptor tab
  list_descriptors = $id("list-descriptor");
  button_descriptor_up = $id("button-descriptor-up");
  button_descriptor_edit = $id("button-descriptor-edit");
  button_descriptor_delete = $id("button-descriptor-delete");
  button_descriptor_down = $id("button-descriptor-down");
  button_descriptor_add = $id("button-descriptor-add");
  button_descriptor_update = $id("button-descriptor-update");
  button_descriptor_cancel = $id("button-descriptor-cancel");
  button_descriptor_save = $id("button-descriptor-save");
  button_descriptor_download = $id("button-descriptor-download");
  text_descriptor_filename = $id("text-descriptor-filename");
  text_descriptor_url = $id("text-descriptor-url");
  label_descriptor_message = $id("descriptor-status-msg");

  // builder tab
  list_builder = $id("list-builder");
  list_builder_save = $id("list-builder-save");
  button_builder_up = $id("button-builder-up");
  button_builder_preview = $id("button-builder-preview");
  button_builder_copy = $id("button-builder-copy");
  button_builder_delete = $id("button-builder-delete");
  button_builder_next_row = $id("button-builder-next-row");
  button_builder_down = $id("button-builder-down");
  button_builder_set = $id("button-builder-set");
  button_builder_sheet_set = $id("button-builder-sheet-set");
  button_builder_generate_sheet = $id("button-builder-generate-sheet");
  button_builder_download = $id("button-builder-download");
  button_builder_save = $id("button-builder-save");
  button_builder_backup = $id("button-builder-backup");
  button_builder_restore = $id("button-builder-restore");
  section_builder_generate_sheet = $id("builder-generate-sheet");
  section_builder_edit = $id("builder-edit");
  section_builder_preview_content = $id("builder-preview-content");
  text_builder_url = $id("text-builder-url");
  text_builder_id = $id("text-builder-id");
  text_builder_scale = $id("text-builder-scale");
  text_builder_rotation = $id("text-builder-rotation");
  text_builder_sheet_version = $id("text-builder-sheet-version");
  text_builder_sheet_scale = $id("text-builder-sheet-scale");
  label_builder_message = $id("builder-status-msg");

  // cache tab
  list_cache = $id("list-cache");
  button_cache_refresh = $id("button-cache-refresh");
}

function builderBackup() {
  if (builder_sprite_sheet) {
    var
      keys = Object.keys(builder_sprite_sheet.map),
      l = keys.length,
      i = 0,
      sprite, key;

    if (keys.length > 0) {
      var
        data = {
          map: {},
          map_keys: builder_sprite_sheet.map_keys,
          scale: builder_sprite_sheet.scale,
          version: builder_sprite_sheet.version,
          base_url: UTIL.splitURI(builder_sprite_sheet.map[keys[0]].file_name).base
        };

      for (; i < l; i++) {
        key = keys[i],
        sprite = builder_sprite_sheet.map[key];

        data.map[key] = {
          id: key,
          index: i,
          file_name: UTIL.splitURI(sprite.file_name).file,
          rotation: sprite.rotation,
          scale: sprite.scale,
          x: sprite.x,
          y: sprite.y,
          h: sprite.h,
          w: sprite.w
        };
      }

      UTIL.STORAGE.set(LOCALSTORAGE_SPRITESHEET, data); // save to localStorage
      label_builder_message.textContent = "SPRITE SHEET CONFIGURATION SAVED";
    }
  }
}

function builderCopy() {
  var
    sprite = list_builder_selected_sprite;

  if (sprite) {
    var
      option = $create("option"),
      unique_id = sprite.id.slice(0, 2).toUpperCase() + "-",
      i = 1;

    // add list item
    option.text = list_builder.children[list_builder_selected_index].text;
    list_builder.add(option, list_builder_selected_index + 1);

    // add new map / key
    while (builder_sprite_sheet.map[unique_id + i]) {
      i++;
    }

    unique_id = unique_id + i;

    SPRITES.createSprite(unique_id, sprite.file_name, ADMIN_SHEET_ID, sprite.scale, sprite.rotation);
    builder_sprite_sheet.map_keys.pop();
    builder_sprite_sheet.map_keys.splice(list_builder_selected_index + 1, 0, unique_id);

    // sync indexes
    SPRITES.syncMapIndexes(ADMIN_SHEET_ID, list_builder_selected_index + 1);
  }
}

function builderCreateOption(key) {
  var
    option = $create("option");

  option.text = (key === SPRITES.ROW_BREAK_TOKEN ? BUILDER_ROW_BREAK : key);
  list_builder.add(option);
}

function builderCreateSheet() {
  section_builder_preview_content.innerHTML = "";

  if (SPRITES.removeRowBreaks(builder_sprite_sheet.map_keys)) {
    // rebuild sprite sheet list
    list_builder.hidden = true;
    list_builder.innerHTML = "";
    builder_sprite_sheet.map_keys.forEach(builderCreateOption);
    list_builder.hidden = false;
  }

  SPRITES.downloadSprites(ADMIN_SHEET_ID, builderCreateSheetCallback);
}

function builderCreateSheetCallback(image) {
  section_builder_preview_content.appendChild(image);
  list_builder_save.disabled = button_builder_save.disabled = false;
}

function builderDelete() {
  if (list_builder.childElementCount > 0 && list_builder_selected_index > -1) {
    // remove underlying sprite map entry & map_key
    if (list_builder_selected_sprite)
      delete builder_sprite_sheet.map[list_builder_selected_sprite.id];

    builder_sprite_sheet.map_keys.splice(list_builder_selected_index, 1);

    // sync sprite map indexes
    if (builder_sprite_sheet.map_keys.length > 0)
      SPRITES.syncMapIndexes(ADMIN_SHEET_ID, list_builder_selected_index);

    // remove list item
    list_builder.remove(list_builder_selected_index);

    // handle case where all elements deleted
    if (list_builder.childElementCount === 0) {
      list_builder_selected_index = -1;
      list_builder_selected_sprite = null;
      builderSheetDisabled(true);
      builderSpriteDisabled(true);
    }
    else if (list_builder_selected_index <= list_builder.childElementCount - 1) {
      list_builder.selectedIndex = list_builder_selected_index;
      list_builder_selected_sprite = builder_sprite_sheet.map[builder_sprite_sheet.map_keys[list_builder_selected_index]];
    }
    else if (list_builder_selected_index > list_builder.childElementCount - 1) {
      list_builder_selected_index--;
      list_builder.selectedIndex = list_builder_selected_index;
      list_builder_selected_sprite = builder_sprite_sheet.map[builder_sprite_sheet.map_keys[list_builder_selected_index]];
    }
  }
}

function builderDownload(e) {
  e.preventDefault();

  var
    s = text_builder_url.value;

  if (s.length > 0) {
    // cache descriptor URL
    save_data.builder_uri = s;
    UTIL.STORAGE.set(LOCALSTORAGE_DATA, save_data);

    xhttp.addEventListener("readystatechange", xhttpBuilderChange);
    xhttp.open("POST", s, true);
    xhttp.send();
  }

  return false;
}

function builderLoadImage() {
  if (builderUseCanvas()) {
    SPRITES.drawRaw(builder_canvas, ADMIN_SHEET_ID, list_builder_selected_sprite.id, 0, 0);
    section_builder_preview_content.innerHTML = "";
    section_builder_preview_content.appendChild(builder_canvas.canvas);
  }
  else {
    section_builder_preview_content.innerHTML = "";
    section_builder_preview_content.appendChild(this);
  }

  this.removeEventListener("load", builderLoadImage);
}

function builderLoadSpriteInfo() {
  if (list_builder_selected_sprite) {
    text_builder_id.value = (list_builder_selected_sprite.id === UTIL.splitURI(list_builder_selected_sprite.file_name).file ? "" : list_builder_selected_sprite.id); // NOTE: ".file_name" contains full URI and must be split
    text_builder_scale.value = list_builder_selected_sprite.scale;
    text_builder_rotation.value = list_builder_selected_sprite.rotation;
    builderRowbreakDisabled(false);
  }
  else {
    text_builder_id.value = text_builder_scale.value = text_builder_rotation.value = "";
    builderRowbreakDisabled(true);
  }
}

function builderNewRow() {
  var
    option = $create("option");

  option.text = BUILDER_ROW_BREAK;

  if (list_builder_selected_index === -1 || list_builder_selected_index === list_builder.childElementCount - 1) {
    list_builder.add(option);
    builder_sprite_sheet.map_keys.push(SPRITES.ROW_BREAK_TOKEN);
  }
  else {
    list_builder.add(option, list_builder_selected_index + 1);
    builder_sprite_sheet.map_keys.splice(list_builder_selected_index + 1, 0, SPRITES.ROW_BREAK_TOKEN);
    SPRITES.syncMapIndexes(ADMIN_SHEET_ID, list_builder_selected_index + 1);
  }
}

function builderPreview() {
  if (list_builder.childElementCount > 0 && list_builder_selected_index > -1) {
    if (list_builder_selected_sprite.image === null)
      list_builder_selected_sprite.image = new Image();

    var
      sprite_image = list_builder_selected_sprite.image;

    // image not yet downloaded
    if (sprite_image.width === 0) {
      sprite_image.addEventListener("load", builderLoadImage);
      sprite_image.src = builder_base_url + list_builder[list_builder_selected_index].text;
    }

    // image downloaded - must be manipulated
    else if (builderUseCanvas()) {
      SPRITES.drawRaw(builder_canvas, ADMIN_SHEET_ID, list_builder_selected_sprite.id, 0, 0);
      section_builder_preview_content.innerHTML = "";
      section_builder_preview_content.appendChild(builder_canvas.canvas);
    }

    // image downloaded - no modifications
    else {
      section_builder_preview_content.innerHTML = "";
      section_builder_preview_content.appendChild(sprite_image);
    }
  }
}

function builderRestore() {
  var
    data = UTIL.STORAGE.get(LOCALSTORAGE_SPRITESHEET);

  if (data) {
    var
      i = 0,
      l = data.map_keys.length,
      option, key;

    section_builder_preview_content.innerHTML = "";
    builder_sprite_sheet = SPRITES.createSheet(ADMIN_SHEET_ID);
    builder_sprite_sheet.map = data.map;
    builder_sprite_sheet.map_keys = data.map_keys;
    text_builder_sheet_scale.value = builder_sprite_sheet.scale = data.scale;
    text_builder_sheet_version.value = builder_sprite_sheet.version = data.version;
    list_builder.hidden = true;
    list_builder.innerHTML = ""; // remove old file names from list
    list_builder_selected_sprite = null;
    list_builder_selected_index = -1;

    for (; i < l; i++) {
      key = data.map_keys[i];
      option = $create("option");
      option.text = (key === SPRITES.ROW_BREAK_TOKEN ? BUILDER_ROW_BREAK : data.map[key].file_name);
      list_builder.add(option);
      builder_sprite_sheet.map[key].image = null;
      builder_sprite_sheet.map[key].file_name = data.base_url + data.map[key].file_name;
    }

    list_builder.hidden = false;
    builderSheetDisabled(false);
    builderSpriteDisabled(true);
    label_builder_message.textContent = "SPRITE SHEET CONFIGURATION RESTORED";
  }
  else
    label_builder_message.textContent = "NO RESTORE DATA";
}

// specifically for enable/disable of buttons to handle ROW BREAK list items
function builderRowbreakDisabled(isDisabled) {
  if (builder_sprite_buttons_disabled !== isDisabled) {
    builder_sprite_buttons_disabled = text_builder_id.disabled
    = text_builder_scale.disabled = text_builder_rotation.disabled
    = button_builder_set.disabled = button_builder_preview.disabled
    = button_builder_copy.disabled = isDisabled;
  }
}

// downloads a local copy of: sprite map (JSON), sprite sheet (PNG), or combo (JSON)
function builderSaveAs() {
  function createMapSprite(sprite) {
    return {
      id: sprite.id,
      w: sprite.w,
      h: sprite.h,
      x: sprite.x,
      y: sprite.y
    };
  }

  var
    link = $create("a"),
    map = builder_sprite_sheet.map;

  // graphic only
  if (list_builder_save.selectedIndex === 1) {
    link.href = builder_sprite_sheet.image.src;
    link.download = "sheet.png";
  }

  // map only & sprite sheet + map
  else {
    var
      data = {
        version: builder_sprite_sheet.version,
        map: {}
      };

    // sprite map - copy only: id, w, h, x, y
    for (var key in map) {
      if (map.hasOwnProperty(key)) {
        data.map[key] = createMapSprite(map[key]);
      }
    }

    // combined - sprite sheet + map
    if (list_builder_save.selectedIndex === 0) {
      data.type = JSON_TYPES.COMBINED;
      data.image = builder_sprite_sheet.image.src;
      link.download = "combo_map.json";
    }

    // sprite map only
    else {
      data.type = JSON_TYPES.MAP;
      link.download = "map.json";
    }

    link.href = "data:text/html," + JSON.stringify(data);
  }

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function builderSheetSet() {
  var
    scale, version;

  if (UTIL.isNumber(text_builder_sheet_scale.value))
    scale = Number(text_builder_sheet_scale.value);
  else {
    label_builder_message.textContent = "INVALID SHEET DATA";
    return;
  }

  if (builder_sprite_sheet.version !== text_builder_sheet_version.value)
    version = text_builder_sheet_version.value;

  if (scale || version) {
    if (scale === 0)
      builder_sprite_sheet.scale = null;
    else if (builder_sprite_sheet.scale !== scale)
      builder_sprite_sheet.scale = scale;

    if (version)
      builder_sprite_sheet.version = version;

    label_builder_message.textContent = "SHEET UPDATED";
  }
}

function builderSpriteChange() {
  list_builder_selected_index = this.selectedIndex;
  builderSpriteDisabled(false);

  // load info for editing
  list_builder_selected_sprite = builder_sprite_sheet.map[builder_sprite_sheet.map_keys[list_builder_selected_index]];
  builderLoadSpriteInfo();
  label_builder_message.textContent = "";
}

// update sprite info
function builderSpriteSet() {
  if (list_builder_selected_sprite) {
    var
      updated = false,
      renameOK = true;

    if (UTIL.isNumber(text_builder_scale.value) && UTIL.isNumber(text_builder_rotation.value)) {
      var
        scale = Number(text_builder_scale.value),
        rotation = Number(text_builder_rotation.value);

      if (list_builder_selected_sprite.id !== text_builder_id.value) {
        if (SPRITES.renameSprite(ADMIN_SHEET_ID, list_builder_selected_sprite.id, text_builder_id.value))
          updated = true;
        else
          renameOK = false;
      }

      if (renameOK) {
        if (scale === 0) {
          list_builder_selected_sprite.scale = null;
          updated = true;
        }
        else if (list_builder_selected_sprite.scale !== scale) {
          list_builder_selected_sprite.scale = scale;
          updated = true;
        }

        if (rotation === 0) {
          list_builder_selected_sprite.rotation = null;
          updated = true;
        }
        else if (list_builder_selected_sprite.rotation !== text_builder_rotation.value) {
          list_builder_selected_sprite.rotation = rotation;
          updated = true;
        }

        builderLoadSpriteInfo();
      }
    }

    label_builder_message.textContent = updated? "SPRITE UPDATED" : "INVALID SPRITE DATA";
  }
}

// enable / disable buttons relevant for the sheet
function builderSheetDisabled(isDisabled) {
  text_builder_sheet_version.disabled = text_builder_sheet_scale.disabled = button_builder_sheet_set.disabled = button_builder_generate_sheet.disabled = isDisabled;
}

// used for sprite builder > sprite edit state
function builderSpriteDisabled(isDisabled) {
  if (builder_sprite_buttons_disabled !== isDisabled) {
    builder_sprite_buttons_disabled = text_builder_id.disabled
    = text_builder_scale.disabled = text_builder_rotation.disabled
    = button_builder_set.disabled = button_builder_up.disabled
    = button_builder_preview.disabled = button_builder_copy.disabled
    = button_builder_delete.disabled = button_builder_next_row.disabled
    = button_builder_down.disabled = isDisabled;
  }
}

function builderSpriteDown() {
  if (list_builder.childElementCount > 1 && list_builder_selected_index < list_builder.childElementCount - 1) {
    var
      current = list_builder.children[list_builder_selected_index],
      next_index = list_builder_selected_index + 1;

    SPRITES.moveSprite(ADMIN_SHEET_ID, list_builder_selected_index, next_index); // update sprite object indexes

    // move list option
    list_builder.remove(list_builder_selected_index);
    list_builder.add(current, next_index);
    list_builder.selectedIndex = list_builder_selected_index = next_index;
  }
}

function builderSpriteUp() {
  if (list_builder.childElementCount > 1 && list_builder_selected_index > 0) {
    var
      current = list_builder.children[list_builder_selected_index],
      previous_index = list_builder_selected_index - 1;

    SPRITES.moveSprite(ADMIN_SHEET_ID, list_builder_selected_index, previous_index); // update sprite object indexes

    // move list option
    list_builder.remove(list_builder_selected_index);
    list_builder.add(current, previous_index);
    list_builder.selectedIndex = list_builder_selected_index = previous_index;
  }
}

function builderUseCanvas() {
  var
    scale = list_builder_selected_sprite.scale,
    rotation = list_builder_selected_sprite.rotation;

  // determine if a scale / rotate is necessary
  if (scale === null) { // sprite scale has priority
    scale = builder_sprite_sheet.scale;

    if (scale !== null)
      return true;
  }
  else
    return true;

  if (rotation !== null)
    return true;

  return false;
}

function cacheRefresh() {
  var
    keys = Object.keys(localStorage),
    l = keys.length,
    i = 0,
    option;

  for (; i < l; i++) {
    option = $create("option");
    option.text = keys[i];
    list_cache.add(option);
  }
}

function createEvents() {
  // visible tab
  tab_descriptors.addEventListener("click", tabClick);
  tab_builder.addEventListener("click", tabClick);
  tab_cache.addEventListener("click", tabClick);

  // descriptor tab
  button_descriptor_download.addEventListener("click", descriptorDownload);
  list_descriptors.addEventListener("change", descriptorSpriteChange);
  button_descriptor_up.addEventListener("click", descriptorSpriteUp);
  button_descriptor_edit.addEventListener("click", descriptorSpriteEdit);
  button_descriptor_delete.addEventListener("click", descriptorSpriteDelete);
  button_descriptor_down.addEventListener("click", descriptorSpriteDown);
  button_descriptor_add.addEventListener("click", descriptorSpriteSubmit);
  button_descriptor_update.addEventListener("click", descriptorSpriteSubmit);
  button_descriptor_cancel.addEventListener("click", descriptorSpriteSubmit);
  button_descriptor_save.addEventListener("click", descriptorSpriteSave);

  // builder tab
  button_builder_download.addEventListener("click", builderDownload);
  list_builder.addEventListener("change", builderSpriteChange);
  button_builder_up.addEventListener("click", builderSpriteUp);
  button_builder_preview.addEventListener("click", builderPreview);
  button_builder_copy.addEventListener("click", builderCopy);
  button_builder_delete.addEventListener("click", builderDelete);
  button_builder_next_row.addEventListener("click", builderNewRow);
  button_builder_down.addEventListener("click", builderSpriteDown);
  button_builder_set.addEventListener("click", builderSpriteSet);
  button_builder_generate_sheet.addEventListener("click", builderCreateSheet);
  button_builder_sheet_set.addEventListener("click", builderSheetSet);
  button_builder_save.addEventListener("click", builderSaveAs);
  button_builder_backup.addEventListener("click", builderBackup);
  button_builder_restore.addEventListener("click", builderRestore);

  // cache tab
  button_cache_refresh.addEventListener("click", cacheRefresh);
}

function descriptorCheckEditMode() {
  if (list_descriptors_mode === DESCRIPTOR_MODE.EDITING) {
    button_descriptor_add.hidden = false;
    button_descriptor_update.hidden = button_descriptor_cancel.hidden = true;
    list_descriptors_mode = DESCRIPTOR_MODE.ADDING;
    text_descriptor_filename.value = "";
  }
}

function descriptorDownload(e) {
  e.preventDefault();

  var
    s = text_descriptor_url.value;

  if (s.length > 0) {
    save_data.descriptor_uri = s;
    UTIL.STORAGE.set(LOCALSTORAGE_DATA, save_data);

    xhttp.addEventListener("readystatechange", xhttpDescriptorChange);
    xhttp.open("POST", s, true);
    xhttp.send();
  }

  return false;
}

function descriptorSpriteChange() {
  descriptorCheckEditMode();
  list_descriptors_selected_index = this.selectedIndex;
}

function descriptorSpriteDelete() {
  if (list_descriptors.childElementCount > 0 && list_descriptors_selected_index > -1) {
    descriptorCheckEditMode();
    list_descriptors.remove(list_descriptors_selected_index);

    // reposition selected index based on different criteria
    if (list_descriptors.childElementCount === 0)
      list_descriptors_selected_index = -1;
    else if (list_descriptors_selected_index <= list_descriptors.childElementCount - 1)
      list_descriptors.selectedIndex = list_descriptors_selected_index;
    else if (list_descriptors_selected_index > list_descriptors.childElementCount - 1) {
      list_descriptors_selected_index--;
      list_descriptors.selectedIndex = list_descriptors_selected_index;
    }
  }
}

function descriptorSpriteDown() {
  if (list_descriptors.childElementCount > 1 && list_descriptors_selected_index < list_descriptors.childElementCount - 1) {
    var
      current = list_descriptors.children[list_descriptors_selected_index],
      next_index = list_descriptors_selected_index + 1;

    list_descriptors.remove(list_descriptors_selected_index);
    list_descriptors.add(current, next_index);
    list_descriptors.selectedIndex = list_descriptors_selected_index = next_index;
  }
}

function descriptorSpriteEdit() {
  if (list_descriptors.childElementCount > 0 && list_descriptors_selected_index > -1) {
    text_descriptor_filename.value = list_descriptors.children[list_descriptors_selected_index].text;
    button_descriptor_add.hidden = true;
    button_descriptor_update.hidden = button_descriptor_cancel.hidden = false;
    list_descriptors_mode = DESCRIPTOR_MODE.EDITING;
    text_descriptor_filename.select();
    text_descriptor_filename.focus();
  }
}

// save stringified JSON data as a local file
function descriptorSpriteSave() {
  var
    i = 0,
    l = list_descriptors.childElementCount;

  if (l > 0) {
    var
      link = $create("a"),

      sprites_JSON = {
        type: JSON_TYPES.DESCRIPTOR,
        files: []
      };

    for (; i < l; i++) {
      sprites_JSON.files.push(list_descriptors.children[i].text);
    }

    link.href = "data:text/html," + JSON.stringify(sprites_JSON);
    link.download = "images.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function descriptorSpriteSubmit(e) {
  e.preventDefault();

  var
    s = text_descriptor_filename.value;

  if (s.length > 0) {
    if (list_descriptors_mode === DESCRIPTOR_MODE.ADDING) {
      if (descriptorVerifyUniqueName(s)) {
        var
          option = $create("option");

        option.text = s;
        list_descriptors.add(option);
        text_descriptor_filename.value = "";
        label_descriptor_message.textContent = "";
      }
      else
        label_descriptor_message.textContent = "FILE NAME MUST BE UNIQUE";
    }
    else {
      if (this.id === "button-descriptor-cancel") {
        descriptorCheckEditMode();
        label_descriptor_message.textContent = "";
      }
      else {
        if (descriptorVerifyUniqueName(s)) {
          list_descriptors.children[list_descriptors_selected_index].text = s;
          descriptorCheckEditMode();
          label_descriptor_message.textContent = "";
        }
        else
          label_descriptor_message.textContent = "FILE NAME MUST BE UNIQUE";
      }
    }
  }

  return false;
}

function descriptorSpriteUp() {
  if (list_descriptors.childElementCount > 1 && list_descriptors_selected_index > 0) {
    var
      current = list_descriptors.children[list_descriptors_selected_index],
      previous_index = list_descriptors_selected_index - 1;

    list_descriptors.remove(list_descriptors_selected_index);
    list_descriptors.add(current, previous_index);
    list_descriptors.selectedIndex = list_descriptors_selected_index = previous_index;
  }
}

function descriptorVerifyUniqueName(s) {
  for (var i = 0, l = list_descriptors.childElementCount; i < l; i++) {
    if (s === list_descriptors.children[i].text)
      return false;
  }

  return true;
}

function getSaveData() {
  save_data = UTIL.STORAGE.get(LOCALSTORAGE_DATA);

  if (save_data)
    return true;

  else {
    save_data = {
      descriptor_uri: null,
      builder_uri: null
    };

    return false;
  }
}

// controls tab that is visible
function tabClick() {
  if (this.id === current_tab)
    return;

  switch (this.id) {
    case ADMIN_TABS.DESCRIPTOR:
      section_descriptors.hidden = false;
      section_builder.hidden = true;
      section_cache.hidden = true;
      tab_descriptors.classList.remove(COLOR_DISABLED);
      tab_builder.classList.add(COLOR_DISABLED);
      tab_cache.classList.add(COLOR_DISABLED);
      current_tab = ADMIN_TABS.DESCRIPTOR;
      break;

    case ADMIN_TABS.BUILDER:
      section_descriptors.hidden = true;
      section_builder.hidden = false;
      section_cache.hidden = true;
      tab_descriptors.classList.add(COLOR_DISABLED);
      tab_builder.classList.remove(COLOR_DISABLED);
      tab_cache.classList.add(COLOR_DISABLED);
      current_tab = ADMIN_TABS.BUILDER;
      break;

    case ADMIN_TABS.CACHE:
      section_descriptors.hidden = true;
      section_builder.hidden = true;
      section_cache.hidden = false;
      tab_descriptors.classList.add(COLOR_DISABLED);
      tab_builder.classList.add(COLOR_DISABLED);
      tab_cache.classList.remove(COLOR_DISABLED);
      current_tab = ADMIN_TABS.CACHE;
      break;

    default:
      return;
  }
}

function xhttpBuilderChange() {
  if (xhttp.status === 404) {
    label_builder_message.textContent = "UNABLE TO RETRIEVE FILE";
    xhttp.removeEventListener("readystatechange", xhttpBuilderChange);
  }

  if (xhttp.readyState === xhttp.DONE && xhttp.status === 200) {
    var
      data = JSON.parse(xhttp.responseText);

    if (data.type === JSON_TYPES.DESCRIPTOR) {
      var
        files = data.files,
        i = 0,
        l = files.length,
        option;

      if (l > 0) {
        var
          s = null;

        list_builder.hidden = true;
        list_builder.innerHTML = ""; // remove old file names from list
        list_builder_selected_sprite = null;
        list_builder_selected_index = -1;
        builder_base_url = UTIL.splitURI(text_builder_url.value).base;
        builder_sprite_sheet = SPRITES.createSheet(ADMIN_SHEET_ID);

        // add file names from json file
        for (; i < l; i++) {
          option = $create("option");
          option.text = s = files[i];
          list_builder.add(option);

          // NOTE: sprite ID is initially set to the name of the file and can be renamed through the interface
          SPRITES.createSprite(s, builder_base_url + s, ADMIN_SHEET_ID);
        }

        list_builder.hidden = false;
        text_builder_sheet_scale.value = text_builder_sheet_version.value = "";
        builderSheetDisabled(false);
        builderSpriteDisabled(true);
      }

      label_builder_message.textContent = "";
    }
    else {
      label_builder_message.textContent = "JSON DATA INVALID FORMAT";
      xhttp.removeEventListener("readystatechange", xhttpBuilderChange);
    }
  }
}

function xhttpDescriptorChange() {
  if (xhttp.status === 404) {
    label_descriptor_message.textContent = "UNABLE TO RETRIEVE FILE";
    xhttp.removeEventListener("readystatechange", xhttpDescriptorChange);
    return;
  }

  if (xhttp.readyState === xhttp.DONE && xhttp.status === 200) {
    var
      data = JSON.parse(xhttp.responseText);

    if (data.type === JSON_TYPES.DESCRIPTOR) {
      var
        files = data.files,
        i = 0,
        l = files.length,
        option;

      descriptorCheckEditMode(); // change edit mode
      list_descriptors.innerHTML = ""; // remove old file names from list
      list_descriptors_selected_index = -1;

      // add file names from json file
      for (; i < l; i++) {
        option = $create("option");
        option.text = files[i];
        list_descriptors.add(option);
      }

      label_descriptor_message.textContent = "";
    }
    else {
      label_descriptor_message.textContent = "JSON DATA INVALID FORMAT";
      xhttp.removeEventListener("readystatechange", xhttpDescriptorChange);
    }
  }
}

window.addEventListener("load", function() {
  bindHTMLElements();
  createEvents();

  // read data from localStorage
  if (getSaveData()) {
    text_descriptor_url.value = save_data.descriptor_uri;
    text_builder_url.value = save_data.builder_uri ? save_data.builder_uri : save_data.descriptor_uri;
  }

  // additional setup
  builder_canvas = CANVAS.add(BUILDER_CANVAS);
  builder_canvas.width = 200;
  builder_canvas.height = 200;
});