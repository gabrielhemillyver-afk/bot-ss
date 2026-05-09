require('dotenv').config()

const fs = require('fs')

const {
Client,
Collection,
GatewayIntentBits
} = require('discord.js')

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
GatewayIntentBits.GuildMembers
]
})

client.commands = new Collection()

const commandFiles = fs.readdirSync('./commands')

for (const file of commandFiles) {

const command = require(`./commands/${file}`)

client.commands.set(command.name, command)
}

const eventFiles = fs.readdirSync('./events')

for (const file of eventFiles) {

const event = require(`./events/${file}`)

if (event.once) {
client.once(event.name, (...args) => event.execute(...args, client))
} else {
client.on(event.name, (...args) => event.execute(...args, client))
}
}

client.login(process.env.TOKEN)
