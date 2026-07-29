const SPREADSHEET_ID = '1_LqP10O1unoRs7Jw9OYRoCtI3E6LKL2zFfiRfWh_H5I';

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    const createdAt = payload.created_at || new Date().toISOString();
    const sender = payload.sender || 'agent';
    const message = payload.message || '';
    const pageUrl = payload.page_url || '';
    const userAgent = payload.user_agent || '';

    if (!message.trim()) {
      return json_({ ok: false, error: 'empty message' });
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const current = ss.getSheetByName('current_message');
    const log = ss.getSheetByName('message_log');
    const row = [createdAt, sender, message, pageUrl, userAgent];

    // Keep only the latest message in current_message: headers in row 1, latest in row 2.
    current.getRange('A2:E2').clearContent();
    current.getRange(2, 1, 1, row.length).setValues([row]);

    // Append full timestamped history.
    log.appendRow(row);

    return json_({ ok: true, created_at: createdAt });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function doGet() {
  return json_({ ok: true, service: 'Agent Message Box Receiver' });
}

function parsePayload_(e) {
  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (_) {
      return { message: e.postData.contents };
    }
  }
  return {};
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
