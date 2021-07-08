const guildExt = require('../extends/guildExt');

module.exports = {
	name: 'config',
	type: 'on',
	description: 'Change bot configuration',
	args: true,
	permissions: '...',
	execute(message, args) {
		const keyPrefix = '--prefix:';
		const keyReactionIde = '--reactionidentifier:';

		function getValueArg(arguments, key) {
			const func = (arg) => arg.toLowerCase().startsWith(key);
			if (arguments.some(func)) {
				const found = arguments.find(func);
				if (found != null) {
					const sliced = found.slice(key.length);
					return sliced.startsWith('<:') && sliced.endsWith('>')
						? sliced.slice(2, sliced.length - 1)
						: sliced;
				}
			}
			return null;
		}

		const prefix = getValueArg(args, keyPrefix);
		const reactionIdentifier = getValueArg(args, keyReactionIde);

		guildExt.guildSetConfig(message.guild.id, { prefix, reactionIdentifier });

		message.reply('Configured success');
	}

};