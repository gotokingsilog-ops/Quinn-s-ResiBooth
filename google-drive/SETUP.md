# RESIBOOTH Google Drive setup (one time, ~5 minutes)

1. In Google Drive, create a folder for the event (e.g. "Kim & Leo Wedding Photos").
   - Right click > Share > General access > **Anyone with the link** > Viewer.
   - Copy the folder ID: the last part of the folder 
     `https://drive.google.com/drive/folders/<FOLDER_ID>`.
   - Copy the folder link too; it goes into the QR field.
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
   - Paste the folder link into **QR code link**
   - Press **Test connection** (should show the folder name), then **Save**.

If you edit the script later, use Deploy > Manage deployments > edit > New version.
The URL stays the same.

Offline behaviour: photos are queued on the tablet (IndexedDB) and uploaded when
the connection returns. Receipts always print immediately.

LOCAL SETUP:

cd resibooth && python3 -m http.server 8765
