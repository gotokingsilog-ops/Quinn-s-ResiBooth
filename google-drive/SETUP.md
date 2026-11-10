# RESIBOOTH Google Drive setup (one time, ~5 minutes)

1. In Google Drive, create ONE main folder, e.g. "RESIBOOTH Events". You only do this once.
   - Copy the folder ID: the last part of the folder link
     `https://drive.google.com/drive/folders/<FOLDER_ID>`.
   - Each event gets its own sub-folder inside it, created and shared
     ("Anyone with the link") automatically. Guests never get the folder link:
     the receipt QR only opens their own photo.
2. Go to https://script.google.com > New project. Replace the code with `Code.gs`.
3. Set `FOLDER_ID` and `SECRET` (any long random string) at the top of the script. Save.
4. Deploy > New deployment > type **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Authorize when prompted (Advanced > Go to project > Allow).
5. Copy the **Web app URL** (ends in `/exec`).
6. In RESIBOOTH: open Admin > **4. Google Drive & QR**
   - Turn on **Upload photos to Drive**
   - Paste the Web app URL and the same SECRET
   - Type the **Event Folder Name** (blank = uses the Event Title)
   - Press **Test & get folder link** (shows the event folder and fills the QR link), then **Save**.

QR ON THE RECEIPT: by default it opens that guest's own photo (Admin > "QR Code Opens").
The guest page (photo.html) shows "still uploading" until the photo reaches Drive,
then shows it with a Download button. Set it to "The whole event folder" to go back
to the old behaviour (then every guest can see every photo).

NEW EVENT: just change the **Event Folder Name** in the app and press **Save**.
The new folder is created and the QR link updates by itself. No script changes.

If you edit the script later, use Deploy > Manage deployments > edit > New version.
The URL stays the same.

Offline behaviour: photos are queued on the tablet (IndexedDB) and uploaded when
the connection returns. Receipts always print immediately.

LOCAL SETUP:

cd resibooth && python3 -m http.server 8765
