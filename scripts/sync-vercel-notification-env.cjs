const fs = require('node:fs');
const { randomBytes } = require('node:crypto');
const { spawn } = require('node:child_process');

let env = fs.readFileSync('.env', 'utf8');
function read(name) {
  const line = env.split(/\r?\n/).find(value => value.startsWith(`${name}=`));
  if (!line) throw new Error(`${name} missing from local .env`);
  return line.slice(name.length + 1).trim().replace(/^"|"$/g, '');
}

function add(name, value) {
  return new Promise((resolve, reject) => {
    const command = `vercel env add ${name} production --sensitive --force`;
    const child = process.platform === 'win32'
      ? spawn('cmd.exe', ['/d', '/s', '/c', command], { stdio: ['pipe', 'inherit', 'inherit'] })
      : spawn('sh', ['-c', command], { stdio: ['pipe', 'inherit', 'inherit'] });
    child.stdin.end(value);
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`${name} update failed (${code})`)));
  });
}

(async () => {
  const cronSecret = randomBytes(32).toString('base64url');
  env = env.replace(/^CRON_SECRET=.*(?:\r?\n|$)/m, '');
  fs.writeFileSync('.env', `${env.trimEnd()}\nCRON_SECRET=${cronSecret}\n`);
  await add('TELEGRAM_BOT_TOKEN', read('TELEGRAM_BOT_TOKEN'));
  await add('TELEGRAM_OWNER_CHAT_ID', read('TELEGRAM_OWNER_CHAT_ID'));
  await add('CRON_SECRET', cronSecret);
  console.log('Notification environment variables updated without trailing newlines.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
