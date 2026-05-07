const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// ================= CONFIG =================

const TOKEN = process.env.TOKEN;

const ADM_ROLE = "1369875645517135912";
const SS_ROLE = "1408860254342615070";
const SOLICITACOES_CHANNEL = "1450166106114228224";

const PREFIX = ".";

// ==========================================

client.once("ready", () => {
    console.log(`✅ ${client.user.tag} online.`);
});

// ==========================================
// COMANDOS
// ==========================================

client.on("messageCreate", async (message) => {

    if (message.author.bot) return;
    if (!message.guild) return;

    // ======================================
    // COMANDO .SSMOB
    // ======================================

    if (message.content.toLowerCase() === `${PREFIX}ssmob`) {

        if (!message.member.roles.cache.has(ADM_ROLE)) {
            return message.reply("❌ Você não possui permissão.");
        }

        const canalSolicitacoes = message.guild.channels.cache.get(SOLICITACOES_CHANNEL);

        if (!canalSolicitacoes) {
            return message.reply("❌ Canal de solicitações não encontrado.");
        }

        const embed = new EmbedBuilder()
            .setColor("#00B0F4")
            .setTitle("📱 SOLICITAÇÃO SS MOBILE")
            .setDescription(
                `### Nova solicitação de SS\n` +
                `📍 Canal: ${message.channel}\n` +
                `👮 Staff: ${message.author}\n\n` +
                `Clique no botão abaixo para assumir esta SS.`
            )
            .setFooter({
                text: "Sistema de SS"
            })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`aceitar_mob_${message.channel.id}`)
                .setLabel("Aceitar SS")
                .setEmoji("✅")
                .setStyle(ButtonStyle.Success)
        );

        await canalSolicitacoes.send({
            embeds: [embed],
            components: [row]
        });

        await message.reply("✅ Solicitação enviada.");
    }

    // ======================================
    // COMANDO .SSEMU
    // ======================================

    if (message.content.toLowerCase() === `${PREFIX}ssemu`) {

        if (!message.member.roles.cache.has(ADM_ROLE)) {
            return message.reply("❌ Você não possui permissão.");
        }

        const canalSolicitacoes = message.guild.channels.cache.get(SOLICITACOES_CHANNEL);

        if (!canalSolicitacoes) {
            return message.reply("❌ Canal de solicitações não encontrado.");
        }

        const embed = new EmbedBuilder()
            .setColor("#ff9900")
            .setTitle("💻 SOLICITAÇÃO SS EMULADOR")
            .setDescription(
                `### Nova solicitação de SS\n` +
                `📍 Canal: ${message.channel}\n` +
                `👮 Staff: ${message.author}\n\n` +
                `Clique no botão abaixo para assumir esta SS.`
            )
            .setFooter({
                text: "Sistema de SS"
            })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`aceitar_emu_${message.channel.id}`)
                .setLabel("Aceitar SS")
                .setEmoji("✅")
                .setStyle(ButtonStyle.Success)
        );

        await canalSolicitacoes.send({
            embeds: [embed],
            components: [row]
        });

        await message.reply("✅ Solicitação enviada.");
    }

});

// ==========================================
// BOTÕES
// ==========================================

client.on("interactionCreate", async (interaction) => {

    if (!interaction.isButton()) return;

    // ======================================
    // ACEITAR SS
    // ======================================

    if (interaction.customId.startsWith("aceitar")) {

        if (!interaction.member.roles.cache.has(SS_ROLE)) {
            return interaction.reply({
                content: "❌ Apenas a equipe SS pode aceitar.",
                ephemeral: true
            });
        }

        const partes = interaction.customId.split("_");
        const canalId = partes[2];

        const canal = interaction.guild.channels.cache.get(canalId);

        if (!canal) {
            return interaction.reply({
                content: "❌ Canal não encontrado.",
                ephemeral: true
            });
        }

        // ==================================
        // LIBERAR CANAL
        // ==================================

        await canal.permissionOverwrites.edit(SS_ROLE, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
        });

        // ==================================
        // DESATIVAR BOTÃO
        // ==================================

        const rowDesativada = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("ss_assumida")
                .setLabel(`Assumida por ${interaction.user.username}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
        );

        await interaction.update({
            components: [rowDesativada]
        });

        // ==================================
        // PAINEL RESULTADO
        // ==================================

        const resultadoRow = new ActionRowBuilder().addComponents(

            new ButtonBuilder()
                .setCustomId(`vitoria_${canal.id}`)
                .setLabel("Vitória")
                .setEmoji("🏆")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId(`wo_${canal.id}`)
                .setLabel("W.O")
                .setEmoji("❌")
                .setStyle(ButtonStyle.Danger)
        );

        const embedAceita = new EmbedBuilder()
            .setColor("#57F287")
            .setTitle("✅ SS ACEITA")
            .setDescription(
                `👤 Responsável: ${interaction.user}\n` +
                `📍 Canal liberado para SS.`
            )
            .setTimestamp();

        await canal.send({
            embeds: [embedAceita],
            components: [resultadoRow]
        });
    }

    // ======================================
    // BOTÃO VITÓRIA
    // ======================================

    if (interaction.customId.startsWith("vitoria")) {

        if (!interaction.member.roles.cache.has(SS_ROLE)) {
            return interaction.reply({
                content: "❌ Apenas equipe SS.",
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor("#57F287")
            .setTitle("🏆 RESULTADO FINAL")
            .setDescription(
                `Resultado: **VITÓRIA**\n` +
                `👤 Responsável: ${interaction.user}`
            )
            .setTimestamp();

        await interaction.channel.send({
            embeds: [embed]
        });

        await interaction.reply({
            content: "✅ Resultado enviado.",
            ephemeral: true
        });
    }

    // ======================================
    // BOTÃO WO
    // ======================================

    if (interaction.customId.startsWith("wo")) {

        if (!interaction.member.roles.cache.has(SS_ROLE)) {
            return interaction.reply({
                content: "❌ Apenas equipe SS.",
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor("#ED4245")
            .setTitle("❌ RESULTADO FINAL")
            .setDescription(
                `Resultado: **W.O**\n` +
                `👤 Responsável: ${interaction.user}`
            )
            .setTimestamp();

        await interaction.channel.send({
            embeds: [embed]
        });

        await interaction.reply({
            content: "✅ Resultado enviado.",
            ephemeral: true
        });
    }

});

// ==========================================

client.login(TOKEN);
