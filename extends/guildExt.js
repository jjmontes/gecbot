const locallydb = require('locallydb');
const db = new locallydb('./database');
const defaultconfig = { id: -1, prefix: 'GECBOT ', reactionIdentifier: '' };

module.exports = {
    name: 'guildExt',
    guildConfig(guildid) {
        const configs = db.collection('configs');

        const guilds = configs.where({id: guildid});
        if (guilds.items.length !== 0)	return guilds.items[0];
    
        const config = { ...defaultconfig };
        config.id = guildid;
        configs.insert(config);
    
        configs.save();
    
        return config;
    },
    guildSetConfig(guildid, newconfig) {
        console.log(newconfig);
        
        const configs = db.collection('configs');
        const guilds = configs.where({id: guildid});

        const config = { ...defaultconfig };
        config.id = guildid;

        const guild = guilds.items.length !== 0
            ? guilds.items[0]
            : config;

        guild.prefix = newconfig.prefix || guild.prefix;
        guild.reactionIdentifier = newconfig.reactionIdentifier || guild.reactionIdentifier;

        if (guild.cid === undefined)
            configs.insert(guild);
        else
            configs.update(guild.cid, guild);
    }
}