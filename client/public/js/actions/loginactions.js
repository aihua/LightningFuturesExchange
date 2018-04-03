import dispatcher from '../dispatchers/dispatcher.js'
import axios from 'axios'

let password = 'd62947b9-e2a0-408a-988f-216ffb2bd0df'

export function changeLoggedInState(status) {
	dispatcher.dispatch({type: 'CHANGE_LOGGED_IN_STATE', data: status});
}

export function updateUser(user) {
	dispatcher.dispatch({type: 'UPDATE_USER', data: user});
}

export function open2FADialog() {
	dispatcher.dispatch({type: 'OPEN_2FA_DIALOG'});
}

export function openQRDialog(address) {
	dispatcher.dispatch({type: 'OPEN_QR_DIALOG', address: address});
}

export function login(username, password, twofaToken) {
	dispatcher.dispatch({type: 'LOGGING_IN'})

	axios.post('/api/login', { username: username, password: password, token: twofaToken})
		.then(res => {
			dispatcher.dispatch({type: 'LOGGED_IN', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_LOGGING_IN', data: error.response.data})
		});	
}

export function logout() {
	dispatcher.dispatch({type: 'LOGGING_OUT'})

	axios.post('/api/logout', {})
		.then(res => {
			dispatcher.dispatch({type: 'LOGGED_OUT', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_LOGGING_OUT', data: error.response.data})
		});	
}

export function checkSession() {
	dispatcher.dispatch({type: 'CHECKING_SESSION'})

	axios.post('/api/check_session', {})
		.then(res => {
			dispatcher.dispatch({type: 'CHECKED_SESSION', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_CHECKING_SESSION', data: error.response.data, status: (error.reponse || { status: 500 }).status})
		});	
}

export function getTwoFactorToken() {
	dispatcher.dispatch({type: 'GETTING_TWO_FACTOR_TOKEN'})

	axios.post('/api/get_two_factor_token', {})
		.then(res => {
			dispatcher.dispatch({type: 'GOT_TWO_FACTOR_TOKEN', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_GETTING_TWO_FACTOR_TOKEN', data: error.response.data})
		});
}

export function enableTwoFactorAuthentication(token) {
	dispatcher.dispatch({type: 'ENABLING_TWO_FACTOR_AUTHENTICATION'})

	axios.post('/api/enable_two_factor_authentication', {token: token})
		.then(res => {
			dispatcher.dispatch({type: 'ENABLED_TWO_FACTOR_AUTHENTICATION', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_ENABLING_TWO_FACTOR_AUTHENTICATION', data: error.response.data})
		});
}

export function disableTwoFactorAuthentication(token) {
	dispatcher.dispatch({type: 'DISABLING_TWO_FACTOR_AUTHENTICATION'})

	axios.post('/api/disable_two_factor_authentication', {token: token})
		.then(res => {
			dispatcher.dispatch({type: 'DISABLED_TWO_FACTOR_AUTHENTICATION', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_DISABLING_TWO_FACTOR_AUTHENTICATION', data: error.response.data})
		});
}

export function getDeposits() {
	dispatcher.dispatch({type: 'GETTING_DEPOSITS'})

	axios.get('/api/get_deposits')
		.then(res => {
			dispatcher.dispatch({type: 'GOT_DEPOSITS', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_GETTING_DEPOSITS', data: error.response.data})
		});	
}

export function createDepositAddress() {
	dispatcher.dispatch({type: 'CREATING_DEPOSIT_ADDRESS'})

	axios.post('/api/create_deposit_address', {})
		.then(res => {
			dispatcher.dispatch({type: 'CREATED_DEPOSIT_ADDRESS', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_CREATING_DEPOSIT_ADDRESS', data: error.response.data})
		});	
}

export function getWithdrawals() {
	dispatcher.dispatch({type: 'GETTING_WITHDRAWALS'})

	axios.get('/api/get_withdrawals')
		.then(res => {
			dispatcher.dispatch({type: 'GOT_WITHDRAWALS', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_GETTING_WITHDRAWALS', data: error.response.data})
		});	
}

export function requestWithdraw(address, amount) {
	dispatcher.dispatch({type: 'REQUESTING_WITHDRAWAL'})

	axios.post('/api/request_withdrawal', {address: address, amount: amount})
		.then(res => {
			dispatcher.dispatch({type: 'REQUESTED_WITHDRAWAL', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_REQUESTING_WITHDRAWAL', data: error.response.data})
		});	
}

export function resendWithdrawalRequest(withdrawalId) {
	dispatcher.dispatch({type: 'RESENDING_WITHDRAWAL_REQUEST'})

	axios.post('/api/resend_withdrawal_request', { withdrawalId: withdrawalId })
		.then(res => {
			dispatcher.dispatch({type: 'RESENT_WITHDRAWAL_REQUEST', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_RESENDING_WITHDRAWAL_REQUEST', data: error.response.data})
		});
}

export function getWithdrawalRequest(userId, withdrawalId, withdrawalToken) {
	dispatcher.dispatch({type: 'GETTING_WITHDRAWAL_REQUEST'})

	axios.get('/api/get_withdrawal_request', {
		params: {
			userId: userId,
			withdrawalId: withdrawalId,
			withdrawalToken: withdrawalToken
		}
	})
		.then(res => {
			dispatcher.dispatch({type: 'GOT_WITHDRAWAL_REQUEST', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_GETTING_WITHDRAWAL_REQUEST', data: error.response.data})
		});	
}

export function confirmWithdrawal(userId, withdrawalId, withdrawalToken, password, twoFactorToken) {
	dispatcher.dispatch({type: 'CONFIRMING_WITHDRAWAL'})

	axios.post('/api/confirm_withdrawal', {
		userId: userId,
		withdrawalId: withdrawalId,
		withdrawalToken: withdrawalToken,
		password: password,
		twoFactorToken: twoFactorToken
	})
		.then(res => {
			dispatcher.dispatch({type: 'CONFIRMED_WITHDRAWAL', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_CONFIRMING_WITHDRAWAL', data: error.response.data})
		});	
}

export function cancelWithdrawal(userId, withdrawalId, withdrawalToken, password, twoFactorToken) {
	dispatcher.dispatch({type: 'CANCELLING_WITHDRAWAL'})

	axios.post('/api/cancel_withdrawal', {
		userId: userId,
		withdrawalId: withdrawalId,
		withdrawalToken: withdrawalToken,
		password: password,
		twoFactorToken: twoFactorToken
	})
		.then(res => {
			dispatcher.dispatch({type: 'CANCELLED_WITHDRAWAL', data: res.data})
		})
		.catch(function (error) {
			dispatcher.dispatch({type: 'ERROR_CANCELLING_WITHDRAWAL', data: error.response.data})
		});	
}

window.addDeposit = function(userId, addressId, quantity, transactionId) {
	if (!userId) userId = 1;
	if (!addressId) addressId = 0;
	if (!quantity) quantity = 1;
	if (!transactionId) transactionId = 'da696fc0a7dd4ad3bb37ed0ddbbb873f0e7ee70a7584ca39eefe3b0af354efdc'

	axios.post('/api/add_deposit', {
		userId: userId,
		addressId: addressId,
		quantity: quantity * 10000000000,
		transactionId: transactionId,
		password: 'd62947b9-e2a0-408a-988f-216ffb2bd0df'
	})
		.then(res => {
			console.log("Deposit successful");
		})
		.catch(function (error) {
			console.log("Deposit failed");
		});
}

window.addEquity = function(equity) {
	equity.password = password

	axios.post('/api/add_equity', equity)
		.then(res => {
			console.log("Add equity successful");
		})
		.catch(function (error) {
			console.log("Add equity failed");
		});
}