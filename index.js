const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    SlashCommandBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ChannelSelectMenuBuilder,
    ChannelType,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

const fs = require('fs');
const path = require('path');
require('dotenv').config();


// ============================================================
// CLIENT
// ============================================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});


// ============================================================
// KONFIGURATION
// ============================================================

const DATA_FILE = path.join(__dirname, 'bilanz_data.json');

const MANAGEMENT_ROLE_ID = "1493771686229840023";
const ABSENT_ROLE_ID = "1513247003230863371";
const GIVEAWAY_PING_ROLE_ID = "1444295212871454741";

const SERVER_MAIN_ID = "1443919269896392717";
const SERVER_LAGER_ID = "1475942799881797826";


// ============================================================
// LAGER - STARTBESTAND
// ============================================================

const initialLagerItems = {
    "Bandage": 0,
    "Bauplan Double Action": 1,
    "Bauplan Spezial Karabiner": 4,
    "Bloody Maria": 360,
    "Bohrer": 3,
    "Bohrmaschine": 0,
    "Bolzenschneider": 18,
    "C4": 10,
    "Feuerzeug und Clipper": 30,
    "Dietrich": 102,
    "E-Zigarette": 15,
    "Ebike": 6,
    "Fernglas": 0,
    "Gas Maske": 1,
    "Gold Angelrute": 0,
    "GPS": 30,
    "Graffitientferner": 24,
    "Handy": 138,
    "Klappfahrrad": 15,
    "Waffentasche (Klein)": 1,
    "Waffentasche (Groß)": 0,
    "M.W.L Rum": 15,
    "Malibu Champagner": 20,
    "Malibu Lager": 11,
    "Malibu Pilsner": 22,
    "Malibu Rotwein": 14,
    "Malibu Weißwein": 9,
    "Medikit": 34,
    "MetallDetektor": 2,
    "N²o": 1000,
    "Pilz": 200,
    "Plasmacutter": 51,
    "Politur (24h)": 34,
    "Politur Classic": 2,
    "Politur plus": 2,
    "Rammbock": 3,
    "Repairkit": 20,
    "Retroprofen": 0,
    "Sangria": 1310,
    "Schutzwesten": 2,
    "Schwamm": 68,
    "Seile": 48,
    "Spaten": 0,
    "Spraydose": 0,
    "Tablet": 24,
    "Tasche (Gelb)": 0,
    "Tasche (Blau)": 4,
    "Tasche aus": 1,
    "Thermal": 1,
    "Thermite": 80,
    "Tüte": 120,
    "Vape Apfel Zimt": 40,
    "Vape Peach Ice": 34,
    "Vape Premium": 6637,
    "Vape Traube Minze": 36,
    "Winkelschneider": 1,
    "Würfel": 15,
    "5.56 Munition": 3,
    "Legale Munition": 6,
    "Shotgun Munition": 91,
    "9mm Munition": 150,
    "Lauf": 26,
    "Rückzugsfeder": 2,
    "Gehäuse": 7,
    "Griffstücke": 7,
    "Verschluss": 87,
    "Waffenholster": 132,
    "Leder": 97,
    "Stahl": 4,
    "Waffenteile": 602,
    "Schwarzpulver": 27,
    "Patronenhülsen": 0,
    "Griff": 25,
    "Schalldämpfer": 0,
    "Trommelmagazin": 0,
    "Visier": 0,
    "Bloodpacks": 74,
    "Folterkit": 1,
    "Hackinglaptop": 0,
    "Hack USB": 0,
    "Weedknospen": 900,
    "Taucheranzüge": 14,
    "Polizei Schlüsselkarte": 1,
    "Special Units Schlüsselkarte": 1,
    "Skull Reaper Figur": 50,
    "Sturmgewehr": 4,
    "Spezialkarabiner": 54,
    "Kompaktgewehr": 30,
    "Doppelschrot": 19,
    "Bullpup": 31,
    "Fortgeschrittenes Gewehr": 2,
    "Schwerer Revolver": 150,
    "Pistole": 3,
    "Mk2.Pistole": 1,
    "Schwere Pistole": 1,
    "Kampfpistole": 3,
    "WM Pistolen": 6,
    "SNS Pistolen": 5,
    "Messer": 6,
    "Baseballschläger": 0
};


// ============================================================
// DATENBANK
// ============================================================

let db = {
    config: {
        dienstChannel: null,
        beschlagChannel: null,
        freigabeChannel: null,
        rechnungChannel: null,
        bossmenuChannel: null,
        outputChannel: null,
        lagerChannel: null,
        giveawayChannel: null,
        entnahmeChannel: null,
        einlagerungsChannel: null,
        oeffnungsChannel: null,
        lagerLimits: {}
    },

    stats: {},

    lager: { ...initialLagerItems }
};


// ============================================================
// LADE DATENBANK
// ============================================================

if (fs.existsSync(DATA_FILE)) {
    try {
        const loadedData = JSON.parse(
            fs.readFileSync(DATA_FILE, 'utf8')
        );

        db = loadedData;

        if (!db.config) {
            db.config = {};
        }

        if (!db.stats) {
            db.stats = {};
        }

        if (!db.lager) {
            db.lager = { ...initialLagerItems };
        }

        if (!db.config.dienstChannel) {
            db.config.dienstChannel = null;
        }

        if (!db.config.beschlagChannel) {
            db.config.beschlagChannel = null;
        }

        if (!db.config.freigabeChannel) {
            db.config.freigabeChannel = null;
        }

        if (!db.config.rechnungChannel) {
            db.config.rechnungChannel = null;
        }

        if (!db.config.bossmenuChannel) {
            db.config.bossmenuChannel = null;
        }

        if (!db.config.outputChannel) {
            db.config.outputChannel = null;
        }

        if (!db.config.lagerChannel) {
            db.config.lagerChannel = null;
        }

        if (!db.config.giveawayChannel) {
            db.config.giveawayChannel = null;
        }

        if (!db.config.entnahmeChannel) {
            db.config.entnahmeChannel = null;
        }

        if (!db.config.einlagerungsChannel) {
            db.config.einlagerungsChannel = null;
        }

        if (!db.config.oeffnungsChannel) {
            db.config.oeffnungsChannel = null;
        }

        if (!db.config.lagerLimits) {
            db.config.lagerLimits = {};
        }

    } catch (error) {
        console.error(
            "❌ Fehler beim Laden der Datenbank:",
            error
        );
    }
}


// ============================================================
// DATEN SPEICHERN
// ============================================================

function saveData() {
    try {
        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(db, null, 2),
            'utf8'
        );
    } catch (error) {
        console.error(
            "❌ Fehler beim Speichern der Datenbank:",
            error
        );
    }
}


// ============================================================
// ÖFFNUNGSZEITEN
// ============================================================

let storeState = {
    isOpen: false,
    openTimestamp: null
};


// ============================================================
// WOCHENFUNKTIONEN
// Woche beginnt Samstag 20:00 Uhr
// ============================================================

function getCurrentWeekKey() {
    const now = new Date();

    const currentDay = now.getDay();
    const currentHour = now.getHours();

    const targetDate = new Date(now);

    let daysSinceSaturday =
        (currentDay + 7 - 6) % 7;

    // Samstag vor 20:00 gehört noch zur alten Woche
    if (currentDay === 6 && currentHour < 20) {
        daysSinceSaturday = 7;
    }

    targetDate.setDate(
        now.getDate() - daysSinceSaturday
    );

    targetDate.setHours(20, 0, 0, 0);

    return targetDate
        .toISOString()
        .split('T')[0];
}


function getFormattedWeekRange(weekKey) {
    const startDate = new Date(weekKey);
    const endDate = new Date(startDate);

    endDate.setDate(
        startDate.getDate() + 6
    );

    const format = (date) => {
        const d = String(
            date.getDate()
        ).padStart(2, '0');

        const m = String(
            date.getMonth() + 1
        ).padStart(2, '0');

        const y = date.getFullYear();

        return `${d}.${m}.${y}`;
    };

    return `${format(startDate)} - ${format(endDate)}`;
}


function formatTime(minutes) {
    const safeMinutes = Math.max(
        0,
        Number(minutes) || 0
    );

    const hours = Math.floor(
        safeMinutes / 60
    );

    const mins = safeMinutes % 60;

    return `${hours}h ${mins}m`;
}


function cleanName(rawName) {
    if (!rawName) {
        return "Unbekannt";
    }

    return rawName
        .replace(/\s*\*(\d+)\s*\*/g, "")
        .trim();
}


// ============================================================
// EMBED-FELDER AUSLESEN
// ============================================================

function getFieldValue(embed, possibleNames) {
    if (!embed || !embed.fields) {
        return null;
    }

    for (const name of possibleNames) {
        const field = embed.fields.find(
            field =>
                field.name &&
                field.name
                    .toLowerCase()
                    .includes(name.toLowerCase())
        );

        if (field) {
            return field.value;
        }
    }

    return null;
}


// ============================================================
// MANAGEMENT PRÜFEN
// ============================================================

async function isManagement(guild, userName) {
    if (!guild || !userName) {
        return false;
    }

    try {
        let member = guild.members.cache.find(
            member =>
                member.user.username.toLowerCase() ===
                    userName.toLowerCase() ||
                (
                    member.nickname &&
                    member.nickname
                        .toLowerCase()
                        .includes(userName.toLowerCase())
                )
        );

        if (!member) {
            const results =
                await guild.members.fetch({
                    query: userName,
                    limit: 1
                });

            member = results.first();
        }

        if (
            member &&
            member.roles.cache.has(
                MANAGEMENT_ROLE_ID
            ) &&
            !member.roles.cache.has(
                ABSENT_ROLE_ID
            )
        ) {
            return true;
        }

    } catch (error) {
        console.error(
            "Fehler bei Management-Prüfung:",
            error
        );
    }

    return false;
}


