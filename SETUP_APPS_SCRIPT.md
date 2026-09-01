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
4. In Apps Script, open **Project Settings** → **Script properties**.
5. Add `BRIDGE_TOKEN` with a random secret value. Do not put this value in GitHub Pages.
6. Click **Deploy** → **New deployment**.
7. Type: **Web app**.
8. Execute as: **Me**.
9. Who has access: **Anyone**.
   This is needed because GitHub Pages submits from a public static page.
10. Deploy and authorize.
11. Copy the Web app URL.
12. In `index.html`, replace:

```js
const GOOGLE_APPS_SCRIPT_URL = "";
```

with:

```js
const GOOGLE_APPS_SCRIPT_URL = "PASTE_WEB_APP_URL_HERE";
```

13. Commit and push to GitHub Pages.

## Write test

Submit text on the site. It should:
- overwrite `current_message!A2:E2`
- append a row to `message_log`

## Bridge read API

The bridge reads rows with the token stored in Apps Script properties:

```text
GET WEB_APP_URL?action=list&after_row=1&limit=10&token=BRIDGE_TOKEN
GET WEB_APP_URL?action=latest&token=BRIDGE_TOKEN
```

Responses are JSON and include row numbers from `message_log`. The bridge stores the last processed row locally so rows are not replayed.
