const express = require('express');
const mineflayer = require('mineflayer');

const app = express();
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

let bot = null;
let botStatus = 'Devre Dışı';
let logs = [];

function addLog(msg) {
  logs.push(msg);
  if (logs.length > 20) logs.shift();
}

app.get('/', (req, res) => {
  res.send(`
    <div style="max-width:500px; margin:30px auto; font-family:sans-serif; text-align:center;">
      <h2>DracoDan AFK Bot Paneli</h2>
      <p>Durum: <b>${botStatus}</b></p>
      
      <div style="margin-bottom:15px;">
        <a href="/baslat"><button style="padding:10px 20px; background:green; color:white; border:none; border-radius:5px; cursor:pointer;">Botu Başlat</button></a>
        <a href="/durdur"><button style="padding:10px 20px; background:red; color:white; border:none; border-radius:5px; cursor:pointer;">Botu Durdur</button></a>
      </div>

      <form action="/komut" method="POST" style="margin-bottom:20px;">
        <input type="text" name="command" placeholder="/login şifre veya mesaj" style="width:70%; padding:10px;" required>
        <button type="submit" style="padding:10px; background:#008CBA; color:white; border:none; border-radius:5px;">Gönder</button>
      </form>

      <div style="background:#222; color:#0f0; padding:10px; text-align:left; height:200px; overflow-y:auto; border-radius:5px; font-family:monospace;">
        <b>--- Oyun Chat Logları ---</b><br>
        ${logs.join('<br>')}
      </div>
    </div>
  `);
});

app.get('/baslat', (req, res) => {
  if (!bot) {
    bot = mineflayer.createBot({
      host: 'dracoda.funserver.top', 
      port: 25882,                  
      username: 'DracoDan' 
    });

    bot.on('spawn', () => { 
      botStatus = 'Sunucuda AFK!'; 
      addLog('[SİSTEM] Başarıyla oyuna girildi.');
    });

    bot.on('message', (message) => {
      addLog(message.toString());
    });

    bot.on('end', () => { 
      botStatus = 'Bağlantı Kesildi'; 
      addLog('[SİSTEM] Bağlantı kesildi.');
      bot = null; 
    });

    bot.on('error', (err) => { 
      botStatus = 'Hata Oluştu'; 
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
    botStatus = 'Devre Dışı'; 
  }
  res.redirect('/');
});

app.post('/komut', (req, res) => {
  const cmd = req.body.command;
  if (bot && cmd) {
    bot.chat(cmd);
    addLog(`<b>[SEN]:</b> ${cmd}`);
  } else {
    addLog('[SİSTEM] Önce botu başlatmalısın!');
  }
  res.redirect('/');
});

app.listen(PORT, () => console.log('Panel hazır!'));