// ============================================================
// WOCHENBILANZ EMBEDS
// ============================================================

async function generateBilanzEmbeds(
    weekKey,
    guild
) {
    const weekRange =
        getFormattedWeekRange(weekKey);

    const weekData =
        db.stats[weekKey] || {
            users: {},
            bankStart: null,
            bankCurrent: null,
            zollCount: 0,
            zollGeld: 0,
            oeffnungsMinuten: 0
        };

    const weekStats =
        weekData.users || {};

    const sortedUsers =
        Object.entries(weekStats)
            .sort(
                (a, b) =>
                    (b[1].beschlagnahmen || 0) -
                    (a[1].beschlagnahmen || 0)
            );


    // ========================================================
    // SEITE 1
    // ========================================================

    let desc1 =
        `Hier ist die offizielle Auswertung vom **${weekRange}**:\n\n`;

    if (sortedUsers.length === 0) {
        desc1 +=
            "_Bisher wurden in dieser Woche noch keine Aktionen erfasst._";
    } else {
        for (const [name, stats] of sortedUsers) {
            desc1 +=
                `**${name}**\n` +
                `🚗 Beschlagnahmt: **${stats.beschlagnahmen || 0}** | ` +
                `🔓 Freigegeben: **${stats.freigaben || 0}**\n` +
                `💵 Einnahmen: **$${(stats.einnahmen || 0).toLocaleString('de-DE')}** | ` +
                `⏱️ Dienstzeit: **${formatTime(stats.dienstzeitMinuten || 0)}**\n\n`;
        }
    }

    const embed1 = new EmbedBuilder()
        .setTitle(
            '📊 Wöchentliche Dienstbilanz (Seite 1/3)'
        )
        .setColor(0xFF4500)
        .setDescription(desc1)
        .setTimestamp();


    // ========================================================
    // GESAMTSUMMEN
    // ========================================================

    let totalBeschlag = 0;
    let totalFreigabe = 0;
    let totalUserEinnahmen = 0;
    let totalDienstMinuten = 0;

    for (const [, stats] of sortedUsers) {
        totalBeschlag +=
            stats.beschlagnahmen || 0;

        totalFreigabe +=
            stats.freigaben || 0;

        totalUserEinnahmen +=
            stats.einnahmen || 0;

        totalDienstMinuten +=
            stats.dienstzeitMinuten || 0;
    }

    const zollCount =
        weekData.zollCount || 0;

    const zollGeld =
        weekData.zollGeld || 0;

    const totalEinnahmen =
        totalUserEinnahmen + zollGeld;

    const oeffnungsMinuten =
        weekData.oeffnungsMinuten || 0;


    // ========================================================
    // SEITE 2
    // ========================================================

    let desc2 =
        `Gesamtsumme aller eingetragenen Mitarbeiter vom **${weekRange}**:\n\n`;

    desc2 +=
        `🚗 **Gesamt-Beschlagnahmen:** ${totalBeschlag}\n`;

    desc2 +=
        `🔓 **Gesamt-Freigaben:** ${totalFreigabe}\n`;

    desc2 +=
        `🏛️ **Beendete Zoll-Auktionen:** ${zollCount} ` +
        `(Einnahmen: $${zollGeld.toLocaleString('de-DE')})\n`;

    desc2 +=
        `💵 **Gesamt-Rechnungseinnahmen:** ` +
        `$${totalUserEinnahmen.toLocaleString('de-DE')}\n`;

    desc2 +=
        `⏱️ **Gesamt-Dienstzeit:** ` +
        `${formatTime(totalDienstMinuten)}\n`;

    desc2 +=
        `🏪 **Gesamt-Öffnungszeit (Laden):** ` +
        `${formatTime(oeffnungsMinuten)}\n`;

    const embed2 = new EmbedBuilder()
        .setTitle(
            '📈 Gesamtsummen & Statistiken (Seite 2/3)'
        )
        .setColor(0xFFA500)
        .setDescription(desc2)
        .setTimestamp();


    // ========================================================
    // SEITE 3 - AUSZAHLUNGEN
    // ========================================================

    let totalEmployeePayout = 0;
    let employeePayoutDetails = "";
    let managementPayoutDetails = "";
    let managementCount = 0;

    for (const [name, stats] of sortedUsers) {
        const management =
            await isManagement(guild, name);

        if (management) {
            continue;
        }

        let payout =
            ((stats.beschlagnahmen || 0) * 3000) +
            ((stats.freigaben || 0) * 3000);

        let bonusText = "";

        if ((stats.dienstzeitMinuten || 0) >= 900) {
            payout += 500000;
            bonusText =
                " (inkl. $500k Bonus)";
        }

        totalEmployeePayout += payout;

        employeePayoutDetails +=
            `• **${name}**: ` +
            `$${payout.toLocaleString('de-DE')}` +
            `${bonusText}\n`;
    }


    if (guild) {
        try {
            const managementMembers =
                guild.members.cache.filter(
                    member =>
                        member.roles.cache.has(
                            MANAGEMENT_ROLE_ID
                        ) &&
                        !member.roles.cache.has(
                            ABSENT_ROLE_ID
                        )
                );

            managementCount =
                managementMembers.size;

            managementMembers.forEach(member => {
                const displayName =
                    member.nickname ||
                    member.user.username;

                managementPayoutDetails +=
                    `• **${displayName}** (Leitung): $3.500.000\n`;
            });

        } catch (error) {
            console.error(
                "Fehler beim Auslesen der Leitung:",
                error
            );
        }
    }


    const totalManagementPayout =
        managementCount * 3500000;

    const totalOverallPayout =
        totalEmployeePayout +
        totalManagementPayout;

    const bankStart =
        weekData.bankStart !== null &&
        weekData.bankStart !== undefined
            ? weekData.bankStart
            : 0;

    const bankCurrent =
        weekData.bankCurrent !== null &&
        weekData.bankCurrent !== undefined
            ? weekData.bankCurrent
            : 0;

    const netProfit =
        totalEinnahmen -
        totalOverallPayout;

    const profitColor =
        netProfit >= 0
            ? 0x00FF00
            : 0xFF0000;

    const profitEmoji =
        netProfit >= 0
            ? "🟢"
            : "🔴";


    let desc3 =
        `Übersicht der Auszahlungen & Firmenbilanz vom **${weekRange}**:\n\n`;

    desc3 +=
        `**Löhne Mitarbeiter:**\n` +
        `${employeePayoutDetails || "_Keine normalen Mitarbeiter._"}\n`;

    desc3 +=
        `**Löhne Leitungsebene ($3.500.000 p.P.):**\n` +
        `${managementPayoutDetails || "_Keine aktive Leitung erfasst._"}\n`;

    desc3 +=
        `──────────────────────────\n`;

    desc3 +=
        `💵 **Gesamteinnahmen (Rechnungen + Auktionen):** ` +
        `$${totalEinnahmen.toLocaleString('de-DE')} ` +
        `_(Auktionen: $${zollGeld.toLocaleString('de-DE')})_\n`;

    desc3 +=
        `💸 **Gesamtauszahlungen (Löhne/Boni):** ` +
        `$${totalOverallPayout.toLocaleString('de-DE')}\n`;

    desc3 +=
        `🏦 **Kontostand (Wochenbeginn):** ` +
        `$${bankStart.toLocaleString('de-DE')}\n`;

    desc3 +=
        `🏦 **Kontostand (Aktuell):** ` +
        `$${bankCurrent.toLocaleString('de-DE')}\n`;

    desc3 +=
        `${profitEmoji} **Nettogewinn / -verlust:** ` +
        `**$${netProfit.toLocaleString('de-DE')}**`;


    const embed3 = new EmbedBuilder()
        .setTitle(
            '💰 Auszahlungen & Firmenbilanz (Seite 3/3)'
        )
        .setColor(profitColor)
        .setDescription(desc3)
        .setTimestamp();

    return [
        embed1,
        embed2,
        embed3
    ];
}


// ============================================================
// BILANZ PAGINATION
// ============================================================

function getPaginationRow(page) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('prev_page')
            .setLabel('◀ Zurück')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0),

        new ButtonBuilder()
            .setCustomId('next_page')
            .setLabel('Weiter ▶')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 2)
    );
}


// ============================================================
// LAGER EMBEDS
// ============================================================

function generateLagerEmbeds() {
    const entries =
        Object.entries(db.lager || {});

    if (entries.length === 0) {
        return [
            new EmbedBuilder()
                .setTitle('📦 Offizielle Lagerliste')
                .setDescription(
                    '*Das Lager ist leer.*'
                )
                .setColor(0x00AE86)
        ];
    }

    const itemsPerPage = 25;

    const pages = [];

    const totalPages =
        Math.ceil(
            entries.length / itemsPerPage
        );

    for (
        let i = 0;
        i < entries.length;
        i += itemsPerPage
    ) {
        const chunk =
            entries.slice(
                i,
                i + itemsPerPage
            );

        let text = "";

        chunk.forEach(
            ([item, count]) => {
                text +=
                    `• **${item}**: ${count}\n`;
            }
        );

        const pageNum =
            Math.floor(
                i / itemsPerPage
            ) + 1;

        const embed =
            new EmbedBuilder()
                .setTitle(
                    `📦 Offizielle Lagerliste (Seite ${pageNum}/${totalPages})`
                )
                .setColor(0x00AE86)
                .setDescription(text)
                .setTimestamp();

        pages.push(embed);
    }

    return pages;
}


function getLagerPaginationRow(
    page,
    totalPages
) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('lager_prev')
            .setLabel('◀ Zurück')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0),

        new ButtonBuilder()
            .setCustomId('lager_next')
            .setLabel('Weiter ▶')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(
                page === totalPages - 1
            )
    );
}


// ============================================================
// READY
// ============================================================

