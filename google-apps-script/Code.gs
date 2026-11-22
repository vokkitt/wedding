const SHEET_NAME = 'Wishes';
const SPREADSHEET_PROPERTY = 'SPREADSHEET_ID';
const SPREADSHEET_NAME_PROPERTY = 'SPREADSHEET_NAME';
const ADMIN_HASH_PROPERTY = 'ADMIN_PASSWORD_SHA256';
const MAX_NAME_LENGTH = 1000;
const MAX_MESSAGE_LENGTH = 1000;
const PUBLIC_PAGE_SIZE = 20;
const ADMIN_PAGE_SIZE = 20;

function setupSheet() {
  const sheet = getOrCreateSheet();
  const headers = ['ID', 'Họ tên', 'Nội dung lời chúc', 'Thời gian gửi'];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else if (sheet.getRange(1, 1, 1, 4).getValues()[0].join('|') !== headers.join('|')) {
    sheet.getRange(1, 1, 1, 4).setValues([headers]);
  }
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, 4);
  sheet.setColumnWidths(1, 1, 260);
  sheet.setColumnWidths(2, 1, 220);
  sheet.setColumnWidths(3, 1, 520);
  sheet.setColumnWidths(4, 1, 180);
}

function getOrCreateSheet() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty(SPREADSHEET_PROPERTY);
  if (!spreadsheetId) throw new Error('Chưa cấu hình SPREADSHEET_ID trong Script Properties.');

  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const configuredName = PropertiesService.getScriptProperties().getProperty(SPREADSHEET_NAME_PROPERTY);
  if (configuredName && spreadsheet.getName() !== configuredName) spreadsheet.rename(configuredName);

  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
  return sheet;
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

function parseBody(request) {
  if (!request.postData || !request.postData.contents) throw new Error('Thiếu dữ liệu gửi đi.');
  const body = JSON.parse(request.postData.contents);
  if (!body || typeof body.action !== 'string') throw new Error('Yêu cầu không hợp lệ.');
  return body;
}

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, maxLength);
}

function vietnamTime() {
  return Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');
}

function sha256(value) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value, Utilities.Charset.UTF_8);
  return bytes.map(function(byte) {
    const hex = (byte < 0 ? byte + 256 : byte).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function doGet(request) {
  try {
    const action = request && request.parameter ? request.parameter.action : '';
    if (action === 'getWishes') {
      const page = Math.max(1, Number(request.parameter.page || 1));
      return getWishes(false, page, PUBLIC_PAGE_SIZE, request.parameter.search || '', request.parameter.sort || 'newest');
    }
    if (action === 'ping') return jsonResponse({ ok: true, data: { service: 'wishes-api', status: 'ready' } });
    return jsonResponse({ ok: false, error: 'Hành động doGet không được hỗ trợ.' });
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message || 'Lỗi máy chủ.' });
  }
}

function doPost(request) {
  try {
    const body = parseBody(request);

    if (body.action === 'submitWish') return submitWish(body);
    if (body.action === 'getWishes') return getWishes(false, Number(body.page || 1), PUBLIC_PAGE_SIZE, body.search || '', body.sort || 'newest');
    if (body.action === 'adminLogin') return adminLogin(body);
    if (body.action === 'adminGetWishes') {
      if (!isValidAdminToken(body.token)) return jsonResponse({ ok: false, error: 'Phiên quản trị đã hết hạn hoặc không hợp lệ.' });
      return getWishes(true, Number(body.page || 1), ADMIN_PAGE_SIZE, body.search || '', body.sort || 'newest');
    }
    if (body.action === 'adminDeleteWish') {
      if (!isValidAdminToken(body.token)) return jsonResponse({ ok: false, error: 'Phiên quản trị đã hết hạn hoặc không hợp lệ.' });
      return deleteWish(body.id);
    }
    if (body.action === 'adminLogout') {
      revokeAdminToken(body.token);
      return jsonResponse({ ok: true, data: { loggedOut: true } });
    }

    return jsonResponse({ ok: false, error: 'Hành động không được hỗ trợ.' });
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message || 'Lỗi máy chủ.' });
  }
}

