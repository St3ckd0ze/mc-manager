const express = require('express');
const bodyParser = require('body-parser');
const backupRoutes = require('./public/routes/backup.js');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const zlib = require('zlib');
const nbt = require('prismarine-nbt');
const { exec } = require('child_process');
const { Rcon } = require('rcon-client');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = 3010;

// Pfade
const levelDatPath = '/home/ubuntu/game_servers/minecraft/paper_1-21-4/world/level.dat';
const playersFile = './players.json';
const statsDir = '/home/ubuntu/game_servers/minecraft/paper_1-21-4/world/stats';
const userCacheFile = '/home/ubuntu/game_servers/minecraft/paper_1-21-4/usercache.json';

let rcon = null;
let isConnected = false;

// Statische Ordner
app.use(express.static('public'));
app.use('/dist', express.static('dist'));
app.use('/api/backup', backupRoutes);
console.log("Backup-Routen wurden registriert");

// Body Parser
app.use(bodyParser.json());

// CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Expose-Headers", "Authorization");
    next();
});

/** -------------------
 *  USER MANAGEMENT
 * ------------------ */
const userList = new Map();
userList.set("thomas", { userID:"thomas", password:"superKlasse!", firstName:"Thomas", lastName:"Wiethaup", role:"admin" });
userList.set("nicklas", { userID:"nicklas", password:"314159", firstName:"Nicklas", lastName:"Schwend", role:"manager" });
userList.set("sabine", { userID:"sabine", password:"tgswh14", firstName:"Sabine", lastName:"Wiethaup", role:"user" });
userList.set("verena", { userID:"verena", password:"V280874S", firstName:"Verena", lastName:"Schwend", role:"user" });
userList.set("alex", { userID:"alex", password:"4206", firstName:"Alex", lastName:"Liebherr", role:"user" });

// LOGIN
app.get('/api/login', (req,res)=>{
    if (!req.headers.authorization) return res.status(401).send({Error:'Authorization header missing'});
    try {
        const base64 = req.headers.authorization.split(' ')[1];
        const [userID, password] = Buffer.from(base64,'base64').toString().split(':');
        const user = userList.get(userID);
        if(user && user.password === password){
            const {firstName,lastName,role} = user;
            return res.status(200).send({userID, firstName, lastName, role});
        }
        return res.status(401).send({Error:'Invalid login data'});
    } catch(e){
        return res.status(401).send({Error:'Invalid login data'});
    }
});

// CRUD USERS
app.post('/api/users', (req,res)=>{
    const u=req.body;
    if(!u||!u.userID||!u.password) return res.status(400).send({Error:'Incomplete data in body'});
    if(userList.get(u.userID)) return res.status(400).send({Error:'User already exists'});
    userList.set(u.userID,u);
    res.status(200).send({Info:`Added user ${u.userID}`, Count:`Have ${userList.size} users`});
});
app.get('/api/users',(req,res)=>res.status(200).send(Array.from(userList.values())));
app.get('/api/users/count',(req,res)=>res.status(200).send({UserCount:userList.size}));
app.get('/api/users/:id',(req,res)=>{const u=userList.get(req.params.id); if(!u) return res.status(404).json({message:'User not found'}); res.json(u);});
app.put('/api/users/:id',(req,res)=>{const c=userList.get(req.params.id);const u=req.body;if(!c) return res.status(404).json({message:'User not found'}); if(!u.userID||!u.password) return res.status(400).json({message:'UserID and password required'}); Object.assign(c,u); userList.set(req.params.id,c); res.status(200).json(c);});
app.delete('/api/users/:id',(req,res)=>{if(!userList.has(req.params.id)) return res.status(404).json({message:'User not found'}); userList.delete(req.params.id); res.status(204).send();});

/** -------------------
 *  TMUX COMMANDS
 * ------------------ */
app.post('/api/tmux/command',(req,res)=>{const cmd=req.body.command; if(!cmd) return res.status(400).json({error:"Kein Befehl angegeben"}); exec(`tmux send-keys -t mc_session "${cmd}" Enter`,(err)=>{if(err) return res.status(500).json({error:err.message}); res.status(200).json({message:"Befehl ausgeführt"});});});
app.get('/api/tmux/output',(req,res)=>{exec('tmux capture-pane -t mc_session:0.0 -p -S -100',(err,stdout)=>{if(err) return res.status(500).json({error:err.message}); res.json({output:stdout});});});

/** -------------------
 *  MC TIME
 * ------------------ */
app.get('/api/mctime',(req,res)=>{
    fs.readFile(levelDatPath,(err,data)=>{
        if(err) return res.status(500).json({error:'Datei konnte nicht gelesen werden'});
        zlib.gunzip(data,(err2,buffer)=>{
            if(err2) return res.status(500).json({error:'Fehler beim Entpacken'});
            nbt.parse(buffer,(err3,result)=>{
                if(err3) return res.status(500).json({error:'Fehler beim Parsen'});
                try{
                    const longTime=result.value.Data.value.DayTime.value;
                    const mcTime=longTime[0]*2**32+longTime[1];
                    res.json({time:mcTime%24000});
                }catch(e){res.status(500).json({error:'Fehler beim Auslesen'});}
            });
        });
    });
});