client.once('ready', async () => {
    console.log(
        `✅ Eingeloggt als ${client.user.tag}!`
    );


    // ========================================================
    // MEMBER CACHE AKTUALISIEREN
    // ========================================================

    setInterval(async () => {
        for (
            const guild of client.guilds.cache.values()
        ) {
            try {
                await guild.members.fetch();
            } catch (error) {
                console.error(
                    `Fehler beim Laden der Mitglieder von ${guild.name}:`,
                    error.message
                );
            }
        }
    }, 120000);


    // ========================================================
    // SERVER-RESTART / ÖFFNUNGSZEIT
    // ========================================================

    setInterval(() => {
        const now = new Date();

        const hour = now.getHours();
        const minute = now.getMinutes();

        if (
            (hour === 3 ||
                hour === 12 ||
                hour === 19) &&
            minute === 0
        ) {
            if (storeState.isOpen) {
                storeState.isOpen = false;
                storeState.openTimestamp = null;

                console.log(
                    "⏰ Server-Restart erkannt " +
                    "(03/12/19 Uhr): " +
                    "Laden-Öffnungszeit automatisch gestoppt."
                );
            }
        }
    }, 60000);


    // ========================================================
    // MAIN COMMANDS
    // ========================================================

    const mainCommands = [

        new SlashCommandBuilder()
            .setName('ebilanz')
            .setDescription(
                'Konfiguriert die Kanäle.'
            )
            .setDefaultMemberPermissions(
                PermissionFlagsBits.Administrator
            ),

        new SlashCommandBuilder()
            .setName('zbilanz')
            .setDescription(
                'Zeigt die Zwischenbilanz an.'
            ),

        new SlashCommandBuilder()
            .setName('resetbilanz')
            .setDescription(
                'Setzt die Statistik zurück.'
            )
            .setDefaultMemberPermissions(
                PermissionFlagsBits.Administrator
            ),

        new SlashCommandBuilder()
            .setName('publishbilanz')
            .setDescription(
                'Veröffentlicht die Wochenbilanz sofort.'
            )
            .setDefaultMemberPermissions(
                PermissionFlagsBits.Administrator
            ),

        new SlashCommandBuilder()
            .setName('oeffnungszeiten')
            .setDescription(
                'Legt den Log-Channel für die Laden-Öffnungszeiten fest.'
            )
            .setDefaultMemberPermissions(
                PermissionFlagsBits.Administrator
            )
            .addChannelOption(option =>
                option
                    .setName('kanal')
                    .setDescription(
                        'Öffnungszeiten-Channel'
                    )
                    .addChannelTypes(
                        ChannelType.GuildText
                    )
                    .setRequired(true)
            ),

        new SlashCommandBuilder()
            .setName('ladezeit')
            .setDescription(
                'Startet die Öffnungszeit-Messung manuell.'
            )
            .setDefaultMemberPermissions(
                PermissionFlagsBits.Administrator
            ),

        new SlashCommandBuilder()
            .setName('dienstzeit')
            .setDescription(
                'Fügt Dienstzeit hinzu oder zieht welche ab.'
            )
            .setDefaultMemberPermissions(
                PermissionFlagsBits.Administrator
            )
            .addStringOption(option =>
                option
                    .setName('name')
                    .setDescription(
                        'Name des Mitarbeiters'
                    )
                    .setRequired(true)
            )
            .addIntegerOption(option =>
                option
                    .setName('minuten')
                    .setDescription(
                        'Minuten (negativ zum Abziehen)'
                    )
                    .setRequired(true)
            ),

        new SlashCommandBuilder()
            .setName('lagerüberwachung')
            .setDescription(
                'Konfiguriert die Lager-Limits und den Log-Channel.'
            )
            .setDefaultMemberPermissions(
                PermissionFlagsBits.Administrator
            )

            .addSubcommand(sub =>
                sub
                    .setName('kanal')
                    .setDescription(
                        'Setzt den Lager-Log-Channel.'
                    )
                    .addChannelOption(option =>
                        option
                            .setName('kanal')
                            .setDescription(
                                'Lager-Channel'
                            )
                            .addChannelTypes(
                                ChannelType.GuildText
                            )
                            .setRequired(true)
                    )
            )

            .addSubcommand(sub =>
                sub
                    .setName('limit')
                    .setDescription(
                        'Fügt ein Item-Limit hinzu oder aktualisiert es.'
                    )
                    .addStringOption(option =>
                        option
                            .setName('item')
                            .setDescription(
                                'Name des Items'
                            )
                            .setRequired(true)
                    )
                    .addIntegerOption(option =>
                        option
                            .setName('anzahl')
                            .setDescription(
                                'Maximal erlaubte Anzahl'
                            )
                            .setRequired(true)
                    )
            )

            .addSubcommand(sub =>
                sub
                    .setName('entfernen')
                    .setDescription(
                        'Entfernt ein Item aus der Überwachung.'
                    )
                    .addStringOption(option =>
                        option
                            .setName('item')
                            .setDescription(
                                'Name des Items'
                            )
                            .setRequired(true)
                    )
            )

            .addSubcommand(sub =>
                sub
                    .setName('liste')
                    .setDescription(
                        'Zeigt alle überwachten Items.'
                    )
            ),

        new SlashCommandBuilder()
            .setName('giveaway')
            .setDescription(
                'Verwaltet Giveaways.'
            )
            .setDefaultMemberPermissions(
                PermissionFlagsBits.Administrator
            )

            .addSubcommand(sub =>
                sub
                    .setName('kanal')
                    .setDescription(
                        'Legt den Giveaway-Channel fest.'
                    )
                    .addChannelOption(option =>
                        option
                            .setName('kanal')
                            .setDescription(
                                'Giveaway-Channel'
                            )
                            .addChannelTypes(
                                ChannelType.GuildText
                            )
                            .setRequired(true)
                    )
            )

            .addSubcommand(sub =>
                sub
                    .setName('starten')
                    .setDescription(
                        'Startet ein neues Giveaway.'
                    )
            )
    ];


    // ========================================================
    // LAGER COMMANDS
    // ========================================================

    const lagerCommands = [

        new SlashCommandBuilder()
            .setName('lager')
            .setDescription(
                'Lagerverwaltung und Bestandsliste.'
            )

            .addSubcommand(sub =>
                sub
                    .setName('anzeigen')
                    .setDescription(
                        'Zeigt die komplette Lagerliste.'
                    )
            )

            .addSubcommand(sub =>
                sub
                    .setName('entnahme-channel')
                    .setDescription(
                        'Legt den Log-Channel für Entnahmen fest.'
                    )
                    .addChannelOption(option =>
                        option
                            .setName('kanal')
                            .setDescription(
                                'Entnahme-Channel'
                            )
                            .addChannelTypes(
                                ChannelType.GuildText
                            )
                            .setRequired(true)
                    )
            )

            .addSubcommand(sub =>
                sub
                    .setName('einlagerungs-channel')
                    .setDescription(
                        'Legt den Log-Channel für Einlagerungen fest.'
                    )
                    .addChannelOption(option =>
                        option
                            .setName('kanal')
                            .setDescription(
                                'Einlagerungs-Channel'
                            )
                            .addChannelTypes(
                                ChannelType.GuildText
                            )
                            .setRequired(true)
                    )
            )

            .addSubcommand(sub =>
                sub
                    .setName('suchen')
                    .setDescription(
                        'Sucht nach einem bestimmten Item.'
                    )
                    .addStringOption(option =>
                        option
                            .setName('item')
                            .setDescription(
                                'Name des Items'
                            )
                            .setRequired(true)
                    )
            )

            .addSubcommand(sub =>
                sub
                    .setName('hinzufügen')
                    .setDescription(
                        'Fügt einem Item eine Anzahl hinzu.'
                    )
                    .addStringOption(option =>
                        option
                            .setName('item')
                            .setDescription(
                                'Name des Items'
                            )
                            .setRequired(true)
                    )
                    .addIntegerOption(option =>
                        option
                            .setName('anzahl')
                            .setDescription(
                                'Anzahl zum Hinzufügen'
                            )
                            .setRequired(true)
                    )
            )

            .addSubcommand(sub =>
                sub
                    .setName('entfernen')
                    .setDescription(
                        'Zieht von einem Item eine Anzahl ab.'
                    )
                    .addStringOption(option =>
                        option
                            .setName('item')
                            .setDescription(
                                'Name des Items'
                            )
                            .setRequired(true)
                    )
                    .addIntegerOption(option =>
                        option
                            .setName('anzahl')
                            .setDescription(
                                'Anzahl zum Abziehen'
                            )
                            .setRequired(true)
                    )
            )

            .addSubcommand(sub =>
                sub
                    .setName('neu')
                    .setDescription(
                        'Erstellt ein neues Item.'
                    )
                    .addStringOption(option =>
                        option
                            .setName('item')
                            .setDescription(
                                'Name des neuen Items'
                            )
                            .setRequired(true)
                    )
                    .addIntegerOption(option =>
                        option
                            .setName('anzahl')
                            .setDescription(
                                'Startanzahl'
                            )
                            .setRequired(true)
                    )
            )

            .addSubcommand(sub =>
                sub
                    .setName('loeschen')
                    .setDescription(
                        'Löscht ein Item komplett.'
                    )
                    .addStringOption(option =>
                        option
                            .setName('item')
                            .setDescription(
                                'Name des Items'
                            )
                            .setRequired(true)
                    )
            )
    ];


    // ========================================================
    // COMMANDS REGISTRIEREN
    // ========================================================

    const rest = new REST({
        version: '10'
    }).setToken(
        process.env.DISCORD_TOKEN
    );

    try {

        await rest.put(
            Routes.applicationCommands(
                client.user.id
            ),
            {
                body: []
            }
        );

        await rest.put(
            Routes.applicationGuildCommands(
                client.user.id,
                SERVER_MAIN_ID
            ),
            {
                body: mainCommands
            }
        );

        await rest.put(
            Routes.applicationGuildCommands(
                client.user.id,
                SERVER_LAGER_ID
            ),
            {
                body: lagerCommands
            }
        );

        console.log(
            '✅ Befehle erfolgreich auf die Server verteilt!'
        );

    } catch (error) {
        console.error(
            '❌ Fehler beim Registrieren der Befehle:',
            error
        );
    }


    // ========================================================
    // WÖCHENTLICHER REPORT
    // Samstag 20:00
    // ========================================================

    setInterval(() => {
        const now = new Date();

        if (
            now.getDay() === 6 &&
            now.getHours() === 20 &&
            now.getMinutes() === 0
        ) {
            publishWeeklyReport().catch(
                console.error
            );
        }
    }, 60000);
});


