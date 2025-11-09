const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const TIMEZONE = 'Asia/Makassar';
let currentPP = null;
let isChangingPP = false;

async function getChromiumPath() {
    try {
        const { stdout } = await execAsync('which chromium');
        return stdout.trim();
    } catch (error) {
        console.log('⚠️  Chromium tidak ditemukan di system path, menggunakan default puppeteer');
        return null;
    }
}

async function initializeClient() {
    const chromiumPath = await getChromiumPath();
    
    const puppeteerConfig = {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    };
    
    if (chromiumPath) {
        puppeteerConfig.executablePath = chromiumPath;
        console.log('✅ Menggunakan Chromium dari:', chromiumPath);
    }
    
    const client = new Client({
        authStrategy: new LocalAuth({
            dataPath: './.wwebjs_auth'
        }),
        puppeteer: puppeteerConfig
    });
    
    return client;
}

console.log('🤖 Bot WhatsApp PP Otomatis');
console.log('📍 Timezone: WIT (Asia/Makassar)');
console.log('⏳ Memulai bot...\n');

function loadLiburData() {
    try {
        const data = fs.readFileSync('libur.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('⚠️  Error membaca libur.json:', error.message);
        return {};
    }
}

function isHariLibur() {
    const now = moment.tz(TIMEZONE);
    const dayOfWeek = now.day();
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return true;
    }
    
    const dateStr = now.format('YYYY-MM-DD');
    const liburData = loadLiburData();
    
    if (liburData[dateStr]) {
        return true;
    }
    
    return false;
}

function getCurrentPPType() {
    const now = moment.tz(TIMEZONE);
    const hour = now.hour();
    const minute = now.minute();
    
    if (isHariLibur()) {
        return 'C';
    }
    
    if (hour === 12) {
        return 'C';
    }
    
    if (hour >= 17 || hour < 5) {
        return 'A';
    }
    
    if ((hour >= 5 && hour < 12) || (hour >= 13 && hour < 17)) {
        return 'B';
    }
    
    return 'B';
}

function getPPFileName(type) {
    switch (type) {
        case 'A':
            return 'malam.png';
        case 'B':
            return 'siang.png';
        case 'C':
            return 'khusus.jpg';
        default:
            return 'siang.png';
    }
}

function getPPName(type) {
    switch (type) {
        case 'A':
            return 'PP A (Malam-Subuh)';
        case 'B':
            return 'PP B (Pagi-Sore)';
        case 'C':
            return 'PP C (Khusus)';
        default:
            return 'PP B (Pagi-Sore)';
    }
}

function getTimeInfo() {
    const now = moment.tz(TIMEZONE);
    const dateStr = now.format('YYYY-MM-DD HH:mm:ss');
    const dayName = now.format('dddd');
    
    let status = '';
    if (isHariLibur()) {
        const liburData = loadLiburData();
        const todayDate = now.format('YYYY-MM-DD');
        const dayOfWeek = now.day();
        
        if (dayOfWeek === 0) {
            status = '(Minggu - Hari Libur)';
        } else if (dayOfWeek === 6) {
            status = '(Sabtu - Hari Libur)';
        } else if (liburData[todayDate]) {
            status = `(${liburData[todayDate]} - Hari Libur)`;
        } else {
            status = '(Hari Libur)';
        }
    }
    
    return `${dateStr} ${status}`;
}

async function checkAndUpdatePP() {
    if (isChangingPP) {
        return;
    }
    
    const ppType = getCurrentPPType();
    
    if (currentPP === ppType) {
        return;
    }
    
    const ppFileName = getPPFileName(ppType);
    const ppPath = path.join(__dirname, ppFileName);
    
    if (!fs.existsSync(ppPath)) {
        console.error(`❌ File ${ppFileName} tidak ditemukan!`);
        return;
    }
    
    isChangingPP = true;
    
    try {
        const media = MessageMedia.fromFilePath(ppPath);
        
        const result = await client.setProfilePicture(media);
        
        if (result) {
            currentPP = ppType;
            const timeInfo = getTimeInfo();
            const ppName = getPPName(ppType);
            
            console.log(`✅ ${timeInfo}`);
            console.log(`   PP berhasil diganti ke: ${ppName} (${ppFileName})`);
            console.log('');
        } else {
            console.error('❌ Gagal mengganti PP: WhatsApp tidak menerima perubahan');
        }
        
    } catch (error) {
        console.error('❌ Error mengganti PP:', error.message);
    } finally {
        isChangingPP = false;
    }
}

let client;

async function main() {
    console.log('🔌 Menghubungkan ke WhatsApp...');
    client = await initializeClient();
    
    client.on('qr', (qr) => {
        console.log('📱 Scan QR Code di bawah ini dengan WhatsApp Anda:');
        qrcode.generate(qr, { small: true });
        console.log('\nAtau gunakan pairing code jika tersedia di versi WhatsApp Anda.');
    });

    client.on('authenticated', () => {
        console.log('✅ Autentikasi berhasil!');
    });

    client.on('ready', async () => {
        console.log('✅ Bot siap digunakan!');
        console.log('📞 Terhubung sebagai:', client.info.pushname);
        console.log('📱 Nomor:', client.info.wid.user);
        console.log('');
        
        await checkAndUpdatePP();
        
        setInterval(async () => {
            await checkAndUpdatePP();
        }, 60000);
    });

    client.on('auth_failure', msg => {
        console.error('❌ Autentikasi gagal:', msg);
    });

    client.on('disconnected', (reason) => {
        console.log('⚠️  Bot terputus:', reason);
    });
    
    client.initialize();
}

process.on('SIGINT', async () => {
    console.log('\n⏹️  Menghentikan bot...');
    if (client) {
        await client.destroy();
    }
    process.exit(0);
});

main().catch(error => {
    console.error('❌ Error saat memulai bot:', error);
    process.exit(1);
});
