const SPREADSHEET_ID = '1_LqP10O1unoRs7Jw9OYRoCtI3E6LKL2zFfiRfWh_H5I';
const CURRENT_MESSAGE_SHEET = 'current_message';
const MESSAGE_LOG_SHEET = 'message_log';
const MAX_LIST_LIMIT = 50;

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
    const current = ss.getSheetByName(CURRENT_MESSAGE_SHEET);
    const log = ss.getSheetByName(MESSAGE_LOG_SHEET);
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

function doGet(e) {
  try {
    const params = (e && e.parameter) || {};
    const action = params.action || 'status';

    if (action === 'status') {
      return json_({ ok: true, service: 'Agent Message Box Receiver' });
    }

    requireBridgeToken_(params.token || '');

    if (action === 'list') {
      return json_(listMessages_(params));
    }
    if (action === 'latest') {
      return json_(latestMessage_());
    }

    return json_({ ok: false, error: 'unknown action' });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function listMessages_(params) {
  const afterRow = Math.max(1, parseInt(params.after_row || '1', 10) || 1);
  const limit = Math.min(MAX_LIST_LIMIT, Math.max(1, parseInt(params.limit || '10', 10) || 10));
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(MESSAGE_LOG_SHEET);
  const lastRow = sheet.getLastRow();

  if (lastRow <= afterRow) {
    return { ok: true, last_row: lastRow, messages: [] };
  }

  const startRow = afterRow + 1;
  const numRows = Math.min(limit, lastRow - afterRow);
  const values = sheet.getRange(startRow, 1, numRows, 5).getValues();
  const messages = values.map(function(row, index) {
    return rowToMessage_(startRow + index, row);
  });
  return { ok: true, last_row: lastRow, messages: messages };
}

function latestMessage_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(MESSAGE_LOG_SHEET);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return { ok: true, last_row: lastRow, message: null };
  }
  const row = sheet.getRange(lastRow, 1, 1, 5).getValues()[0];
  return { ok: true, last_row: lastRow, message: rowToMessage_(lastRow, row) };
}

function rowToMessage_(rowNumber, row) {
  return {
    row: rowNumber,
    created_at: normalizeCell_(row[0]),
    sender: normalizeCell_(row[1]),
    message: normalizeCell_(row[2]),
    page_url: normalizeCell_(row[3]),
    user_agent: normalizeCell_(row[4])
  };
}

function requireBridgeToken_(provided) {
  const expected = PropertiesService.getScriptProperties().getProperty('BRIDGE_TOKEN');
  if (!expected) {
    throw new Error('BRIDGE_TOKEN script property is not configured');
  }
  if (!provided || provided !== expected) {
    throw new Error('unauthorized');
  }
}

function normalizeCell_(value) {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value == null ? '' : String(value);
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
