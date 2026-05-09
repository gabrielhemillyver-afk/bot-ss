require('dotenv').config()

const {
Client,
GatewayIntentBits,
PermissionsBitField,
ChannelType,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} = require('discord.js')

const QRCode = require('qrcode')

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
GatewayIntentBits.GuildMembers
]
})

const filas = {}
const apostas = {}
const perfis = {}
const pixDB = {}
const mediadores = []

client.once('ready', () => {
console.log('BOT ONLINE')
})

client.on('messageCreate', async message => {

if (message.author.bot) return

// =====================================
// !ORG
// =====================================

if (message.content === '!org') {

if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
return message.reply('Sem permissão')
}

const cargos = [
'DONO',
'SUB DONO',
'CEO',
'GERENTE',
'DIRETOR',
'DIR SS',
'ADM',
'SUP',
'SS',
'MEDIADOR'
]

for (const cargo of cargos) {

if (!message.guild.roles.cache.find(r => r.name === cargo)) {

await message.guild.roles.create({
name: cargo,
color: 'Random'
})
}
}

const categoriaFilas = await message.guild.channels.create({
name: '🎮 FILAS',
type: ChannelType.GuildCategory
})

const categoriaApostas = await message.guild.channels.create({
name: '💸 APOSTAS',
type: ChannelType.GuildCategory
})

const categoriaMedia = await message.guild.channels.create({
name: '🎧 MEDIAÇÃO',
type: ChannelType.GuildCategory
})

const categoriaSS = await message.guild.channels.create({
name: '🛡️ SS',
type: ChannelType.GuildCategory
})

const canais = [
'1x1-mobile',
'2x2-mobile',
'3x3-mobile',
'4x4-mobile',

'1x1-misto',
'2x2-misto',
'3x3-misto',
'4x4-misto',

'1x1-emulador',
'2x2-emulador',
'3x3-emulador',
'4x4-emulador'
]

for (const nome of canais) {

const canal = await message.guild.channels.create({
name: nome,
parent: categoriaFilas.id,
type: ChannelType.GuildText
})

const embed = new EmbedBuilder()
.setTitle('🎮 FILA')
.setDescription('Clique abaixo para entrar.')
.setThumbnail(message.guild.iconURL())
.setColor('#00ff88')

const row = new ActionRowBuilder()
.addComponents(
new ButtonBuilder()
.setCustomId(`entrar_${nome}`)
.setLabel('Entrar')
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId(`sair_${nome}`)
.setLabel('Sair')
.setStyle(ButtonStyle.Danger)
)

await canal.send({
embeds: [embed],
components: [row]
})
}

await message.guild.channels.create({
name: 'fila-mediadores',
parent: categoriaMedia.id,
type: ChannelType.GuildText
})

await message.guild.channels.create({
name: 'solicitacao-ss',
parent: categoriaSS.id,
type: ChannelType.GuildText
})

message.reply('ORG CRIADA')
}

// =====================================
// PERFIL
// =====================================

if (message.content.startsWith('.p')) {

const user = message.mentions.users.first() || message.author

if (!perfis[user.id]) {
perfis[user.id] = {
wins: 0,
loses: 0
}
}

const perfil = perfis[user.id]

const embed = new EmbedBuilder()
.setTitle('📊 PERFIL')
.setDescription(`
👑 Vitórias:
${perfil.wins}

❌ Derrotas:
${perfil.loses}
`)
.setThumbnail(user.displayAvatarURL())
.setColor('#00ff88')

message.reply({
embeds: [embed]
})
}

// =====================================
// PIX
// =====================================

if (message.content.startsWith('!pix')) {

const args = message.content.split(' ').slice(1)

const chave = args[0]

if (!chave) {
return message.reply('Use !pix chave')
}

pixDB[message.author.id] = chave

message.reply('PIX CONFIGURADO')
}

// =====================================
// SSMOB
// =====================================

if (message.content === '.ssmob') {

const canal = message.guild.channels.cache.find(
c => c.name === 'solicitacao-ss'
)

if (!canal) return

const embed = new EmbedBuilder()
.setTitle('🚨 SS MOBILE')
.setDescription(`${message.author} solicitou SS`)
.setColor('#ff0000')

const row = new ActionRowBuilder()
.addComponents(
new ButtonBuilder()
.setCustomId('aceitar_ss')
.setLabel('Aceitar')
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId('wo_ss')
.setLabel('W.O')
.setStyle(ButtonStyle.Danger),

new ButtonBuilder()
.setCustomId('limpo_ss')
.setLabel('Limpo')
.setStyle(ButtonStyle.Primary)
)

canal.send({
embeds: [embed],
components: [row]
})
}

// =====================================
// SSEMU
// =====================================

if (message.content === '.ssemu') {

const canal = message.guild.channels.cache.find(
c => c.name === 'solicitacao-ss'
)

if (!canal) return

const embed = new EmbedBuilder()
.setTitle('🚨 SS EMULADOR')
.setDescription(`${message.author} solicitou SS`)
.setColor('#ff0000')

canal.send({
embeds: [embed]
})
}

// =====================================
// LIMPAR
// =====================================

if (message.content === '!limpar') {

const mensagens = await message.channel.messages.fetch()

await message.channel.bulkDelete(mensagens)

message.channel.send('CANAL LIMPO')
}
})

