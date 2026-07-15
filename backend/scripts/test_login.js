const http = require('http');

const data = JSON.stringify({ email: 'admin@store.com', password: 'admin123' });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};

const req = http.request(options, (res) => {
  console.log('statusCode:', res.statusCode);
  res.setEncoding('utf8');
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => console.log('body:', body));
});

req.on('error', (e) => console.error('error:', e.message));
req.write(data);
req.end();