// ============================================================
// INTERACTION CREATE
// WICHTIG: NUR EIN EINZIGER HANDLER
// ============================================================

client.on(
    'interactionCreate',
    async interaction => {

        try {

            // ==================================================
            // SLASH COMMANDS
            // ==================================================

            if (interaction.isChatInputCommand()) {

                const guildId =
                    interaction.guildId;

                const cmdName =
                    interaction.commandName;


                // ==============================================
                // SERVER-PRÜFUNG
                // ==============================================

                if (
                    cmdName === 'lager' &&
                    guildId !== SERVER_LAGER_ID
                ) {
                    await interaction.reply({
                        content:
                            '❌ Dieser Befehl ist nur auf dem dafür vorgesehenen Lager-Server erlaubt!',
                        ephemeral: true
                    });

                    return;
                }

                if (
                    cmdName !== 'lager' &&
                    guildId !== SERVER_MAIN_ID
                ) {
                    await interaction.reply({
                        content:
                            '❌ Dieser Befehl ist auf diesem Server nicht verfügbar!',
                        ephemeral: true
                    });

                    return;
                }


                // ==============================================
                // ÖFFNUNGSZEITEN
                // ==============================================

                if (
                    cmdName ===
                    'oeffnungszeiten'
                ) {
                    const channel =
                        interaction.options.getChannel(
                            'kanal'
                        );

                    db.config.oeffnungsChannel =
                        channel.id;

                    saveData();

                    await interaction.reply({
                        content:
                            `✅ Öffnungszeiten-Log-Channel auf <#${channel.id}> gesetzt!`,
                        ephemeral: true
                    });

                    return;
                }


                // ==============================================
                // LADEZEIT
                // ==============================================

                if (cmdName === 'ladezeit') {

                    storeState.isOpen =
                        true;

                    storeState.openTimestamp =
                        Date.now();

                    await interaction.reply({
                        content:
                            '✅ Öffnungszeit-Messung wurde manuell gestartet!',
                        ephemeral: true
                    });

                    return;
                }


                // ==============================================
                // LAGER
                // ==============================================

                if (cmdName === 'lager') {

                    const sub =
                        interaction.options
                            .getSubcommand();

                    if (!db.lager) {
                        db.lager = {};
                    }


                    // ------------------------------------------
                    // ENTNAHME CHANNEL
                    // ------------------------------------------

                    if (
                        sub ===
                        'entnahme-channel'
                    ) {
                        const channel =
                            interaction.options
                                .getChannel('kanal');

                        db.config.entnahmeChannel =
                            channel.id;

                        saveData();

                        await interaction.reply({
                            content:
                                `✅ Entnahme-Log-Channel auf <#${channel.id}> gesetzt!`,
                            ephemeral: true
                        });
                    }


                    // ------------------------------------------
                    // EINLAGERUNGS CHANNEL
                    // ------------------------------------------

                    else if (
                        sub ===
                        'einlagerungs-channel'
                    ) {
                        const channel =
                            interaction.options
                                .getChannel('kanal');

                        db.config.einlagerungsChannel =
                            channel.id;

                        saveData();

                        await interaction.reply({
                            content:
                                `✅ Einlagerungs-Log-Channel auf <#${channel.id}> gesetzt!`,
                            ephemeral: true
                        });
                    }


                    // ------------------------------------------
                    // ANZEIGEN
                    // ------------------------------------------

                    else if (
                        sub === 'anzeigen'
                    ) {
                        const lagerPages =
                            generateLagerEmbeds();

                        await interaction.reply({
                            embeds: [
                                lagerPages[0]
                            ],
                            components: [
                                getLagerPaginationRow(
                                    0,
                                    lagerPages.length
                                )
                            ]
                        });
                    }


                    // ------------------------------------------
                    // SUCHEN
                    // ------------------------------------------

                    else if (
                        sub === 'suchen'
                    ) {
                        const query =
                            interaction.options
                                .getString('item')
                                .toLowerCase();

                        const matches =
                            Object.entries(
                                db.lager
                            ).filter(
                                ([item]) =>
                                    item
                                        .toLowerCase()
                                        .includes(query)
                            );

                        if (
                            matches.length ===
                            0
                        ) {
                            await interaction.reply({
                                content:
                                    `❌ Es wurde kein Item mit dem Namen "${query}" gefunden.`,
                                ephemeral: true
                            });

                            return;
                        }

                        let resultText = "";

                        matches.forEach(
                            ([item, count]) => {
                                resultText +=
                                    `• **${item}**: **${count}** Stück auf Lager\n`;
                            }
                        );

                        const embed =
                            new EmbedBuilder()
                                .setTitle(
                                    '🔍 Suchergebnis Lager'
                                )
                                .setColor(
                                    0x3498DB
                                )
                                .setDescription(
                                    resultText
                                )
                                .setTimestamp();

                        await interaction.reply({
                            embeds: [embed],
                            ephemeral: true
                        });
                    }


                    // ------------------------------------------
                    // HINZUFÜGEN
                    // ------------------------------------------

                    else if (
                        sub === 'hinzufügen'
                    ) {
                        const itemName =
                            interaction.options
                                .getString('item');

                        const amount =
                            interaction.options
                                .getInteger('anzahl');

                        if (amount <= 0) {
                            await interaction.reply({
                                content:
                                    '❌ Die Anzahl muss größer als 0 sein.',
                                ephemeral: true
                            });

                            return;
                        }

                        const foundKey =
                            Object.keys(
                                db.lager
                            ).find(
                                key =>
                                    key.toLowerCase() ===
                                    itemName.toLowerCase()
                            );

                        if (!foundKey) {
                            await interaction.reply({
                                content:
                                    `❌ Das Item "${itemName}" existiert nicht. Nutze \`/lager neu\` um es anzulegen.`,
                                ephemeral: true
                            });

                            return;
                        }

                        db.lager[foundKey] +=
                            amount;

                        saveData();

                        await interaction.reply({
                            content:
                                `✅ **${amount}x ${foundKey}** hinzugefügt. Neuer Bestand: **${db.lager[foundKey]}**`,
                            ephemeral: true
                        });
                    }


                    // ------------------------------------------
                    // ENTFERNEN
                    // ------------------------------------------

                    else if (
                        sub === 'entfernen'
                    ) {
                        const itemName =
                            interaction.options
                                .getString('item');

                        const amount =
                            interaction.options
                                .getInteger('anzahl');

                        if (amount <= 0) {
                            await interaction.reply({
                                content:
                                    '❌ Die Anzahl muss größer als 0 sein.',
                                ephemeral: true
                            });

                            return;
                        }

                        const foundKey =
                            Object.keys(
                                db.lager
                            ).find(
                                key =>
                                    key.toLowerCase() ===
                                    itemName.toLowerCase()
                            );

                        if (!foundKey) {
                            await interaction.reply({
                                content:
                                    `❌ Das Item "${itemName}" wurde nicht gefunden.`,
                                ephemeral: true
                            });

                            return;
                        }

                        db.lager[foundKey] =
                            Math.max(
                                0,
                                db.lager[foundKey] -
                                amount
                            );

                        saveData();

                        await interaction.reply({
                            content:
                                `✅ **${amount}x ${foundKey}** entfernt. Neuer Bestand: **${db.lager[foundKey]}**`,
                            ephemeral: true
                        });
                    }


                    // ------------------------------------------
                    // NEUES ITEM
                    // ------------------------------------------

                    else if (
                        sub === 'neu'
                    ) {
                        const itemName =
                            interaction.options
                                .getString('item')
                                .trim();

                        const amount =
                            interaction.options
                                .getInteger('anzahl');

                        if (!itemName) {
                            await interaction.reply({
                                content:
                                    '❌ Bitte gib einen Item-Namen an.',
                                ephemeral: true
                            });

                            return;
                        }

                        if (amount < 0) {
                            await interaction.reply({
                                content:
                                    '❌ Die Startanzahl darf nicht negativ sein.',
                                ephemeral: true
                            });

                            return;
                        }

                        const existingKey =
                            Object.keys(
                                db.lager
                            ).find(
                                key =>
                                    key.toLowerCase() ===
                                    itemName.toLowerCase()
                            );

                        if (existingKey) {
                            await interaction.reply({
                                content:
                                    `❌ Das Item **${existingKey}** existiert bereits.`,
                                ephemeral: true
                            });

                            return;
                        }

                        db.lager[itemName] =
                            amount;

                        saveData();

                        await interaction.reply({
                            content:
                                `✅ Neues Item **${itemName}** mit **${amount}** Stück angelegt!`,
                            ephemeral: true
                        });
                    }


                    // ------------------------------------------
                    // ITEM LÖSCHEN
                    // ------------------------------------------

                    else if (
                        sub === 'loeschen'
                    ) {
                        const itemName =
                            interaction.options
                                .getString('item');

                        const foundKey =
                            Object.keys(
                                db.lager
                            ).find(
                                key =>
                                    key.toLowerCase() ===
                                    itemName.toLowerCase()
                            );

                        if (!foundKey) {
                            await interaction.reply({
                                content:
                                    `❌ Das Item "${itemName}" existiert nicht.`,
                                ephemeral: true
                            });

                            return;
                        }

                        delete db.lager[
                            foundKey
                        ];

                        saveData();

                        await interaction.reply({
                            content:
                                `🗑️ Item **${foundKey}** komplett aus der Liste gelöscht.`,
                            ephemeral: true
                        });
                    }

                    return;
                }


                // ==============================================
                // EBILANZ
                // ==============================================

                if (
                    cmdName === 'ebilanz'
                ) {

                    const row1 =
                        new ActionRowBuilder()
                            .addComponents(
                                new ChannelSelectMenuBuilder()
                                    .setCustomId(
                                        'select_dienst'
                                    )
                                    .setPlaceholder(
                                        '1️⃣ Dienstzeit-Channel'
                                    )
                                    .addChannelTypes(
                                        ChannelType.GuildText
                                    )
                            );

                    const row2 =
                        new ActionRowBuilder()
                            .addComponents(
                                new ChannelSelectMenuBuilder()
                                    .setCustomId(
                                        'select_beschlag'
                                    )
                                    .setPlaceholder(
                                        '2️⃣ Beschlagnahmungs- & Freigabe-Channel'
                                    )
                                    .addChannelTypes(
                                        ChannelType.GuildText
                                    )
                            );

                    const row3 =
                        new ActionRowBuilder()
                            .addComponents(
                                new ChannelSelectMenuBuilder()
                                    .setCustomId(
                                        'select_rechnung'
                                    )
                                    .setPlaceholder(
                                        '3️⃣ Rechnungs-Channel (für Geld)'
                                    )
                                    .addChannelTypes(
                                        ChannelType.GuildText
                                    )
                            );

                    const row4 =
                        new ActionRowBuilder()
                            .addComponents(
                                new ChannelSelectMenuBuilder()
                                    .setCustomId(
                                        'select_bossmenu'
                                    )
                                    .setPlaceholder(
                                        '4️⃣ Bossmenü-Channel (Kontostand)'
                                    )
                                    .addChannelTypes(
                                        ChannelType.GuildText
                                    )
                            );

                    const row5 =
                        new ActionRowBuilder()
                            .addComponents(
                                new ChannelSelectMenuBuilder()
                                    .setCustomId(
                                        'select_output'
                                    )
                                    .setPlaceholder(
                                        '5️⃣ Wochenbilanz-Ausgabe-Channel'
                                    )
                                    .addChannelTypes(
                                        ChannelType.GuildText
                                    )
                            );

                    const btnRow =
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(
                                        'btn_save_config'
                                    )
                                    .setLabel(
                                        '💾 Alle Einstellungen speichern'
                                    )
                                    .setStyle(
                                        ButtonStyle.Success
                                    )
                            );

                    await interaction.reply({
                        content:
                            '⚙️ **Ebene 1/2:** Wähle die ersten Kanäle aus:',
                        components: [
                            row1,
                            row2,
                            row3
                        ],
                        ephemeral: true
                    });

                    await interaction.followUp({
                        content:
                            '⚙️ **Ebene 2/2:** Wähle die restlichen Kanäle aus und klicke auf Speichern:',
                        components: [
                            row4,
                            row5,
                            btnRow
                        ],
                        ephemeral: true
                    });

                    return;
                }


                // ==============================================
                // GIVEAWAY
                // ==============================================

                if (
                    cmdName === 'giveaway'
                ) {

                    const sub =
                        interaction.options
                            .getSubcommand();


                    if (sub === 'kanal') {

                        const channel =
                            interaction.options
                                .getChannel(
                                    'kanal'
                                );

                        db.config.giveawayChannel =
                            channel.id;

                        saveData();

                        await interaction.reply({
                            content:
                                `✅ Giveaway-Channel auf <#${channel.id}> gesetzt!`,
                            ephemeral: true
                        });

                        return;
                    }


                    if (sub === 'starten') {

                        if (
                            !db.config
                                .giveawayChannel
                        ) {
                            await interaction.reply({
                                content:
                                    '❌ Bitte lege zuerst mit `/giveaway kanal` einen Giveaway-Channel fest!',
                                ephemeral: true
                            });

                            return;
                        }

                        const modal =
                            new ModalBuilder()
                                .setCustomId(
                                    'modal_giveaway'
                                )
                                .setTitle(
                                    '🎉 Neues Giveaway erstellen'
                                );

                        const prizeInput =
                            new TextInputBuilder()
                                .setCustomId(
                                    'giveaway_prize'
                                )
                                .setLabel(
                                    'Was wird verlost?'
                                )
                                .setPlaceholder(
                                    'z.B. 5.000.000$ oder eine Spezialwaffe'
                                )
                                .setStyle(
                                    TextInputStyle.Short
                                )
                                .setRequired(true);

                        const durationInput =
                            new TextInputBuilder()
                                .setCustomId(
                                    'giveaway_duration'
                                )
                                .setLabel(
                                    'Dauer in Minuten (1 bis 1440 min / 24h)'
                                )
                                .setPlaceholder(
                                    'z.B. 10 oder 60'
                                )
                                .setStyle(
                                    TextInputStyle.Short
                                )
                                .setRequired(true);

                        modal.addComponents(
                            new ActionRowBuilder()
                                .addComponents(
                                    prizeInput
                                ),

                            new ActionRowBuilder()
                                .addComponents(
                                    durationInput
                                )
                        );

                        await interaction.showModal(
                            modal
                        );

                        return;
                    }
                }


                // ==============================================
                // LAGERÜBERWACHUNG
                // ==============================================

                if (
                    cmdName ===
                    'lagerüberwachung'
                ) {

                    const sub =
                        interaction.options
                            .getSubcommand();


                    if (sub === 'kanal') {

                        const channel =
                            interaction.options
                                .getChannel(
                                    'kanal'
                                );

                        db.config.lagerChannel =
                            channel.id;

                        saveData();

                        await interaction.reply({
                            content:
                                `✅ Lager-Log-Channel auf <#${channel.id}> gesetzt!`,
                            ephemeral: true
                        });

                        return;
                    }


                    if (sub === 'limit') {

                        const item =
                            interaction.options
                                .getString(
                                    'item'
                                )
                                .trim();

                        const limit =
                            interaction.options
                                .getInteger(
                                    'anzahl'
                                );

                        if (limit < 0) {
                            await interaction.reply({
                                content:
                                    '❌ Das Limit darf nicht negativ sein.',
                                ephemeral: true
                            });

                            return;
                        }

                        db.config
                            .lagerLimits[
                                item.toLowerCase()
                            ] = {
                                originalName:
                                    item,
                                max:
                                    limit
                            };

                        saveData();

                        await interaction.reply({
                            content:
                                `✅ Limit für **${item}** auf max. **${limit}** gesetzt!`,
                            ephemeral: true
                        });

                        return;
                    }


                    if (
                        sub === 'entfernen'
                    ) {

                        const item =
                            interaction.options
                                .getString(
                                    'item'
                                )
                                .trim()
                                .toLowerCase();

                        if (
                            db.config
                                .lagerLimits[item]
                        ) {

                            delete db.config
                                .lagerLimits[item];

                            saveData();

                            await interaction.reply({
                                content:
                                    `🗑️ Item **${item}** aus der Überwachung entfernt.`,
                                ephemeral: true
                            });

                        } else {

                            await interaction.reply({
                                content:
                                    `❌ Das Item **${item}** war nicht in der Liste.`,
                                ephemeral: true
                            });
                        }

                        return;
                    }


                    if (sub === 'liste') {

                        const limits =
                            db.config
                                .lagerLimits || {};

                        const entries =
                            Object.values(
                                limits
                            );

                        let text =
                            `📦 **Aktive Lager-Überwachung:**\n` +
                            `Log-Channel: ` +
                            `${db.config.lagerChannel ? `<#${db.config.lagerChannel}>` : "_Nicht gesetzt_"}\n\n` +
                            `**Geprüfte Items & Limits:**\n`;

                        if (
                            entries.length === 0
                        ) {

                            text +=
                                "_Keine Items konfiguriert._";

                        } else {

                            entries.forEach(
                                entry => {
                                    text +=
                                        `• **${entry.originalName}**: max. ${entry.max} Stück\n`;
                                }
                            );
                        }

                        await interaction.reply({
                            content: text,
                            ephemeral: true
                        });

                        return;
                    }
                }


                // ==============================================
                // ZBILANZ
                // ==============================================

                if (
                    cmdName === 'zbilanz'
                ) {

                    await interaction.deferReply({
                        ephemeral: true
                    });

                    const weekKey =
                        getCurrentWeekKey();

                    if (interaction.guild) {
                        await interaction.guild
                            .members
                            .fetch()
                            .catch(() => {});
                    }

                    const embeds =
                        await generateBilanzEmbeds(
                            weekKey,
                            interaction.guild
                        );

                    await interaction.editReply({
                        embeds: [
                            embeds[0]
                        ],
                        components: [
                            getPaginationRow(0)
                        ]
                    });

                    return;
                }


                // ==============================================
                // RESETBILANZ
                // ==============================================

                if (
                    cmdName === 'resetbilanz'
                ) {

                    const weekKey =
                        getCurrentWeekKey();

                    db.stats[weekKey] = {
                        users: {},
                        bankStart: null,
                        bankCurrent: null,
                        zollCount: 0,
                        zollGeld: 0,
                        oeffnungsMinuten: 0
                    };

                    saveData();

                    await interaction.reply({
                        content:
                            '🗑️ Statistiken auf 0 zurückgesetzt!',
                        ephemeral: true
                    });

                    return;
                }


                // ==============================================
                // PUBLISHBILANZ
                // ==============================================

                if (
                    cmdName ===
                    'publishbilanz'
                ) {

                    if (
                        !db.config.outputChannel
                    ) {
                        await interaction.reply({
                            content:
                                '❌ Kein Ausgabe-Channel konfiguriert!',
                            ephemeral: true
                        });

                        return;
                    }

                    await interaction.deferReply({
                        ephemeral: true
                    });

                    if (interaction.guild) {
                        await interaction.guild
                            .members
                            .fetch()
                            .catch(() => {});

                        await publishWeeklyReport(
                            interaction.guild
                        );

                    } else {

                        await publishWeeklyReport();
                    }

                    await interaction.editReply({
                        content:
                            '✅ Wochenbilanz wurde veröffentlicht!'
                    });

                    return;
                }


                // ==============================================
                // DIENSTZEIT
                // ==============================================

                if (
                    cmdName ===
                    'dienstzeit'
                ) {

                    const rawName =
                        interaction.options
                            .getString(
                                'name'
                            );

                    const minutesToAdd =
                        interaction.options
                            .getInteger(
                                'minuten'
                            );

                    const weekKey =
                        getCurrentWeekKey();

                    const cleanedName =
                        cleanName(
                            rawName
                        );

                    if (!db.stats[weekKey]) {
                        db.stats[weekKey] = {
                            users: {},
                            bankStart: null,
                            bankCurrent: null,
                            zollCount: 0,
                            zollGeld: 0,
                            oeffnungsMinuten: 0
                        };
                    }

                    if (
                        !db.stats[weekKey]
                            .users
                    ) {
                        db.stats[weekKey]
                            .users = {};
                    }

                    if (
                        !db.stats[weekKey]
                            .users[
                                cleanedName
                            ]
                    ) {
                        db.stats[weekKey]
                            .users[
                                cleanedName
                            ] = {
                                beschlagnahmen: 0,
                                freigaben: 0,
                                einnahmen: 0,
                                dienstzeitMinuten: 0
                            };
                    }

                    db.stats[weekKey]
                        .users[
                            cleanedName
                        ]
                        .dienstzeitMinuten +=
                        minutesToAdd;

                    if (
                        db.stats[weekKey]
                            .users[
                                cleanedName
                            ]
                            .dienstzeitMinuten < 0
                    ) {
                        db.stats[weekKey]
                            .users[
                                cleanedName
                            ]
                            .dienstzeitMinuten = 0;
                    }

                    saveData();

                    const currentTotal =
                        db.stats[weekKey]
                            .users[
                                cleanedName
                            ]
                            .dienstzeitMinuten;

                    await interaction.reply({
                        content:
                            `⏱️ Dienstzeit für **${cleanedName}** um **${minutesToAdd} Minuten** angepasst. Neuer Gesamtstand: **${formatTime(currentTotal)}**`,
                        ephemeral: true
                    });

                    return;
                }
            }


            // ==================================================
            // GIVEAWAY MODAL
            // ==================================================

            else if (
                interaction.isModalSubmit() &&
                interaction.customId ===
                    'modal_giveaway'
            ) {

                const prize =
                    interaction.fields
                        .getTextInputValue(
                            'giveaway_prize'
                        );

                const durationMin =
                    parseInt(
                        interaction.fields
                            .getTextInputValue(
                                'giveaway_duration'
                            ),
                        10
                    ) || 1;

                const clampedDuration =
                    Math.max(
                        1,
                        Math.min(
                            1440,
                            durationMin
                        )
                    );

                const endTime =
                    Date.now() +
                    (
                        clampedDuration *
                        60 *
                        1000
                    );

                const unixTimestamp =
                    Math.floor(
                        endTime / 1000
                    );

                const giveawayChannel =
                    await client.channels
                        .fetch(
                            db.config
                                .giveawayChannel
                        )
                        .catch(
                            () => null
                        );

                if (!giveawayChannel) {
                    await interaction.reply({
                        content:
                            '❌ Der eingestellte Giveaway-Channel wurde nicht gefunden!',
                        ephemeral: true
                    });

                    return;
                }

                const embed =
                    new EmbedBuilder()
                        .setTitle(
                            '🎉 GIVEAWAY 🎉'
                        )
                        .setColor(
                            0xFFD700
                        )
                        .setDescription(
                            `Gewinn: **${prize}**\n\n` +
                            `Klicke auf den Button unten, um teilzunehmen!\n\n` +
                            `👤 Ausgerufen von: <@${interaction.user.id}>\n` +
                            `⏳ Endet: <t:${unixTimestamp}:R> (<t:${unixTimestamp}:f>)\n` +
                            `👥 Teilnehmer: **0**`
                        )
                        .setTimestamp();

                const row =
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(
                                    'btn_enter_giveaway'
                                )
                                .setLabel(
                                    '🎉 Teilnehmen (0)'
                                )
                                .setStyle(
                                    ButtonStyle.Success
                                )
                        );

                const giveawayMessage =
                    await giveawayChannel.send({
                        content:
                            `<@&${GIVEAWAY_PING_ROLE_ID}> Ein neues Giveaway wurde gestartet! 🎉`,
                        embeds: [embed],
                        components: [row]
                    });


                // Giveaway-System initialisieren
                if (!client.giveaways) {
                    client.giveaways =
                        new Map();
                }

                client.giveaways.set(
                    giveawayMessage.id,
                    new Set()
                );


                // Giveaway Timer
                setTimeout(
                    async () => {

                        try {

                            const fetchedMsg =
                                await giveawayChannel
                                    .messages
                                    .fetch(
                                        giveawayMessage.id
                                    )
                                    .catch(
                                        () => null
                                    );

                            if (!fetchedMsg) {
                                return;
                            }

                            const storedEntries =
                                client.giveaways &&
                                client.giveaways.has(
                                    giveawayMessage.id
                                )
                                    ? Array.from(
                                        client.giveaways.get(
                                            giveawayMessage.id
                                        )
                                    )
                                    : [];

                            const endedEmbed =
                                EmbedBuilder
                                    .from(
                                        fetchedMsg
                                            .embeds[0]
                                    )
                                    .setColor(
                                        0x808080
                                    )
                                    .setTitle(
                                        '🎉 GIVEAWAY BEENDET 🎉'
                                    );

                            const disabledRow =
                                new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setCustomId(
                                                'btn_enter_giveaway'
                                            )
                                            .setLabel(
                                                'Beendet'
                                            )
                                            .setStyle(
                                                ButtonStyle.Secondary
                                            )
                                            .setDisabled(
                                                true
                                            )
                                    );


                            if (
                                storedEntries.length ===
                                0
                            ) {

                                endedEmbed.addFields({
                                    name:
                                        '🏆 Gewinner',
                                    value:
                                        '_Keine Teilnehmer._'
                                });

                                await giveawayChannel.send(
                                    `Das Giveaway für **${prize}** ist beendet. Leider gab es keine Teilnehmer.`
                                );

                            } else {

                                const winnerId =
                                    storedEntries[
                                        Math.floor(
                                            Math.random() *
                                            storedEntries.length
                                        )
                                    ];

                                endedEmbed.addFields({
                                    name:
                                        '🏆 Gewinner',
                                    value:
                                        `Herzlichen Glückwunsch! <@${winnerId}> hat **${prize}** gewonnen! 🎊`
                                });

                                await giveawayChannel.send(
                                    `Glückwunsch <@${winnerId}>! Du hast **${prize}** gewonnen! 🎉 <@&${GIVEAWAY_PING_ROLE_ID}>`
                                );
                            }


                            await fetchedMsg.edit({
                                content:
                                    '🎉 **GIVEAWAY BEENDET** 🎉',
                                embeds: [
                                    endedEmbed
                                ],
                                components: [
                                    disabledRow
                                ]
                            });


                            if (
                                client.giveaways
                            ) {
                                client.giveaways.delete(
                                    giveawayMessage.id
                                );
                            }

                        } catch (error) {

                            console.error(
                                "❌ Fehler beim Beenden des Giveaways:",
                                error
                            );
                        }

                    },
                    clampedDuration *
                    60 *
                    1000
                );


                await interaction.reply({
                    content:
                        `✅ Giveaway für **${prize}** erfolgreich in <#${db.config.giveawayChannel}> gestartet!`,
                    ephemeral: true
                });

                return;
            }


            // ==================================================
            // GIVEAWAY TEILNEHMEN
            // ==================================================

            else if (
                interaction.isButton() &&
                interaction.customId ===
                    'btn_enter_giveaway'
            ) {

                if (!client.giveaways) {
                    client.giveaways =
                        new Map();
                }

                const msgId =
                    interaction.message.id;

                if (
                    !client.giveaways.has(
                        msgId
                    )
                ) {
                    client.giveaways.set(
                        msgId,
                        new Set()
                    );
                }

                const participants =
                    client.giveaways.get(
                        msgId
                    );

                const userId =
                    interaction.user.id;

                let joined = false;

                if (
                    participants.has(
                        userId
                    )
                ) {

                    participants.delete(
                        userId
                    );

                    joined = false;

                } else {

                    participants.add(
                        userId
                    );

                    joined = true;
                }

                const count =
                    participants.size;

                const oldEmbed =
                    interaction.message
                        .embeds[0];

                const newEmbed =
                    EmbedBuilder.from(
                        oldEmbed
                    );

                let desc =
                    oldEmbed.description ||
                    "";

                desc =
                    desc.replace(
                        /👥 Teilnehmer: \*\*\d+\*\*/,
                        `👥 Teilnehmer: **${count}**`
                    );

                newEmbed.setDescription(
                    desc
                );

                const newRow =
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(
                                    'btn_enter_giveaway'
                                )
                                .setLabel(
                                    `🎉 Teilnehmen (${count})`
                                )
                                .setStyle(
                                    ButtonStyle.Success
                                )
                        );

                await interaction.update({
                    embeds: [
                        newEmbed
                    ],
                    components: [
                        newRow
                    ]
                });

                await interaction.followUp({
                    content:
                        joined
                            ? '✅ Du nimmst am Giveaway teil!'
                            : '❌ Du hast deine Teilnahme zurückgezogen.',
                    ephemeral: true
                });

                return;
            }


            // ==================================================
            // LAGER PAGINATION
            // ==================================================

            else if (
                interaction.isButton() &&
                (
                    interaction.customId ===
                        'lager_prev' ||
                    interaction.customId ===
                        'lager_next'
                )
            ) {

                await interaction.deferUpdate();

                const lagerPages =
                    generateLagerEmbeds();

                let currentPage = 0;

                const currentTitle =
                    interaction.message
                        .embeds[0]
                        ?.title || "";

                const match =
                    currentTitle.match(
                        /Seite (\d+)\/(\d+)/
                    );

                if (match) {
                    currentPage =
                        parseInt(
                            match[1],
                            10
                        ) - 1;
                }

                if (
                    interaction.customId ===
                        'lager_next' &&
                    currentPage <
                        lagerPages.length - 1
                ) {
                    currentPage++;
                }

                if (
                    interaction.customId ===
                        'lager_prev' &&
                    currentPage > 0
                ) {
                    currentPage--;
                }

                await interaction.editReply({
                    embeds: [
                        lagerPages[
                            currentPage
                        ]
                    ],
                    components: [
                        getLagerPaginationRow(
                            currentPage,
                            lagerPages.length
                        )
                    ]
                });

                return;
            }


            // ==================================================
            // BILANZ PAGINATION
            // ==================================================

            else if (
                interaction.isButton() &&
                (
                    interaction.customId ===
                        'prev_page' ||
                    interaction.customId ===
                        'next_page'
                )
            ) {

                await interaction.deferUpdate();

                const weekKey =
                    getCurrentWeekKey();

                if (interaction.guild) {
                    await interaction.guild
                        .members
                        .fetch()
                        .catch(() => {});
                }

                const embeds =
                    await generateBilanzEmbeds(
                        weekKey,
                        interaction.guild
                    );

                let currentPage = 0;

                const currentTitle =
                    interaction.message
                        .embeds[0]
                        ?.title || "";

                if (
                    currentTitle.includes(
                        'Seite 2'
                    )
                ) {
                    currentPage = 1;
                }

                if (
                    currentTitle.includes(
                        'Seite 3'
                    )
                ) {
                    currentPage = 2;
                }

                if (
                    interaction.customId ===
                        'next_page' &&
                    currentPage < 2
                ) {
                    currentPage++;
                }

                if (
                    interaction.customId ===
                        'prev_page' &&
                    currentPage > 0
                ) {
                    currentPage--;
                }

                await interaction.editReply({
                    embeds: [
                        embeds[
                            currentPage
                        ]
                    ],
                    components: [
                        getPaginationRow(
                            currentPage
                        )
                    ]
                });

                return;
            }


            // ==================================================
            // CHANNEL SELECT
            // ==================================================

            else if (
                interaction.isChannelSelectMenu()
            ) {

                const selectedChannelId =
                    interaction.values[0];

                if (
                    interaction.customId ===
                    'select_dienst'
                ) {
                    db.config.dienstChannel =
                        selectedChannelId;
                }

                if (
                    interaction.customId ===
                    'select_beschlag'
                ) {
                    db.config.beschlagChannel =
                        selectedChannelId;

                    db.config.freigabeChannel =
                        selectedChannelId;
                }

                if (
                    interaction.customId ===
                    'select_rechnung'
                ) {
                    db.config.rechnungChannel =
                        selectedChannelId;
                }

                if (
                    interaction.customId ===
                    'select_bossmenu'
                ) {
                    db.config.bossmenuChannel =
                        selectedChannelId;
                }

                if (
                    interaction.customId ===
                    'select_output'
                ) {
                    db.config.outputChannel =
                        selectedChannelId;
                }

                await interaction.deferUpdate();

                return;
            }


            // ==================================================
            // KONFIGURATION SPEICHERN
            // ==================================================

            else if (
                interaction.isButton() &&
                interaction.customId ===
                    'btn_save_config'
            ) {

                saveData();

                await interaction.update({
                    content:
                        '✅ Alle 5 Kanäle wurden erfolgreich und separat gespeichert!',
                    components: []
                });

                return;
            }

        } catch (error) {

            console.error(
                "❌ Fehler bei interactionCreate:",
                error
            );

            try {

                if (
                    interaction.replied ||
                    interaction.deferred
                ) {
                    await interaction.followUp({
                        content:
                            '❌ Beim Verarbeiten der Aktion ist ein Fehler aufgetreten.',
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content:
                            '❌ Beim Verarbeiten der Aktion ist ein Fehler aufgetreten.',
                        ephemeral: true
                    });
                }

            } catch (replyError) {
                console.error(
                    "Fehler beim Senden der Fehlermeldung:",
                    replyError
                );
            }
        }
    }
);


