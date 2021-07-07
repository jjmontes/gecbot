const guildExt = require('../extends/guildExt');

module.exports = {
    name: 'message',
    type: 'on',
    execute(message) {
        const config = guildExt.guildConfig(message.guild.id);
        const prefix = config.prefix;

        if (!message.content.startsWith(prefix) || message.author.bot) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
    
        const command = message.client.commands.get(commandName);
        if (!command) return;
        
        console.log(command.permissions);
        if (command.permissions) {
            const authorPerms = message.channel.permissionsFor(message.author);
            if (!authorPerms || !authorPerms.has(command.permissions)) {
                return message.reply('You can not do this!');
            }
        }
        try {
            command.execute(message, args);
        } catch (error) {
            console.log(error);
            message.reply('there was an error trying to execute that command!');
        }
    }
}