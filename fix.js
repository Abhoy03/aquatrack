const fs = require('fs');
let content = fs.readFileSync('C:\\Users\\abhoy\\aquatrack\\app.js', 'utf8');
content = content.replace(/\\`/g, '`');
content = content.replace(/\\\${/g, '${');
fs.writeFileSync('C:\\Users\\abhoy\\aquatrack\\app.js', content, 'utf8');
console.log('Unescaped app.js');