// ============================================================
// MESSAGE CREATE
// Automatische Logs aus Discord-Embeds
// ============================================================

client.on(
    'messageCreate',
    async message => {

        try {

            // Keine Embeds = nichts zu tun
            if (
                message.embeds.length === 0
            ) {
                return;
            }

            const channelId =
                message.channel.id;

            const weekKey =
                getCurrentWeekKey();

            const embed =
                message.embeds[0];

            const title =
                embed.title
                    ? embed.title
                        .toLowerCase()
                        .trim()
                    : "";


            // ==================================================
            // ÖFFNUNGSZEITEN
            // ==================================================

            if (
                db.config.oeffnungsChannel &&
                channelId ===
                    db.config.oeffnungsChannel
            ) {

                if (
                    title.includes(
                        "geschäft geöffnet"
                    )
                ) {

                    if (
                        storeState.isOpen
                    ) {
                        console.log(
                            "⚠️ Doppeltes Öffnen erkannt – Timer wird aktualisiert."
                        );
                    }

                    storeState.isOpen =
                        true;

                    storeState.openTimestamp =
                        Date.now();

                } else if (
                    title.includes(
                        "geschäft geschlossen"
                    )
                ) {

                    if (
                        storeState.isOpen &&
                        storeState.openTimestamp
                    ) {

                        const diffMs =
                            Date.now() -
                            storeState.openTimestamp;

                        const diffMins =
                            Math.round(
                                diffMs / 60000
                            );

                        if (
                            diffMins > 0
                        ) {

                            if (
                                !db.stats[
                                    weekKey
                                ]
                            ) {
                                db.stats[
                                    weekKey
                                ] = {
                                    users: {},
                                    bankStart: null,
                                    bankCurrent: null,
                                    zollCount: 0,
                                    zollGeld: 0,
                                    oeffnungsMinuten: 0
                                };
                            }

                            if (
                                db.stats[
                                    weekKey
                                ]
                                    .oeffnungsMinuten ===
                                undefined
                            ) {
                                db.stats[
                                    weekKey
                                ]
                                    .oeffnungsMinuten =
                                    0;
                            }

                            db.stats[
                                weekKey
                            ]
                                .oeffnungsMinuten +=
                                diffMins;

                            saveData();
                        }

                        storeState.isOpen =
                            false;

                        storeState.openTimestamp =
                            null;
                    }
                }
            }


            // ==================================================
            // LAGER - CHANNELS
            // ==================================================

            const isEntnahmeChannel =
                db.config.entnahmeChannel &&
                channelId ===
                    db.config.entnahmeChannel;

            const isEinlagerungsChannel =
                db.config.einlagerungsChannel &&
                channelId ===
                    db.config.einlagerungsChannel;


            if (
                (
                    isEntnahmeChannel &&
                    title.includes(
                        "item entnommen"
                    )
                ) ||
                (
                    isEinlagerungsChannel &&
                    title.includes(
                        "item eingelagert"
                    )
                )
            ) {

                const itemField =
                    getFieldValue(
                        embed,
                        [
                            "Item",
                            "Gegenstand",
                            "Name"
                        ]
                    );

                if (itemField) {

                    let itemName =
                        itemField.trim();

                    let amount = 1;


                    // ==========================================
                    // FORMAT: Item x5
                    // ==========================================

                    let match =
                        itemField.match(
                            /^(.+?)\s*x(\d+)$/i
                        );

                    if (match) {

                        itemName =
                            match[1].trim();

                        amount =
                            parseInt(
                                match[2],
                                10
                            ) || 1;

                    } else {

                        // ======================================
                        // FORMAT: Item 5
                        // ======================================

                        match =
                            itemField.match(
                                /^(.+?)\s+(\d+)$/
                            );

                        if (match) {

                            itemName =
                                match[1].trim();

                            amount =
                                parseInt(
                                    match[2],
                                    10
                                ) || 1;
                        }
                    }


                    // ==========================================
                    // WAFFEN
                    // Waffen zählen immer als 1
                    // ==========================================

                    const waffenListe = [
                        "sturmgewehr",
                        "spezialkarabiner",
                        "kompaktgewehr",
                        "doppelschrot",
                        "bullpup",
                        "fortgeschrittenes gewehr",
                        "schwerer revolver",
                        "pistole",
                        "mk2.pistole",
                        "schwere pistole",
                        "kampfpistole",
                        "wm pistolen",
                        "sns pistolen",
                        "messer",
                        "baseballschläger"
                    ];

                    const isWaffe =
                        waffenListe.some(
                            weapon =>
                                itemName
                                    .toLowerCase()
                                    .includes(
                                        weapon
                                    )
                        );

                    const realAmount =
                        isWaffe
                            ? 1
                            : amount;


                    if (!db.lager) {
                        db.lager = {};
                    }

                    const foundKey =
                        Object.keys(
                            db.lager
                        ).find(
                            key =>
                                key.toLowerCase() ===
                                itemName.toLowerCase()
                        );

                    if (foundKey) {

                        if (
                            isEntnahmeChannel &&
                            title.includes(
                                "item entnommen"
                            )
                        ) {

                            db.lager[
                                foundKey
                            ] =
                                Math.max(
                                    0,
                                    db.lager[
                                        foundKey
                                    ] -
                                    realAmount
                                );

                            saveData();

                        } else if (
                            isEinlagerungsChannel &&
                            title.includes(
                                "item eingelagert"
                            )
                        ) {

                            db.lager[
                                foundKey
                            ] +=
                                realAmount;

                            saveData();
                        }
                    }
                }
            }


            // ==================================================
            // LAGERÜBERWACHUNG
            // ==================================================

            if (
                db.config.lagerChannel &&
                channelId ===
                    db.config.lagerChannel &&
                title.includes(
                    "item entnommen"
                )
            ) {

                const itemField =
                    getFieldValue(
                        embed,
                        [
                            "Item",
                            "Gegenstand",
                            "Name"
                        ]
                    );

                const spielerField =
                    getFieldValue(
                        embed,
                        [
                            "Spieler"
                        ]
                    );

                if (itemField) {

                    const itemTextLower =
                        itemField.toLowerCase();

                    const matchNum =
                        itemField.match(
                            /x(\d+)/i
                        ) ||
                        itemField.match(
                            /(\d+)/
                        );

                    const entnommeneAnzahl =
                        matchNum
                            ? parseInt(
                                matchNum[1],
                                10
                            )
                            : 1;


                    for (
                        const [
                            key,
                            limitData
                        ] of Object.entries(
                            db.config
                                .lagerLimits || {}
                        )
                    ) {

                        if (
                            itemTextLower
                                .includes(key)
                        ) {

                            if (
                                entnommeneAnzahl >
                                limitData.max
                            ) {

                                await message.channel.send({
                                    content:
                                        `🚨 **LAGER-WARNUNG (SCHWUND?)** 🚨\n` +
                                        `Spieler **${spielerField || "Unbekannt"}** hat **${itemField}** entnommen!\n` +
                                        `Erlaubt sind max. **${limitData.max}** Stück.\n` +
                                        `<@&${MANAGEMENT_ROLE_ID}> Bitte prüfen!`
                                });
                            }

                            break;
                        }
                    }
                }
            }


            // ==================================================
            // WOCHENDATEN INITIALISIEREN
            // ==================================================

            if (!db.stats[weekKey]) {

                db.stats[weekKey] = {
                    users: {},
                    bankStart: null,
                    bankCurrent: null,
                    zollCount: 0,
                    zollGeld: 0,
                    oeffnungsMinuten: 0
                };
            }

            if (
                !db.stats[weekKey].users
            ) {
                db.stats[weekKey].users =
                    {};
            }

            if (
                db.stats[weekKey]
                    .zollCount ===
                undefined
            ) {
                db.stats[weekKey]
                    .zollCount = 0;
            }

            if (
                db.stats[weekKey]
                    .zollGeld ===
                undefined
            ) {
                db.stats[weekKey]
                    .zollGeld = 0;
            }

            if (
                db.stats[weekKey]
                    .oeffnungsMinuten ===
                undefined
            ) {
                db.stats[weekKey]
                    .oeffnungsMinuten = 0;
            }

            const weekData =
                db.stats[weekKey];


            // ==================================================
            // ZOLL-AUKTION
            // ==================================================

            if (
                title.includes(
                    "zoll-auktion beendet"
                )
            ) {

                const betragStr =
                    getFieldValue(
                        embed,
                        [
                            "society_steel",
                            "An society"
                        ]
                    );

                const gewinnBetrag =
                    betragStr
                        ? (
                            parseInt(
                                betragStr.replace(
                                    /[^0-9]/g,
                                    ''
                                ),
                                10
                            ) || 70000
                        )
                        : 70000;

                weekData.zollCount += 1;

                weekData.zollGeld +=
                    gewinnBetrag;

                saveData();

                return;
            }


            // ==================================================
            // BOSS MENU
            // ==================================================

            if (
                channelId ===
                    db.config.bossmenuChannel ||
                title.includes(
                    "geld auszahlung"
                ) ||
                title.includes(
                    "geld einzahlung"
                )
            ) {

                const kontostandStr =
                    getFieldValue(
                        embed,
                        [
                            "Neuer Kontostand"
                        ]
                    );

                if (kontostandStr) {

                    const kontostand =
                        parseInt(
                            kontostandStr.replace(
                                /[^0-9]/g,
                                ''
                            ),
                            10
                        ) || 0;

                    if (
                        weekData.bankStart ===
                        null
                    ) {
                        weekData.bankStart =
                            kontostand;
                    }

                    weekData.bankCurrent =
                        kontostand;

                    saveData();
                }
            }


            // ==================================================
            // USER INITIALISIEREN
            // ==================================================

            const initUser =
                (name) => {

                    const cleaned =
                        cleanName(name);

                    if (
                        !weekData.users[
                            cleaned
                        ]
                    ) {
                        weekData.users[
                            cleaned
                        ] = {
                            beschlagnahmen: 0,
                            freigaben: 0,
                            einnahmen: 0,
                            dienstzeitMinuten: 0
                        };
                    }

                    return cleaned;
                };


            // ==================================================
            // FREIGEGEBEN
            // ==================================================

            if (
                title.includes(
                    "freigegeben"
                )
            ) {

                const rawName =
                    getFieldValue(
                        embed,
                        [
                            "Mitarbeiter",
                            "Aussteller",
                            "Bearbeiter"
                        ]
                    );

                if (rawName) {

                    const user =
                        initUser(
                            rawName
                        );

                    weekData.users[
                        user
                    ].freigaben += 1;

                    saveData();
                }
            }


            // ==================================================
            // BESCHLAGNAHMT
            // ==================================================

            else if (
                title.includes(
                    "beschlagnahmt"
                )
            ) {

                const rawName =
                    getFieldValue(
                        embed,
                        [
                            "Mitarbeiter",
                            "Aussteller"
                        ]
                    );

                if (rawName) {

                    const user =
                        initUser(
                            rawName
                        );

                    weekData.users[
                        user
                    ].beschlagnahmen += 1;

                    saveData();
                }
            }


            // ==================================================
            // RECHNUNG
            // ==================================================

            else if (
                channelId ===
                    db.config.rechnungChannel ||
                title.includes(
                    "rechnung"
                )
            ) {

                const rawName =
                    getFieldValue(
                        embed,
                        [
                            "Aussteller",
                            "Mitarbeiter"
                        ]
                    );

                const betragStr =
                    getFieldValue(
                        embed,
                        [
                            "Betrag",
                            "Preis"
                        ]
                    );

                if (
                    rawName &&
                    betragStr
                ) {

                    const user =
                        initUser(
                            rawName
                        );

                    // KORREKT:
                    // Kein export_mime_type
                    const einnahme =
                        parseInt(
                            betragStr.replace(
                                /[^0-9]/g,
                                ''
                            ),
                            10
                        ) || 0;

                    weekData.users[
                        user
                    ].einnahmen +=
                        einnahme;

                    saveData();
                }
            }


            // ==================================================
            // DIENSTZEIT
            // ==================================================

            else if (
                channelId ===
                    db.config.dienstChannel ||
                (
                    embed.description &&
                    embed.description
                        .toLowerCase()
                        .includes(
                            "ausgestempelt"
                        )
                )
            ) {

                const desc =
                    embed.description || "";

                const nameMatch =
                    desc.match(
                        /\*\*(.*?)\*\*\s+hat sich ausgestempelt/i
                    );

                const timeMatch =
                    desc.match(
                        /Arbeitszeit:\s*\*?(\d+)h\s*\*?\s*(\d+)m/i
                    );

                if (
                    nameMatch &&
                    timeMatch
                ) {

                    const rawName =
                        nameMatch[1];

                    const hours =
                        parseInt(
                            timeMatch[1],
                            10
                        ) || 0;

                    const minutes =
                        parseInt(
                            timeMatch[2],
                            10
                        ) || 0;

                    const totalMinutes =
                        (hours * 60) +
                        minutes;

                    const user =
                        initUser(
                            rawName
                        );

                    weekData.users[
                        user
                    ].dienstzeitMinuten +=
                        totalMinutes;

                    saveData();
                }
            }

        } catch (error) {

            console.error(
                "❌ Fehler bei messageCreate:",
                error
            );
        }
    }
);


