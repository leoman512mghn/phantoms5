const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1517769624651956299/Q1meLuUAkF3dnao9cogEhpwsuH6NIubnk_VxSTTdzABYXP58ZtF-o57xsgQswqoBftra';

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { type, data } = req.body;

    let embed;

    if (type === 'registration') {
        embed = {
            title: '📝 تسجيل عضو جديد',
            color: 0xa855f7,
            fields: [
                { name: '👤 اسم المستخدم', value: data.username, inline: true },
                { name: '📧 البريد', value: data.email, inline: true },
                { name: '🕐 التاريخ', value: new Date().toLocaleString('ar-EG'), inline: false }
            ],
            footer: { text: 'Phantoms Registration' },
            timestamp: new Date().toISOString()
        };
    } else if (type === 'application') {
        embed = {
            title: '📋 طلب تقديم جديد',
            color: 0x00ffff,
            fields: [
                { name: '👤 المستخدم', value: data.username, inline: true },
                { name: '🎮 اسم اللعبة', value: data.gameName, inline: true },
                { name: '📧 البريد', value: data.email, inline: true },
                { name: '📅 العمر', value: `${data.age} سنة`, inline: true },
                { name: '⏰ ساعات اللعب', value: data.hours || '—', inline: true },
                { name: '📊 الخبرة', value: data.exp || '—', inline: true },
                { name: '📝 سبب التقديم', value: data.reason || '—', inline: false },
                { name: '🛠 المهارات', value: data.skills || '—', inline: false }
            ],
            footer: { text: 'Phantoms Applications' },
            timestamp: new Date().toISOString()
        };
    } else if (type === 'status_update') {
        const statusEmoji = data.newStatus === 'accepted' ? '✅' : '❌';
        const statusColor = data.newStatus === 'accepted' ? 0x4ade80 : 0xef4444;
        const statusText = data.newStatus === 'accepted' ? 'مقبول' : 'مرفوض';

        embed = {
            title: `${statusEmoji} تحديث حالة الطلب`,
            color: statusColor,
            fields: [
                { name: '👤 المستخدم', value: data.username, inline: true },
                { name: '🎮 اسم اللعبة', value: data.gameName || '—', inline: true },
                { name: '📋 الحالة الجديدة', value: statusText, inline: true }
            ],
            footer: { text: 'Phantoms Status Update' },
            timestamp: new Date().toISOString()
        };

        if (data.rejectReason) {
            embed.fields.push({ name: '📌 سبب الرفض', value: data.rejectReason, inline: false });
        }
    } else {
        return res.status(400).json({ error: 'Invalid type' });
    }

    try {
        const response = await fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'Phantoms Bot',
                avatar_url: 'https://cdn.discordapp.com/embed/avatars/4.png',
                embeds: [embed]
            })
        });

        if (response.ok) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(500).json({ error: 'Discord webhook failed' });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
