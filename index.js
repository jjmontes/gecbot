const fs = require('fs');
const guildExt = require('./extends/guildExt');
const locallydb = require('locallydb');
const db = new locallydb('./database');
const servers = db.collection('servers');
const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.commands = new Discord.Collection();

const { token } = require('./config.json');

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	client.commands.set(command.name, command);
}

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	switch (event.type)	{
	case 'once':
		client.once(event.name, (...args) => event.execute(...args, client));
		break;
	default:
		client.on(event.name, (...args) => event.execute(...args, client));
		break;
	}
}

client.on('messageReactionAdd', async (reaction, user) => {
	const config = guildExt.guildConfig(reaction.message.guild.id);

	if (config.reactionIdentifier === '') {
		reaction.message.reply(`No hay reacción configurada. Este identificador de emoji  es "${reaction.emoji.identifier}"`);
		console.log(`No reaction configured. This emoji identifier is "${reaction.emoji.identifier}"`);

		return;
	}

	// When a reaction is received, check if the structure is partial
	if (reaction.partial) {
		// If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message: ', error);
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
	}

	// Now the message has been cached and is fully available
	// The reaction is now also fully available and the properties will be reflected accurately:
	if (reaction.emoji.identifier === config.reactionIdentifier) {
		registerReaction(reaction.message, user);
	}
});

client.login(token);

function registerReaction(message, user) {
	let guildsfound = servers.where({ id: message.guild.id });
	if (guildsfound.items.length == 0)	{
		servers.insert({ id: message.guild.id, rewards: [] });
		guildsfound = servers.where({ id: message.guild.id });
	}
	const guild = guildsfound.items[0];
	const reward = { from: user.id, to: message.author.id, when: new Date() };
	if (guild.rewards == null) guild.rewards = [];
	guild.rewards.push(reward);
	servers.update(guild.cid, guild);

	servers.save();
}