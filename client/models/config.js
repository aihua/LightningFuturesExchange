var fs = require('fs');
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr';

const salt = 'a7274940-7cfb-4908-9827-8c23f9329062';

var _ = require('underscore');
var Guid = require('guid');

var passwords = {}

module.exports = {
	checkPassword: function (password) {
		var config = this.isPassword(password);

		var guid = Guid.create();
		passwords[guid] = password;

		return {
			sessionToken: guid,
			config: config
		}
	},

	getPassword: function (guid) {
		if (!this.hasConfig()) throw 'noConfig';
		console.log(passwords);
		var password = passwords[guid];
		console.log("password: " + password);
		if (password === undefined || password === null) {
			console.log('why am I here?');
			throw 'incorrectPassword';
		}
		return password;
	},

	hasConfig: function () {
		return fs.existsSync('./config/config.json');
	},
	isPassword: function (password) {
		if (!this.hasConfig()) throw 'noConfig';
		var config = this.loadConfig(password);
		if (!config.salt == salt) return false;
		return config;
	},
	createConfig: function (password) {
		if (this.hasConfig()) throw 'configAlreadyExists';
		
		var config = {
			salt: salt,
			exchanges: []
		}

		this.writeConfig(config, password);
		
		var guid = Guid.create();
		
		passwords = {}		
		passwords[guid] = password;

		console.log(passwords);

		return {
			sessionToken: guid,
			config: config
		}
	},
	changePassword: function (newPassword, oldPassword) {
		var config = this.loadConfig(oldPassword);
		this.writeConfig(config, newPassword);
	},
	writeConfig: function (config, password) {
		var configStr = JSON.stringify(config);
		var cipher = crypto.createCipher(algorithm, password + salt);
		var crypted = cipher.update(configStr,'utf8','hex');
		crypted += cipher.final('hex');	
		fs.writeFileSync('./config/config.json', crypted)
		return config;
	},
	loadConfig: function (password) {
		if (!this.hasConfig()) throw 'noConfig';
		
		var config = fs.readFileSync("./config/config.json", 'utf8')
		var decipher = crypto.createDecipher(algorithm,password + salt)
		var dec = decipher.update(config,'hex','utf8')
		dec += decipher.final('utf8');
		try {
			var result = JSON.parse(dec);
			if (result.salt != salt) throw 'incorrectPassword';
		} catch (e) {
			throw 'incorrectPassword';
		}
		return config;
	},
	addExchange: function (password, newExchange) {
		if (!newExchange) throw 'newExchangeRequired';
		if (!newExchange.name || newExchange.name.length === 0) throw 'newExchangeNameRequired';
		if (!newExchange.publicKey || newExchange.name.length < 12) throw 'newExchangePublicKeyRequired';

		var config = this.loadConfig(password);

		if (_.find(config.exchanges, function (e) {
			return e.name === newExchange.name
		})) throw 'exchangeAlreadyExists';

		config.exchanges.push({
			name: newExchange.name,
			publicKey: newExchange.publicKey,
			wallets: []
		});

		this.writeConfig(config, password);

		return config;
	},
	removeExchange: function (password, exchange_name) {
		if (!oldExchange) throw 'oldExchangeRequired';
		if (!oldExchange.name || oldExchange.name.length === 0) throw 'oldExchangeNameRequired';

		var config = this.loadConfig(password);

		if (!_.find(config.exchanges, function (e) {
			return e.name === exchange_name
		})) throw 'exchangeDoesNotExist';

		config.exchanges = _.filter(config.exchanges, function (e) {
			return e.name !== exchange_name
		})

		this.writeConfig(config, password);

		return config;
	},
	renameExchange: function (password, exchange_name, newExchange) {
		if (!newExchange) throw 'newExchangeRequired';
		if (!oldExchange) throw 'oldExchangeRequired';
		if (!oldExchange.name || oldExchange.name.length === 0) throw 'oldExchangeNameRequired';
		if (!newExchange.name || newExchange.name.length === 0) throw 'newExchangeNameRequired';

		var config = this.loadConfig(password);

		if (_.find(config.exchanges, function (e) {
			return e.name === newExchange.name
		})) throw 'exchangeAlreadyExists';

		exchange = _.find(config.exchanges, function (e) {
			return e.name === exchange_name
		})

		if (!exchange) throw 'exchangeDoesNotExist'; 

		exchange.name = newExchange.name;

		this.writeConfig(config, password);

		return config;
	},
	addWallet: function (password, exchange_name, newWallet) {
		if (!exchange) throw 'exchangeRequired';
		if (!exchange.name) throw 'exchangeNameRequired';
		if (!newWallet) throw 'newWalletRequired';
		if (!newWallet.name || newWallet.name.length === 0) throw 'newWalletNameRequired';

		var config = this.loadConfig(password);

		exchange = _.find(config.exchanges, function (e) {
			return e.name === exchange_name
		})

		if (!exchange) throw 'exchangeDoesNotExist';

		if (_.find(exchange.wallets, function (w) {
			return w.name === newWallet.name
		})) throw 'walletAlreadyExists';

		var prime_length = 60;
		var diffHell = crypto.createDiffieHellman(prime_length);

		diffHell.generateKeys('base64');

		exchange.wallets.push({
			name: newWallet.name,
			publicKey: diffHell.getPublicKey('base64'),
			privateKey: diffHell.getPrivateKey('base64')
		});

		this.writeConfig(config, password);

		return config;
	},
	removeWallet: function (password, exchange_name, wallet_name) {
		if (!exchange) throw 'exchangeRequired';
		if (!exchange.name) throw 'exchangeNameRequired';
		if (!oldWallet) throw 'oldWalletRequired';
		if (!oldWallet.name || oldWallet.name.length === 0) throw 'oldWalletNameRequired';

		var config = this.loadConfig(password);

		exchange = _.find(config.exchanges, function (e) {
			return exchange_name === e.name
		})

		if (!exchange) throw 'exchangeDoesNotExist';

		if (!_.find(exchange.wallets, function (w) {
			return w.name === wallet_name;
		})) throw 'walletDoesNotExist';

		exchange.wallets = _.filter(exchange.wallets, function (w) {
			return w.name !== wallet_name;
		})

		this.writeConfig(config, password);

		return config;
	},
	renameWallet: function (password, exchange_name, wallet_name, newWallet) {
		if (!exchange) throw 'exchangeRequired';
		if (!exchange.name) throw 'exchangeNameRequired';
		if (!newWallet) throw 'newWalletRequired';
		if (!newWallet.name || newWallet.name.length === 0) throw 'newWalletNameRequired';
		if (!oldWallet) throw 'oldWalletRequired';
		if (!oldWallet.name || oldWallet.name.length === 0) throw 'oldWalletNameRequired';

		var config = this.loadConfig(password);

		exchange = _.find(config.exchanges, function (e) {
			return exchange_name === e.name
		})

		if (!exchange) throw 'exchangeDoesNotExist';

		if (_.find(exchange.wallets, function (w) {
			return w.name === newWallet.name;
		})) throw 'walletAlreadyExists';

		oldWallet = _.find(exchange.wallets, function (w) {
			return w.name === wallet_name;
		});

		if (!oldWallet) throw 'walletDoesNotExist';

		oldWallet.name = newWallet.name;

		this.writeConfig(config, password);

		return config;
	},
	toSafeConfig: function (config) {
		conifg = _.extend()
		

		var result = {}
		result.exchanges = _.map(config.exchanges || [], function (e) {
			return {
				name: e.name,
				publicKey: e.publicKey,
				wallets: _.map(e.wallets, function (w) {
					return  {
						name: w.name,
						publicKey: w.publicKey
					}
				})
			}
		});

		return result;
	}
}