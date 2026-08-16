const express = require('express');
const mineflayer = require('mineflayer');

const app = express();
const PORT = process.env.PORT || 3000;

let bot = null;
let botStatus = 'Devre Dışı';

app.get('/', (req, res) => {
  res.send(`
    <div style="text-align:center; margin-top:50px; font-family:sans-serif;">
      <h1>AFK Bot Kontrol Paneli</h1>
      <p>Durum: <b>${botStatus}</b></p>
      <a href="/baslat"><button style="padding:10px 20px; background:green; color:white; border:none; border-radius:5px; cursor:pointer;">Botu Başlat</button></a>
      <a href="/durdur"><button style="padding:10px 20px; background:red; color:white; border:none; border-radius:5px; cursor:pointer;">Botu Durdur</button></a>
    </div>
  `);
});

app.get('/baslat', (req, res) => {
  if (!bot) {
    bot = mineflayer.createBot({
      host: 'dracodan.funserver.top', // Örn: play.hypixel.net veya localhost
      port: 25882,                  // Port numarası
      username: 'DracoDan' // Botun oyundaki adı
    });

    bot.on('spawn', () => { botStatus = 'Sunucuda AFK!'; });
    bot.on('end', () => { botStatus = 'Bağlantı Kesildi'; bot = null; });
    bot.on('error', () => { botStatus = 'Hata Oluştu'; bot = null; });
  }
  res.redirect('/');
});

app.get('/durdur', (req, res) => {
  if (bot) { bot.quit(); bot = null; botStatus = 'Devre Dışı'; }
  res.redirect('/');
});

app.listen(PORT, () => console.log('Panel hazır!'));
