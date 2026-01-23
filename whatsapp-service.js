const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const cron = require('node-cron');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const CONFIG_FILE = path.join(__dirname, 'whatsapp-config.json');
let config = { targetPhone: '' };

if (fs.existsSync(CONFIG_FILE)) {
    try {
        config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } catch (e) {
        console.error('Error loading config:', e);
    }
}
const prisma = new PrismaClient();
const PORT = 3001; // Internal port for QR/Status

let clientState = 'INITIALIZING';
let latestQR = '';

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }

});

client.on('qr', async (qr) => {
    clientState = 'WAITING_FOR_SCAN';
    latestQR = await qrcode.toDataURL(qr);
    console.log('QR Code generated. Scan in the settings page.');
});

client.on('ready', () => {
    clientState = 'CONNECTED';
    latestQR = '';
    console.log('WhatsApp Robot is READY!');
});

client.on('authenticated', () => {
    console.log('Authenticated successfully');
});

client.on('auth_failure', () => {
    clientState = 'AUTH_FAILURE';
    console.log('Authentication failure');
});

client.on('disconnected', () => {
    clientState = 'DISCONNECTED';
    console.log('Client was logged out');
});

client.initialize();

// Internal API for Dashboard
const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    if (req.url === '/status') {
        res.end(JSON.stringify({ state: clientState, qr: latestQR, config }));
        return;
    }

    if (req.url === '/config' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const newConfig = JSON.parse(body);
                config = { ...config, ...newConfig };
                fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
                console.log('Config updated:', config);
                res.end(JSON.stringify({ success: true }));
            } catch (e) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }

    if (req.url === '/test' && clientState === 'CONNECTED') {
        // Optional: test send to a hardcoded number or provided one
        res.end(JSON.stringify({ success: true, message: 'Test command received' }));
        return;
    }

    if (req.url === '/send' && req.method === 'POST') {
        console.log(`[WhatsApp Service] Received /send request, state: ${clientState}`);
        if (clientState !== 'CONNECTED') {
            res.writeHead(503);
            res.end(JSON.stringify({ error: 'WhatsApp not connected' }));
            return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { phone, message } = JSON.parse(body);
                console.log(`[WhatsApp Service] Parsing message for phone: ${phone}`);

                if (!phone || !message) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Missing phone or message' }));
                    return;
                }

                // Format phone: remove non-digits, ensure @c.us
                const cleanPhone = phone.replace(/\D/g, '');
                const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;

                console.log(`[WhatsApp Service] Sending to ${finalPhone}@c.us...`);
                await client.sendMessage(`${finalPhone}@c.us`, message);
                console.log(`[WhatsApp Service] Message sent successfully to ${finalPhone}`);

                res.end(JSON.stringify({ success: true }));
            } catch (e) {
                console.error('[WhatsApp Service] Send error:', e);
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Failed to send message' }));
            }
        });
        return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
    console.log(`WhatsApp internal server running on port ${PORT}`);
});

// Scheduling - 18:30 every day
cron.schedule('30 18 * * *', async () => {
    if (clientState !== 'CONNECTED') {
        console.error('Cant send report: WhatsApp not connected');
        return;
    }

    console.log('Generating automated daily report...');
    try {
        // Logic similar to app/api/reports/daily/route.ts but in JS/Node
        // For simplicity, we can fetch from our own local API if it's accessible
        // Or re-implement calculation logic here to be safe and independent

        const report = await generateReportData();
        const message = formatReportMessage(report);

        // Find a destination. For now, maybe we can store "Target Numbers" in settings.
        // Assuming user wants to receive to their own number for now.
        // We'll need to define who gets this report. 
        // For now, I'll log or send to self if possible.

        // For this MVP, let's assume there is a config in the DB or env
        const targetPhone = config.targetPhone;

        if (!targetPhone) {
            console.error('Cant send automated report: No target phone configured');
            return;
        }

        // Ensure format is 5511999999999@c.us
        const cleanPhone = targetPhone.replace(/\D/g, '');
        await client.sendMessage(`${cleanPhone}@c.us`, message);
        console.log('Report sent successfully to', cleanPhone);

    } catch (err) {
        console.error('Failed to send automated report:', err);
    }
});

async function generateReportData() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const incomeRecords = await prisma.financialRecord.findMany({
        where: {
            type: 'INCOME',
            status: 'PAID',
            paidAt: { gte: today, lte: end }
        }
    });

    const faturamento = incomeRecords.reduce((acc, curr) => acc + Number(curr.amount), 0);

    const finalizedOrders = await prisma.workOrder.findMany({
        where: {
            status: { in: ['FINALIZADA', 'ENTREGUE'] },
            updatedAt: { gte: today, lte: end }
        },
        include: { items: { where: { type: 'PART' } } }
    });

    const desconto = finalizedOrders.reduce((acc, curr) => acc + Number(curr.discount), 0);
    const faturamentoLiquido = faturamento - desconto;

    let cmv = 0;
    for (const os of finalizedOrders) {
        for (const item of os.items) {
            if (item.catalogItemId) {
                const part = await prisma.part.findUnique({
                    where: { id: item.catalogItemId },
                    select: { costPrice: true }
                });
                if (part) cmv += Number(item.quantity) * (Number(part.costPrice) || 0);
            }
        }
    }

    const impostos = faturamentoLiquido * 0.05;
    const lucroLiquido = faturamentoLiquido - cmv - impostos;
    const percentualLucro = faturamentoLiquido > 0 ? (lucroLiquido / faturamentoLiquido) * 100 : 0;
    const opens = await prisma.workOrder.count({ where: { status: { notIn: ['FINALIZADA', 'ENTREGUE'] }, vehicleId: { not: null } } });
    const ticketMedio = finalizedOrders.length > 0 ? faturamento / finalizedOrders.length : 0;

    return { faturamento, desconto, faturamentoLiquido, impostos, cmv, lucroLiquido, percentualLucro, osAbertas: opens, ticketMedio };
}

function formatReportMessage(data) {
    const dateStr = new Date().toLocaleDateString('pt-BR');
    const gmbLink = "https://g.page/r/YOUR_GMB_LINK/review"; // Link real da Malut Oficina

    return `Olá! 👋\n\nEstou passando para te passar alguns indicadores referente a movimentação do dia ${dateStr}. 😁\n\n---------------------------------------\n💰 Faturamento: ${data.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n🔴 Desconto Concedido: ${data.desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n💰 Faturamento Líquido: ${data.faturamentoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n🟡 Impostos (*): ${data.impostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n🟡 Custo Mercadoria Vendida: ${data.cmv.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n💵 Valor Lucro Líquido: ${data.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n💵 Percentual Lucro Líquido: ${data.percentualLucro.toFixed(2)}%\n---------------------------------------\n---------------------------------------\n👨‍🔧 Quantidade de OS's Abertas: ${data.osAbertas},00\n💰 Ticket Médio: ${data.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n---------------------------------------\n\n(*) Impostos calculados sobre 5% do faturamento líquido.\n\n🌟 Lembre-se de pedir para seus clientes avaliarem no Google: ${gmbLink}`;
}
