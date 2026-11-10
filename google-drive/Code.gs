/**
 * RESIBOOTH -> Google Drive receiver (Google Apps Script Web App)
 *
 * SETUP (see SETUP.md):
 *  1. Set FOLDER_ID below to your MAIN RESIBOOTH folder (set it once, never again).
 *     Each event gets its own sub-folder inside it, created automatically from
 *     the "Event Folder Name" in the app's admin console.
 *  2. Set SECRET to a long random string. Paste the same value in the
 *     RESIBOOTH admin console (Google Drive & QR tab).
 *  3. Deploy > New deployment > Web app
 *       Execute as: Me   |   Who has access: Anyone
 *  4. Copy the Web app URL (ends in /exec) into the admin console.
 */
var FOLDER_ID = 'PASTE_FOLDER_ID_HERE';
var SECRET    = 'PASTE_LONG_RANDOM_SECRET_HERE';

// RUN THIS ONCE from the editor (select "authorizeDrive" > Run) to grant Drive access.
// It must finish with a folder name in the Execution log, not an error.
function authorizeDrive() {
  var folder = DriveApp.getFolderById(FOLDER_ID);
  Logger.log('OK, can access folder: ' + folder.getName());
  var t = folder.createFile('resibooth-auth-test.txt', 'ok');   // also needs write access
  t.setTrashed(true);
  Logger.log('OK, can write to folder.');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Returns the folder for this event: a sub-folder of the main folder with the
// event's name. Created (and shared "Anyone with the link can view") if new.
// No event name -> the main folder itself (old behaviour).
function eventFolder_(eventName) {
  var main = DriveApp.getFolderById(FOLDER_ID);
  var name = String(eventName || '').replace(/[\/\\]/g, '-').trim().slice(0, 100);
  if (!name) return main;

  var lock = LockService.getScriptLock();   // two tablets must not create the folder twice
  lock.waitLock(20000);
  try {
    var found = main.getFoldersByName(name);
    if (found.hasNext()) return found.next();
    var folder = main.createFolder(name);
    try {
      folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (shareErr) { /* sharing blocked by account policy; share it by hand */ }
    return folder;
  } finally {
    lock.releaseLock();
  }
}

// Connection test / get event folder link:  GET <url>?secret=...&event=...
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.secret !== SECRET) return json_({ ok: false, error: 'bad secret' });
  try {
    var folder = eventFolder_(p.event);
    return json_({ ok: true, folder: folder.getName(), url: folder.getUrl() });
  } catch (err) {
    return json_({ ok: false, error: 'folder not found / no access: ' + err });
  }
}

// Photo upload:  POST (text/plain body = JSON)
//   { secret, event, sessionId, filename, mime, data(base64, no prefix) }
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.secret !== SECRET) return json_({ ok: false, error: 'bad secret' });
    if (!body.data || !body.filename) return json_({ ok: false, error: 'missing data' });

    var folder = eventFolder_(body.event);
    var safeName = String(body.filename).replace(/[^\w.\- ]/g, '_');

    // Idempotent: if a retry re-sends the same file, don't duplicate it.
    var existing = folder.getFilesByName(safeName);
    if (existing.hasNext()) {
      var f0 = existing.next();
      return json_({ ok: true, duplicate: true, id: f0.getId(), url: f0.getUrl() });
    }

    var blob = Utilities.newBlob(
      Utilities.base64Decode(body.data), body.mime || 'image/jpeg', safeName);
    var file = folder.createFile(blob);
    return json_({ ok: true, id: file.getId(), url: file.getUrl(), folder: folder.getName() });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}
