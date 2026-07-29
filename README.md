# Agent Message Box

A deliberately simple GitHub Pages site for an agent to read a static message and submit a response.

Current MVP:
- Static message to the agent.
- Textarea + submit button.
- Local browser timestamped submission record.
- Placeholder for Google Apps Script URL.

Next step:
- Create a dedicated Google Sheet.
- Deploy a Google Apps Script web app that appends every submission to a log and overwrites the latest-message row.
- Paste the Apps Script URL into `GOOGLE_APPS_SCRIPT_URL` in `index.html`.