// =====================================
// BOTÕES
// =====================================

client.on('interactionCreate', async interaction => {

if (!interaction.isButton()) return

// =====================================
// ENTRAR FILA
// =====================================

if (interaction.customId.startsWith('entrar_')) {

const fila = interaction.customId.replace('entrar_', '')

if (!filas[fila]) {
filas[fila] = []
}

if (filas[fila].includes(interaction.user.id)) {

return interaction.reply({
content: 'Você já entrou',
ephemeral: true
})
}

filas[fila].push(interaction.user.id)

interaction.reply({
content: 'Entrou na fila',
ephemeral: true
})

if (filas[fila].length >= 2) {

const jogadores = filas[fila].splice(0, 2)

const canal = await interaction.guild.channels.create({
name: `aposta-${Date.now()}`,
parent: interaction.guild.channels.cache.find(
c => c.name === '💸 APOSTAS'
)?.id,
type: ChannelType.GuildText,
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

canal.send({
content: jogadores.map(id => `<@${id}>`).join(' '),
embeds: [embed],
components: [row]
})
}
}

// =====================================
// SAIR FILA
// =====================================

if (interaction.customId.startsWith('sair_')) {

const fila = interaction.customId.replace('sair_', '')

if (!filas[fila]) return

filas[fila] = filas[fila].filter(
id => id !== interaction.user.id
)

interaction.reply({
content: 'Saiu da fila',
ephemeral: true
})
}

// =====================================
// CONFIRMAR
// =====================================

if (interaction.customId === 'confirmar') {

const aposta = apostas[interaction.channel.id]

if (!aposta.confirmados.includes(interaction.user.id)) {
aposta.confirmados.push(interaction.user.id)
}

interaction.reply({
content: 'Confirmado',
ephemeral: true
})

if (aposta.confirmados.length >= 2) {

await interaction.channel.bulkDelete(100)

const embed = new EmbedBuilder()
.setTitle('🎮 APOSTA INICIADA')
.setDescription('Mediador chamado.')
.setThumbnail(interaction.guild.iconURL())
.setColor('#00ff88')

const row = new ActionRowBuilder()
.addComponents(
new ButtonBuilder()
.setCustomId('pix')
.setLabel('Liberar Pagamento')
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

// =====================================
// CANCELAR
// =====================================

if (interaction.customId === 'cancelar') {

interaction.reply({
content: 'Aposta cancelada'
})

setTimeout(() => {
interaction.channel.delete()
}, 3000)
}

// =====================================
// PIX
// =====================================

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

// =====================================
// SALA
// =====================================

if (interaction.customId === 'sala') {

const embed = new EmbedBuilder()
.setTitle('🎮 SALA')
.setDescription(`
ID: 123456

SENHA: 123456
`)
.setColor('#00ff88')

interaction.reply({
embeds: [embed]
})
}

// =====================================
// FINALIZAR
// =====================================

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
content: 'Aposta finalizada'
})

setTimeout(() => {
interaction.channel.delete()
}, 5000)
}

// =====================================
// SS
// =====================================

if (interaction.customId === 'aceitar_ss') {

interaction.reply({
content: 'SS ACEITO'
})
}

if (interaction.customId === 'wo_ss') {

interaction.reply({
content: 'W.O aplicado'
})
}

if (interaction.customId === 'limpo_ss') {

interaction.reply({
content: 'PLAYER LIMPO'
})
}
})

client.login(process.env.TOKEN)
