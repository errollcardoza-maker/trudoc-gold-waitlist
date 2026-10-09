/**
 * TruDoc Gold waitlist → Google Sheet
 *
 * Paste into the sheet via Extensions → Apps Script, run `setup` once, then
 * Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).
 * See README.md in this folder for the full steps.
 *
 * The website POSTs { secret, rows: [...] } here. Rows already in the sheet
 * (matched by Signup ID) are skipped, so retries never create duplicates.
 */

const SHEET_NAME = 'Signups';
/** Who gets the "N new leads" email. Leave empty ('') to turn alerts off. */
const ALERT_EMAIL = 'ykonduru@trudochealth.com';
const HEADERS = ['Signed up (Dubai time)', 'Name', 'Phone', 'Plan', 'Source', 'Campaign', 'Medium', 'Signup ID'];

/** Run once from the editor: creates the tab and header row, and the shared secret. */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone('Asia/Dubai');
  const sheet = getSheet_();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
  sheet.setFrozenRows(1);

  const props = PropertiesService.getScriptProperties();
  let secret = props.getProperty('SECRET');
  if (!secret) {
    secret = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
    props.setProperty('SECRET', secret);
  }
  Logger.log('Setup done. Copy this secret into Vercel as SHEETS_WEBHOOK_SECRET:\n' + secret);
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'bad_json' });
  }
  const secret = PropertiesService.getScriptProperties().getProperty('SECRET');
  if (!secret || body.secret !== secret) return json_({ ok: false, error: 'unauthorized' });
  if (!Array.isArray(body.rows)) return json_({ ok: false, error: 'no_rows' });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = getSheet_();
    const last = sheet.getLastRow();
    const idCol = HEADERS.length;
    const seen = new Set(
      last > 1 ? sheet.getRange(2, idCol, last - 1, 1).getValues().map((r) => String(r[0])) : [],
    );

    const rows = body.rows
      .filter((r) => r && r.id && !seen.has(String(r.id)))
      .map((r) => [
        new Date(r.createdAt),
        text_(r.name),
        text_(r.phone),
        text_(r.plan),
        text_(r.source),
        text_(r.campaign),
        text_(r.medium),
        String(r.id),
      ]);

    if (rows.length) {
      const range = sheet.getRange(last + 1, 1, rows.length, HEADERS.length);
      range.setValues(rows);
      sheet.getRange(last + 1, 1, rows.length, 1).setNumberFormat('yyyy-mm-dd hh:mm');
      notify_(rows.length, last - 1 + rows.length);
    }
    return json_({ ok: true, appended: rows.length });
  } finally {
    lock.releaseLock();
  }
}

/** One alert email per batch of new rows. Never fails the request: the rows are already saved. */
function notify_(added, total) {
  if (!ALERT_EMAIL) return;
  try {
    const url = SpreadsheetApp.getActiveSpreadsheet().getUrl();
    MailApp.sendEmail({
      to: ALERT_EMAIL,
      subject: 'TruDoc Gold waitlist: ' + added + ' new lead' + (added === 1 ? '' : 's'),
      body:
        added + ' new lead' + (added === 1 ? '' : 's') + ' joined the TruDoc Gold waitlist and ' +
        (added === 1 ? 'was' : 'were') + ' added to the sheet.\n\n' +
        'Open the sheet: ' + url + '\n\n' +
        'Total leads in the sheet: ' + total + '\n',
    });
  } catch (err) {
    console.error('alert email failed: ' + err);
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

/** Keep values as plain text: stops "+971 …" becoming a number and blocks formula injection. */
function text_(v) {
  const s = v == null ? '' : String(v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
