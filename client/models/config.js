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
		var password = passwords[guid];
		if (password === undefined || password === null) {
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
		return result;
	},
	toSafeConfig: function (config) {
		conifg = _.extend()

		var result = {}
		result.exchanges = _.map(config.exchanges || [], function (e) {
			return {
				name: e.name || '',
				publicKey: e.publicKey || '',
				address: e.address || '',
				wallets: _.map(e.wallets || [], function (w) {
					return  {
						name: w.name || '',
						publicKey: w.publicKey || ''
					}
				})
			}
		});

		return result;
	},
	saveConfig: function (password, newConfig, oldConfig) {
		if (!oldConfig) oldConfig = this.loadConfig(password);

		_.map(newConfig.exchanges, function (e) {
			if (e.name.trim() === '') throw 'ExchangeNameRequired';
			if (e.publicKey.trim() === '') throw 'ExchangePublicKeyRequired';
			if (e.address.trim() === '') throw 'ExchangeAddressRequired';
			_.map(e.wallets, function (w) {
				if (w.name.trim() === '') throw 'WalletNameRequired';
				if (w.publicKey.trim() !== '') {
					var oldWallet = null;
					_.map(oldConfig.exchanges, function (oe) {
						_.map(oe.wallets, function (ow) {
							if (ow.publicKey === w.publicKey) oldWallet = ow;
						});
					});

					if (!oldWallet) {
						throw 'InvalidWalletPublicKeyEntered,' + w.publicKey;
					} else {
						w.publicKey = oldWallet.publicKey;
						w.privateKey = oldWallet.privateKey;
					}
				} else {
					var prime_length = 60;
					var diffHell = crypto.createDiffieHellman(prime_length);

					diffHell.generateKeys('base64');

					w.publicKey = diffHell.getPublicKey('base64');
					w.privateKey = diffHell.getPrivateKey('base64')
				}
			});
		})

		newConfig.salt = salt;

		return this.writeConfig(newConfig, password);
	}
}