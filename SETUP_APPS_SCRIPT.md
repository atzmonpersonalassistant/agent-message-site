# Connect Google Apps Script

Google Sheet already created:

https://docs.google.com/spreadsheets/d/1_LqP10O1unoRs7Jw9OYRoCtI3E6LKL2zFfiRfWh_H5I/edit

It has:
- `current_message`: one latest message only, overwritten on every submit.
- `message_log`: full timestamped append-only log.

## Manual deployment

1. Open https://script.google.com/home/projects/create
2. Replace the default code with `apps-script/Code.gs` from this repo.
3. Save.
4. Click **Deploy** → **New deployment**.
5. Type: **Web app**.
6. Execute as: **Me**.
7. Who has access: **Anyone**.  
   This is needed because GitHub Pages submits from a public static page.
8. Deploy and authorize.
9. Copy the Web app URL.
10. In `index.html`, replace:

```js
const GOOGLE_APPS_SCRIPT_URL = "";
```

with:

```js
const GOOGLE_APPS_SCRIPT_URL = "PASTE_WEB_APP_URL_HERE";
```

11. Commit and push to GitHub Pages.

## Test

Submit text on the site. It should:
- overwrite `current_message!A2:E2`
- append a row to `message_log`
