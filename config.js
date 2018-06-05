exports.server = {
	game: {
		port: 3001,
		name: 'RockMUD',
		version: '0.4.0',
		website: 'https://github.com/MoreOutput/RockMUD',
		description: 'Websockets MUD Engine Demo',
		// Name of world currency -- referenced in game
		coinage: 'gold',
		// Area the player starts in -- can be an array.
		// if its an array the selection is randomized.
		// used in Character.create()
		startingArea: {
			area: 'midgaard',
			roomid: '1'
		},
		// Persistence drivers for data. World and Player data can use differing drivers.
		persistenceDriverDir: '../databases/',
		persistence: false,
		persistence: {
			data: false, // {driver: 'flat'}
			player: false // {driver: 'couchdb'}
		},
		// will log every command object to console when true
		printCommands: false,
		// will prevent ticks (time based functions) from running
		preventTicks: false
	},
	admins: []
};
