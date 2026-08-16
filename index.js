const express = require('express');
const mineflayer = require('mineflayer');
const app = express();
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

const SERVER_HOST = '5.9.41.143'; 
const SERVER_PORT = 25882;
const BOT_NAME = 'DracoDan';

let bot = null;
let botStatus = '🔴 Devre Dışı';
let logs = [];

function addLog(msg) { 
  logs.push(msg); 
  if (logs.length > 25) logs.shift(); 
}

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DracoDan AFK Panel</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #fff; display: flex; justify-content: center; padding: 20px; margin: 0; }
          .card { background: #1e293b; padding: 20px; border-radius: 15px; width: 100%; max-width: 420px; box-shadow: 0 10px 15px rgba(0,0,0,0.3); }
          button { width: 100%; padding: 14px; margin: 5px 0; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; color: white; font-size: 15px; }
          .start { background: #10b981; } .stop { background: #ef4444; } .send { background: #3b82f6; }
          input { width: 100%; padding: 14px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #fff; margin-bottom: 10px; box-sizing: border-box; font-size: 14px; }
          .log { background: #000; padding: 10px; border-radius: 8px; height: 180px; overflow-y: auto; font-family: monospace; font-size: 12px; margin-top: 15px; color: #22c55e; white-space: pre-wrap; word-break: break-all; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2 style="text-align:center; margin-top:0;">DracoDan AFK Panel</h2>
          <p>Bağlanıyor: <b>${SERVER_HOST}:${SERVER_PORT}</b></p>
          <p>Durum: <b>${botStatus}</b></p>
          <a href="/baslat"><button class="start">BAŞLAT</button></a>
          <a href="/durdur"><button class="stop">DURDUR</button></a>
          <form action="/komut" method="POST" style="margin-top: 10px;">
            <input type="text" name="command" placeholder="Komut yaz (Örn: /login sifre)" required>
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
    botStatus = '🟡 Bağlanıyor...';
    addLog('[SİSTEM] Sunucuya bağlanmaya çalışılıyor...');

    bot = mineflayer.createBot({
      host: SERVER_HOST,
      port: SERVER_PORT,
      username: BOT_NAME,
      version: '1.20.1' // Sunucunun ana protocol sürümüne sabitlendi
    });

    bot.on('spawn', () => { 
      botStatus = '🟢 Sunucuda AFK!'; 
      addLog('[SİSTEM] Oyuna giriş yapıldı.'); 
    });

    bot.on('message', (msg) => { 
      addLog(msg.toString()); 
    });

    bot.on('end', (reason) => { 
      botStatus = '🔴 Bağlantı Kesildi'; 
      addLog('[SİSTEM] Bağlantı kesildi: ' + reason);
      bot = null; 
    });

    bot.on('error', (err) => { 
      botStatus = '🔴 Hata Oluştu'; 
      addLog('[HATA] ' + err.message); 
      bot = null; 
    });
  }
  res.redirect('/');
});

app.get('/durdur', (req, res) => { 
  if (bot) {
    bot.quit(); 
    bot = null; 
  }
  botStatus = '🔴 Devre Dışı'; 
  res.redirect('/'); 
});

app.post('/komut', (req, res) => { 
  if (bot && req.body.command) {
    bot.chat(req.body.command);
    addLog(`<b>[SEN]:</b> ${req.body.command}`);
  }
  res.redirect('/'); 
});

app.listen(PORT);