function submitWish(body) {
  const name = cleanText(body.name, MAX_NAME_LENGTH);
  const message = cleanText(body.message, MAX_MESSAGE_LENGTH);
  const clientId = cleanText(body.clientId, 100);

  if (!name || name.length < 2) return jsonResponse({ ok: false, error: 'Vui lòng nhập họ và tên hợp lệ.' });
  if (!message || message.length < 2) return jsonResponse({ ok: false, error: 'Vui lòng nhập lời chúc.' });
  if (!clientId) return jsonResponse({ ok: false, error: 'Phiên gửi lời chúc không hợp lệ.' });

  const cache = CacheService.getScriptCache();
  const submitKey = 'wish_submit_' + sha256(clientId).slice(0, 48);
  if (cache.get(submitKey)) return jsonResponse({ ok: false, error: 'Bạn vừa gửi lời chúc. Vui lòng đợi 30 giây rồi thử lại.' });

  const duplicateKey = 'wish_duplicate_' + sha256(name + '|' + message).slice(0, 48);
  if (cache.get(duplicateKey)) return jsonResponse({ ok: false, error: 'Lời chúc này đã được ghi nhận gần đây.' });

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return jsonResponse({ ok: false, error: 'Hệ thống đang bận. Vui lòng thử lại.' });

  try {
    setupSheet();
    const sheet = getOrCreateSheet();
    const id = Utilities.getUuid();
    const createdAt = vietnamTime();
    sheet.appendRow([id, name, message, createdAt]);

    cache.put(submitKey, '1', 30);
    cache.put(duplicateKey, '1', 300);
    const wish = { id, name, message, createdAt };
    return jsonResponse({ ok: true, data: { wish } });
  } finally {
    lock.releaseLock();
  }
}

function readWishes(search) {
  setupSheet();
  const sheet = getOrCreateSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const keyword = cleanText(search, 1000).toLowerCase();
  const values = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
  return values.filter(function(row) {
    if (!row.some(function(value) { return String(value).trim() !== ''; })) return false;
    if (!keyword) return true;
    return String(row[1]).toLowerCase().indexOf(keyword) !== -1;
  }).map(function(row) {
    return { id: String(row[0]), name: String(row[1]), message: String(row[2]), createdAt: String(row[3]) };
  }).reverse();
}

function getWishes(admin, page, pageSize, search, sort) {
  const allWishes = readWishes(search);
  if (sort === 'oldest') allWishes.reverse();
  const safePageSize = pageSize > 0 ? pageSize : 20;
  const safePage = Math.max(1, Number(page || 1));
  const total = allWishes.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const currentPage = Math.min(safePage, totalPages);
  const start = (currentPage - 1) * safePageSize;
  const wishes = allWishes.slice(start, start + safePageSize);

  return jsonResponse({
    ok: true,
    data: { wishes, total, page: currentPage, pageSize: safePageSize, totalPages }
  });
}

function deleteWish(id) {
  const safeId = cleanText(id, 100);
  if (!safeId) return jsonResponse({ ok: false, error: 'Thiếu mã lời chúc.' });

  setupSheet();
  const sheet = getOrCreateSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return jsonResponse({ ok: false, error: 'Không tìm thấy lời chúc.' });

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let index = 0; index < ids.length; index++) {
    if (String(ids[index][0]) === safeId) {
      sheet.deleteRow(index + 2);
      return jsonResponse({ ok: true, data: { deletedId: safeId } });
    }
  }

  return jsonResponse({ ok: false, error: 'Không tìm thấy lời chúc.' });
}

function adminLogin(body) {
  const password = cleanText(body.password, 1000);
  const passwordHash = PropertiesService.getScriptProperties().getProperty(ADMIN_HASH_PROPERTY);
  const cache = CacheService.getScriptCache();
  const attemptsKey = 'wish_admin_login_attempts';

  if (!passwordHash) return jsonResponse({ ok: false, error: 'Chưa cấu hình ADMIN_PASSWORD_SHA256 trong Script Properties.' });

  const attempts = Number(cache.get(attemptsKey) || 0);
  if (attempts >= 5) return jsonResponse({ ok: false, error: 'Quá nhiều lần đăng nhập sai. Vui lòng thử lại sau 10 phút.' });

  if (!password || sha256(password).toLowerCase() !== passwordHash.toLowerCase()) {
    cache.put(attemptsKey, String(attempts + 1), 600);
    return jsonResponse({ ok: false, error: 'Mật khẩu quản trị không đúng.' });
  }

  cache.remove(attemptsKey);
  const token = Utilities.getUuid();
  cache.put('wish_admin_' + token, 'valid', 43200);
  return jsonResponse({ ok: true, data: { token } });
}

function isValidAdminToken(token) {
  const safeToken = cleanText(token, 100);
  if (!safeToken) return false;
  return CacheService.getScriptCache().get('wish_admin_' + safeToken) === 'valid';
}

function revokeAdminToken(token) {
  const safeToken = cleanText(token, 100);
  if (safeToken) CacheService.getScriptCache().remove('wish_admin_' + safeToken);
}
