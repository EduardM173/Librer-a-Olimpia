function ok(res, data, meta) { res.json({ ok: true, data, meta }); }
function fail(res, code = 500, msg = 'server_error') { res.status(code).json({ ok: false, error: msg }); }
module.exports = { ok, fail };
