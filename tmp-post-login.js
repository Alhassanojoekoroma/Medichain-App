const http = require("http");
const loginData = JSON.stringify({ email: "aminata.k@email.com", password: "synthetic-pass-123" });
const postOpts = { hostname: "127.0.0.1", port: 5000, path: "/api/auth/patient/login", method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(loginData), "Accept": "application/json" } };
const req = http.request(postOpts, res => {
  const chunks = [];
  res.on("data", c => chunks.push(c));
  res.on("end", async () => {
    const body = Buffer.concat(chunks).toString("utf8");
    console.log('login-status', res.statusCode);
    console.log('login-body-prefix', body.slice(0,200));
    try {
      const login = JSON.parse(body);
      const token = login.token;
      const get = path => new Promise((resolve,reject) => {
        const opts = { hostname: "127.0.0.1", port: 5000, path, method: "GET", headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } };
        const req = http.request(opts, res => {
          const chunks = [];
          res.on('data', c => chunks.push(c));
          res.on('end', () => {
            const buf = Buffer.concat(chunks);
            const text = buf.toString('utf8');
            console.log(path, 'status', res.statusCode, 'len', buf.length, 'prefix', text.slice(0,200));
            try { resolve(JSON.parse(text)); } catch (err) { reject(err); }
          });
        });
        req.on('error', reject);
        req.end();
      });
      await get('/api/patients/me');
      await get('/api/records/mine');
      console.log('post-login endpoints returned valid JSON');
    } catch (err) {
      console.error('error', err.message);
    }
  });
});
req.on('error', err => console.error('login-req-error', err.message));
req.write(loginData);
req.end();
