const {
PermissionsBitField,
ChannelType,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} = require('discord.js')

const QRCode = require('qrcode')

const filas = {}
const apostas = {}
const perfis = {}

module.exports = {

name: 'interactionCreate',

async execute(interaction) {

if (!interaction.isButton()) return

// ====================================
// ENTRAR FILA
// ====================================

if (interaction.customId.startsWith('fila_')) {

const fila = interaction.customId

if (!filas[fila]) {
filas[fila] = []
}

if (filas[fila].includes(interaction.user.id)) {

return interaction.reply({
content: 'Você já entrou.',
ephemeral: true
})
}

filas[fila].push(interaction.user.id)

await interaction.reply({
content: 'Entrou na fila.',
ephemeral: true
})

// ====================================
// MATCH
// ====================================

if (filas[fila].length >= 2) {

const jogadores = filas[fila].splice(0, 2)

const canal = await interaction.guild.channels.create({
name: `aposta-${Date.now()}`,
type: ChannelType.GuildText,
parent: interaction.guild.channels.cache.find(
c => c.name === '💸 APOSTAS'
)?.id,

permissionOverwrites: [
{
id: interaction.guild.id,
deny: [PermissionsBitField.Flags.ViewChannel]
},
...jogadores.map(id => ({
id,
allow: [PermissionsBitField.Flags.ViewChannel]
}))
]
})

apostas[canal.id] = {
jogadores,
confirmados: []
}

const embed = new EmbedBuilder()
.setTitle('💸 CONFIRMAÇÃO')
.setDescription(`
${jogadores.map(id => `<@${id}>`).join('\n')}

Confirmem abaixo.
`)
.setThumbnail(interaction.guild.iconURL())
.setColor('#00ff88')

const row = new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId('confirmar')
.setLabel('Confirmar')
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId('cancelar')
.setLabel('Cancelar')
.setStyle(ButtonStyle.Danger)
)

await canal.send({
content: jogadores.map(id => `<@${id}>`).join(' '),
embeds: [embed],
components: [row]
})
}
}

// ====================================
// SAIR FILA
// ====================================

if (interaction.customId.startsWith('sair_')) {

const fila = interaction.customId.replace('sair_', 'fila_')

if (!filas[fila]) return

filas[fila] = filas[fila].filter(
id => id !== interaction.user.id
)

interaction.reply({
content: 'Saiu da fila.',
ephemeral: true
})
}

// ====================================
// CANCELAR
// ====================================

if (interaction.customId === 'cancelar') {

interaction.reply({
content: 'Aposta cancelada.'
})

setTimeout(() => {
interaction.channel.delete()
}, 3000)
}

// ====================================
// CONFIRMAR
// ====================================

if (interaction.customId === 'confirmar') {

const aposta = apostas[interaction.channel.id]

if (!aposta.confirmados.includes(interaction.user.id)) {
aposta.confirmados.push(interaction.user.id)
}

interaction.reply({
content: 'Confirmado.',
ephemeral: true
})

if (aposta.confirmados.length >= 2) {

await interaction.channel.bulkDelete(100)

const embed = new EmbedBuilder()
.setTitle('🎮 APOSTA INICIADA')
.setDescription(`
Mediador chamado.
`)
.setThumbnail(interaction.guild.iconURL())
.setColor('#00ff88')

const row = new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId('pix')
.setLabel('Enviar PIX')
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId('sala')
.setLabel('Fornecer Sala')
.setStyle(ButtonStyle.Primary),

new ButtonBuilder()
.setCustomId('finalizar')
.setLabel('Finalizar')
.setStyle(ButtonStyle.Danger)
)

interaction.channel.send({
embeds: [embed],
components: [row]
})
}
}

// ====================================
// PIX
// ====================================

if (interaction.customId === 'pix') {

const chave = '11999999999'

const qr = await QRCode.toDataURL(chave)

const embed = new EmbedBuilder()
.setTitle('💸 PAGAMENTO')
.setDescription(`
PIX:

${chave}
`)
.setImage(qr)
.setColor('#00ff88')

interaction.reply({
embeds: [embed]
})
}

// ====================================
// SALA
// ====================================

if (interaction.customId === 'sala') {

const embed = new EmbedBuilder()
.setTitle('🎮 SALA')
.setDescription(`
ID:
123456

Senha:
123456
`)
.setColor('#00ff88')

interaction.reply({
embeds: [embed]
})
}

// ====================================
// FINALIZAR
// ====================================

if (interaction.customId === 'finalizar') {

const aposta = apostas[interaction.channel.id]

const vencedor = aposta.jogadores[0]
const perdedor = aposta.jogadores[1]

if (!perfis[vencedor]) {
perfis[vencedor] = {
wins: 0,
loses: 0
}
}

if (!perfis[perdedor]) {
perfis[perdedor] = {
wins: 0,
loses: 0
}
}

perfis[vencedor].wins += 1
perfis[perdedor].loses += 1

interaction.reply({
content: 'Aposta finalizada.'
})

setTimeout(() => {
interaction.channel.delete()
}, 5000)
}
}
