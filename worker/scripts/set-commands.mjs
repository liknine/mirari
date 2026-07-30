const { BOT_TOKEN } = process.env;
if (!BOT_TOKEN) {
  console.error('Required: BOT_TOKEN');
  process.exit(1);
}
const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ commands: [
    { command: 'start', description: 'Открыть Mirari' },
    { command: 'admin', description: 'Админка каталога' }
  ] })
});
const data = await response.json();
console.log(JSON.stringify(data, null, 2));
if (!data.ok) process.exit(1);
