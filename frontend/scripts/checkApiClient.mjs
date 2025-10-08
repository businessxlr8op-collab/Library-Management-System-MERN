import http from 'http';

function main() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5000/api/books?page=1&limit=1', (res) => {
      console.log('Status:', res.statusCode, res.statusMessage);
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => raw += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(raw);
          console.log('Body keys:', Object.keys(json));
          if (json && json.data && Array.isArray(json.data)) console.log('Got data length:', json.data.length);
        } catch (e) {
          console.log('Non-JSON response, length:', raw.length);
        }
        resolve();
      });
    });
    req.on('error', (err) => {
      console.error('Request error:', err.message || err);
      resolve();
    });
  });
}

main();
