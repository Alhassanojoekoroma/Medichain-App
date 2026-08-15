const http = require("http");
const data = JSON.stringify({ email: "aminata.k@email.com", password: "synthetic-pass-123" });
const opts = {
  hostname: "127.0.0.1",
  port: 5000,
  path: "/api/auth/patient/login",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(data),
    "Accept": "application/json"
  }
};
const req = http.request(opts, res => {
  console.log("status", res.statusCode);
  console.log("headers", JSON.stringify(res.headers, null, 2));
  const chunks = [];
  res.on("data", chunk => chunks.push(chunk));
  res.on("end", () => {
    const buf = Buffer.concat(chunks);
    console.log("body length", buf.length);
    console.log("body utf8 prefix", buf.toString("utf8", 0, 200));
    try {
      console.log("json", JSON.parse(buf.toString("utf8")));
    } catch (err) {
      console.error("parse err", err.message);
      console.error("raw hex prefix", buf.toString("hex", 0, 200));
    }
  });
});
req.on("error", err => console.error("req error", err.message));
req.write(data);
req.end();