/** -------------------
 *  RCON
 * ------------------ */
async function getRconConnection(){
    if(rcon && isConnected) return rcon;
    rcon = new Rcon({host:'127.0.0.1',port:25575,password:'superTollesPasswort!'});
    rcon.on('connect',()=>{console.log('RCON verbunden'); isConnected=true;});
    rcon.on('end',()=>{console.log('RCON Verbindung geschlossen'); isConnected=false; rcon=null;});
    rcon.on('error',(err)=>console.error('RCON Fehler:',err));
    await rcon.connect();
    isConnected=true;
    return rcon;
}
async function sendRconCommand(cmd){const c=await getRconConnection(); return c.send(cmd);}
app.post('/api/rcon/save-all',async (req,res)=>{try{const r=await sendRconCommand('save-all'); res.json({success:true,message:'save-all Befehl gesendet',result:r});}catch(e){res.status(500).json({success:false,error:e.message});}});

/** -------------------
 *  PLAYERS
 * ------------------ */
function loadPlayers(){try{if(fs.existsSync(playersFile)){const d=JSON.parse(fs.readFileSync(playersFile,'utf8')); if(Array.isArray(d)) return d;}return [];}catch(e){console.error('Fehler beim Laden players.json:',e); return [];} }
function savePlayers(p){try{fs.writeFileSync(playersFile,JSON.stringify(p,null,2));}catch(e){console.error('Fehler beim Speichern players.json:',e);}}

app.get('/api/mc/players', async (req, res) => {
    try {
        // 1. players.json laden
        let players = loadPlayers();

        // 2. usercache.json laden und neue Spieler hinzufügen
        const cached = loadUserCache();
        for (let entry of cached) {
            if (!players.find(p => p.name === entry.name)) {
                players.push({
                    name: entry.name,
                    uuid: entry.uuid,
                    online: false // standardmäßig offline
                });
            }
        }

        // 3. Online-Status via RCON abrufen
        const r = await sendRconCommand('list');
        const match = r.match(/players online:\s*(.*)/);
        const onlineNames = match && match[1].trim().length
            ? match[1].split(',').map(n => n.trim())
            : [];

        // 4. Online-Status in players.json setzen
        for (let p of players) {
            p.online = onlineNames.includes(p.name);
            if (!p.uuid) {
                try {
                    const f = await fetch(`https://api.mojang.com/users/profiles/minecraft/${p.name}`);
                    if (f.ok) {
                        const data = await f.json();
                        p.uuid = data.id;
                    }
                } catch { }
            }
        }

        // 5. Speichern der players.json
        savePlayers(players);

        // 6. Sortierung: online Spieler zuerst, offline danach
        players.sort((a, b) => {
            if (a.online === b.online) return a.name.localeCompare(b.name);
            return a.online ? -1 : 1;
        });

        // 7. Spieler zurückgeben
        res.json(players);
    } catch (err) {
        console.error("Fehler bei /api/mc/players:", err);
        res.status(500).json({ error: "Konnte Spieler nicht abrufen" });
    }
});



app.get("/api/mc/stats/:player", (req,res)=>{
    const name = req.params.player;
    const players = loadPlayers();
    const player = players.find(p => p.name === name);
    if (!player) return res.status(404).json({error:"Spieler nicht gefunden"});

    let statsFile = null;
    try {
        const files = fs.readdirSync(statsDir);
        // UUID aus Mojang ohne Bindestriche
        const uuidNoDash = player.uuid ? player.uuid.replace(/-/g, '') : null;
        statsFile = files.find(f => {
            const fNoExt = f.replace('.json','');
            const fClean = fNoExt.replace(/-/g,''); // Bindestriche entfernen
            return fClean === uuidNoDash || f.includes(player.name);
        });
    } catch (err) {
        console.error("Fehler beim Lesen des Stats-Verzeichnisses:", err);
        return res.status(500).json({error:"Stats-Verzeichnis konnte nicht gelesen werden"});
    }

    if (!statsFile) return res.status(404).json({error:"Keine Statistiken vorhanden"});

    try {
        const stats = JSON.parse(fs.readFileSync(path.join(statsDir, statsFile),'utf-8'));
        res.json(stats);
    } catch (err) {
        console.error("Fehler beim Lesen der Stats-Datei:", err);
        res.status(500).json({error:"Fehler beim Lesen der Datei"});
    }
});

function loadUserCache() {
    try {
        if (fs.existsSync(userCacheFile)) {
            const data = JSON.parse(fs.readFileSync(userCacheFile, 'utf8'));
            if (Array.isArray(data)) return data;
        }
    } catch (e) {
        console.error("Fehler beim Laden usercache.json:", e);
    }
    return [];
}


/** -------------------
 *  START SERVER
 * ------------------ */
app.listen(PORT,'0.0.0.0',(err)=>{
    if(err) console.error("Server konnte nicht gestartet werden:",err);
    else console.log(`Server gestartet auf http://0.0.0.0:${PORT}`);
});
