const {
PermissionsBitField,
ChannelType,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} = require('discord.js')

module.exports = {

name: 'org',

async execute(message) {

if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
return message.reply('Sem permissão.')
}

// =========================
// CARGOS
// =========================

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

// =========================
// CATEGORIAS
// =========================

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

// =========================
// FILAS
// =========================

const filas = [

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

for (const fila of filas) {

const canal = await message.guild.channels.create({
name: fila,
type: ChannelType.GuildText,
parent: categoriaFilas.id
})

const embed = new EmbedBuilder()
.setTitle('🎮 FILA')
.setDescription(`
Clique abaixo para entrar na fila.

Modo:
${fila}
`)
.setThumbnail(message.guild.iconURL())
.setColor('#00ff88')

const row = new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId(`fila_${fila}`)
.setLabel('Entrar')
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId(`sair_${fila}`)
.setLabel('Sair')
.setStyle(ButtonStyle.Danger)
)

await canal.send({
embeds: [embed],
components: [row]
})
}

// =========================
// MEDIAÇÃO
// =========================

await message.guild.channels.create({
name: 'fila-mediadores',
type: ChannelType.GuildText,
parent: categoriaMedia.id
})

// =========================
// SS
// =========================

await message.guild.channels.create({
name: 'solicitacao-ss',
type: ChannelType.GuildText,
parent: categoriaSS.id
})

message.reply('ORG CRIADA.')
}
}
