const fs = require('fs');
const path = require('path');

const dir = 'c:\\web develoment\\odoo_ERP\\shiv-erp\\src\\app\\api';

function walk(directory) {
  let files = [];
  const list = fs.readdirSync(directory);
  for (const file of list) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      files = files.concat(walk(filePath));
    } else if (file.endsWith('.ts')) {
      files.push(filePath);
    }
  }
  return files;
}

const files = walk(dir);
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('as unknown as Record<string, unknown>')) {
    content = content.replace(/as unknown as Record<string, unknown>/g, 'as any');
    fs.writeFileSync(f, content);
    console.log('Fixed ' + f);
  }
});