// ============================================================
// WOCHENBILANZ VERÖFFENTLICHEN
// ============================================================

async function publishWeeklyReport(
    guild = null
) {

    if (
        !db.config.outputChannel
    ) {
        console.log(
            "⚠️ Kein Bilanz-Ausgabe-Channel konfiguriert."
        );

        return;
    }

    const channel =
        await client.channels
            .fetch(
                db.config.outputChannel
            )
            .catch(
                () => null
            );

    if (!channel) {
        console.log(
            "⚠️ Bilanz-Ausgabe-Channel nicht gefunden."
        );

        return;
    }

    if (!guild) {
        guild =
            channel.guild;
    }

    const weekKey =
        getCurrentWeekKey();

    const embeds =
        await generateBilanzEmbeds(
            weekKey,
            guild
        );

    await channel.send({
        embeds: [
            embeds[0]
        ],
        components: [
            getPaginationRow(0)
        ]
    });

    console.log(
        `✅ Wochenbilanz ${weekKey} wurde veröffentlicht.`
    );
}


// ============================================================
// BOT LOGIN
// ============================================================

if (!process.env.DISCORD_TOKEN) {
    console.error(
        "❌ DISCORD_TOKEN wurde nicht in der .env gefunden!"
    );

    process.exit(1);
}

client.login(
    process.env.DISCORD_TOKEN
).catch(error => {
    console.error(
        "❌ Discord Login fehlgeschlagen:",
        error
    );
});
