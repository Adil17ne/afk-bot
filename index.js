const express = require('express');
const mineflayer = require('mineflayer');
const app = express();
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
let bot = null;
let botStatus = '🔴 Devre Dışı';
let logs = [];

function addLog(msg) { logs.push(msg); if (logs.length > 20) logs.shift(); }

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #fff; display: flex; justify-content: center; padding: 20px; margin: 0; }
          .card { background: #1e293b; padding: 20px; border-radius: 15px; width: 100%; max-width: 400px; box-shadow: 0 10px 15px rgba(0,0,0,0.3); }
          button { width: 100%; padding: 15px; margin: 5px 0; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; color: white; font-size: 15px; }
          .start { background: #10b981; } .stop { background: #ef4444; } .send { background: #3b82f6; }
          input { width: 100%; padding: 15px; border-radius: 8px; border: none; margin-bottom: 10px; box-sizing: border-box; font-size: 14px; }
          .log { background: #000; padding: 10px; border-radius: 8px; height: 160px; overflow-y: auto; font-family: monospace; font-size: 12px; margin-top: 15px; color: #22c55e; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2 style="text-align:center; margin-top:0;">DracoDan AFK Panel</h2>
          <p>Durum: <b>${botStatus}</b></p>
          <a href="/baslat"><button class="start">BAŞLAT</button></a>
          <a href="/durdur"><button class="stop">DURDUR</button></a>
          <form action="/komut" method="POST" style="margin-top: 10px;">
            <input type="text" name="command" placeholder="Komut yaz (/login şifre)" required>
            <button class="send" type="submit">GÖNDER</button>
          </form>
          <div class="log">${logs.join('<br>')}</div>
        </div>
      </body>
    </html>
  `);
});

app.get('/baslat', (req, res) => {
  if (!bot) {
    bot = mineflayer.createBot({
      host: 'dracodan.funserver.top', // Doğru adrese güncellendi
      port: 25882,
      username: 'DracoDan'
    });
    botStatus = '🟡 Bağlanıyor...';
    bot.on('spawn', () => { botStatus = '🟢 Sunucuda AFK!'; addLog('[SİSTEM] Oyuna girildi.'); });
    bot.on('message', (msg) => { addLog(msg.toString()); });
    bot.on('end', () => { botStatus = '🔴 Bağlantı Kesildi'; bot = null; });
    bot.on('error', (err) => { botStatus = '🔴 Hata!'; addLog('[HATA] ' + err.message); bot = null; });
  }
  res.redirect('/');
});

app.get('/durdur', (req, res) => { if (bot) bot.quit(); bot = null; botStatus = '🔴 Devre Dışı'; res.redirect('/'); });
app.post('/komut', (req, res) => { if (bot && req.body.command) bot.chat(req.body.command); res.redirect('/'); });
app.listen(PORT);
