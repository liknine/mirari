const { BOT_TOKEN, WORKER_URL, WEBHOOK_SECRET } = process.env;
if (!BOT_TOKEN || !WORKER_URL || !WEBHOOK_SECRET) {
  console.error('Required: BOT_TOKEN, WORKER_URL, WEBHOOK_SECRET');
  process.exit(1);
}
const webhookUrl = `${WORKER_URL.replace(/\/$/, '')}/telegram/webhook`;
const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: webhookUrl,
    secret_token: WEBHOOK_SECRET,
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: false
  })
});
const data = await response.json();
console.log(JSON.stringify(data, null, 2));
if (!data.ok) process.exit(1);
