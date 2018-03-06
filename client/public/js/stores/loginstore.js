import { EventEmitter } from "events";
import dispatcher from '../dispatchers/dispatcher.js'

import cookie from 'react-cookies'

import * as LoginActions from  '../actions/loginactions.js'

class LoginStore extends EventEmitter {
	constructor() {
		super()

		this.user = null;
		this.loggedInState = 'unknown';

		this.qRDialogAddress = '';

		this.loginStatus = 'idle';
		this.loginError = '';

		this.logoutStatus = 'idle';
		this.logoutError = '';

		this.checkSessionStatus = 'idle';
		this.checkSessionError = '';

		this.otpauth = null;
		this.getTwoFactorTokenStatus = 'idle';
		this.getTwoFactorTokenError = '';

		this.enableTwoFactorAuthenticationStatus = 'idle';
		this.enableTwoFactorAuthenticationError = '';

		this.disableTwoFactorAuthenticationStatus = 'idle';
		this.disableTwoFactorAuthenticationError = '';

		this.depositAddresses = null;
		this.deposits =  null;
		this.getDepositsStatus = 'idle';
		this.getDepositsError = '';

		this.createDepositAddressStatus = 'idle';
		this.createDepositAddressError = '';

		this.withdrawals = null;
		this.getWithdrawalsStatus = 'idle';
		this.getWithdrawalsError = '';

		this.resendWithdrawalRequestStatus = 'idle';
		this.resendWithdrawalRequestError = '';

		this.requestedWithdrawal = {amount: 0, address: ''};
		this.requestWithdrawalStatus = 'idle';
		this.requestWithdrawalError = '';

		this.getWithdrawRequestUser = null;
		this.getWithdrawalRequestStatus = 'idle';
		this.getWithdrawalRequestError = '';

		this.withdrawal = null;
		this.confirmWithdrawalStatus = 'idle';
		this.confirmWithdrawalError = '';

		this.cancelWithdrawalStatus = 'idle';
		this.cancelWithdrawalError = '';
	}
	
	handleActions(action) {
		switch(action.type) {
			//Changed logged in state
			case "CHANGE_LOGGED_IN_STATE": {
				if (this.loggedInState !== action.data) {
					this.loggedInState = action.data;
					this.emit('changedLoggedInState');

					if (this.loggedInState === 'loggedout') {
						this.user = null;
						window.location.href = '#';
						setTimeout(function () {
							LoginActions.logout();
						}, 0);
					}
				}
				break;
			}

			//Update user
			case "UPDATE_USER" : {
				if (this.user && this.user.userId === action.data.userId) {
					this.user = action.data;
					this.emit('updatedUser');
				}
				break;
			}

			//Open 2FA Dialog
			case "OPEN_2FA_DIALOG": {
				this.emit('open2FADialog');
				break;
			}

			//Open QR Dialog
			case "OPEN_QR_DIALOG": {
				this.qRDialogAddress = action.address
				this.emit('openQRDialog');
				break;
			}

			//Logging In
			case "LOGGING_IN": {
				this.loginStatus = 'fetching'
				this.emit('changedLoggedInStatus');
				break;
			}
			case "LOGGED_IN": {
				this.user = action.data.user;

				const expires = new Date()
				expires.setTime(expires.getTime() + 4000*60*60*1000)

				cookie.save('userid', this.user.userId, { path: '/', expires, maxAge: 4000*60*60 })
				cookie.save('sessiontoken', action.data.sessionToken, { path: '/', expires, maxAge: 4000*60*60 })

				if (this.loggedInState !== 'loggedin') {
					this.loggedInState = 'loggedin';
					this.emit('changedLoggedInState');
				}
				this.loginStatus = 'fetched'
				this.emit('changedLoggedInStatus');
				this.loginStatus = 'idle'
				this.emit('changedLoggedInStatus');
				break;
			}
			case "ERROR_LOGGING_IN": {
				this.loginError = action.data;
				this.loginStatus = 'error'
				this.emit('changedLoggedInStatus');
				this.loginStatus = 'idle'
				this.emit('changedLoggedInStatus');
				break;
			}

			//Logging Out
			case "LOGGING_OUT": {
				setTimeout(() => {
					cookie.remove('userid');
					cookie.remove('sessiontoken');
					this.user = null;					
				}, 100);

				if (this.loggedInState !== 'loggedout') {
					this.loggedInState = 'loggedout';
					this.emit('changedLoggedInState');
				}

				this.logoutStatus = 'fetching'
				this.emit('changedLoggedOutStatus');
				break;
			}
			case "LOGGED_OUT": {
				this.logoutStatus = 'fetched'
				this.emit('changedLoggedOutStatus');
				this.logoutStatus = 'idle'
				this.emit('changedLoggedOutStatus');
				break;
			}
			case "ERROR_LOGGING_OUT": {
				this.logoutError = action.data;
				this.logoutStatus = 'error'
				this.emit('changedLoggedOutStatus');
				this.logoutStatus = 'idle'
				this.emit('changedLoggedOutStatus');
				break;
			}

			//Checking Session
			case "CHECKING_SESSION": {
				this.checkSessionStatus = 'fetching'
				this.emit('changedCheckSessionStatus');
				break;
			}
			case "CHECKED_SESSION": {
				this.user = action.data.user

				const expires = new Date()
				expires.setTime(expires.getTime() + 4000*60*60*1000)

				cookie.save('userid', this.user.userId, { path: '/', expires, maxAge: 4000*60*60 })
				cookie.save('sessiontoken', cookie.load('sessiontoken'), { path: '/', expires, maxAge: 4000*60*60 })

				if (this.loggedInState !== 'loggedin') {
					this.loggedInState = 'loggedin';
					this.emit('changedLoggedInState');
				}
				this.checkSessionStatus = 'fetched'
				this.emit('changedCheckSessionStatus');
				this.checkSessionStatus = 'idle'
				this.emit('changedCheckSessionStatus');
				break;
			}
			case "ERROR_CHECKING_SESSION": {
				this.checkSessionError = action.data;

				if (action.data.status !== 401) {
					cookie.remove('userid');					
					cookie.remove('sessiontoken');
					this.loggedInState = "loggedout";
					this.emit('changedLoggedInState');
					this.user = null;
					window.location.href = '#';
				}

				this.checkSessionStatus = 'error'
				this.emit('changedCheckSessionStatus');
				this.checkSessionStatus = 'idle'
				this.emit('changedCheckSessionStatus');
				break;
			}

			//Get Two Factor Token
			case "GETTING_TWO_FACTOR_TOKEN": {
				this.otpauth = null;
				this.getTwoFactorTokenStatus = 'fetching';
				this.emit('changedGetTwoFactorTokenStatus');
				break;
			}
			case "GOT_TWO_FACTOR_TOKEN": {
				this.otpauth = action.data.otpauth;
				this.getTwoFactorTokenStatus = 'fetched';
				this.emit('changedGetTwoFactorTokenStatus');
				this.getTwoFactorTokenStatus = 'idle';
				this.emit('changedGetTwoFactorTokenStatus');
				break;
			}
			case "ERROR_GETTING_TWO_FACTOR_TOKEN": {
				this.getTwoFactorTokenError = action.data;
				this.getTwoFactorTokenStatus = 'error';
				this.emit('changedGetTwoFactorTokenStatus');
				this.getTwoFactorTokenStatus = 'idle';
				this.emit('changedGetTwoFactorTokenStatus');				
				break;
			}

			//Enable Two Factor Authentication
			case "ENABLING_TWO_FACTOR_AUTHENTICATION": {
				this.enableTwoFactorAuthenticationStatus = 'fetching';
				this.emit('changedEnableTwoFactorAuthenticationStatus');
				break;
			}
			case "ENABLED_TWO_FACTOR_AUTHENTICATION": {
				this.user = action.data.user
				setTimeout(() => { this.emit('updatedUser'); }, 0);
				this.enableTwoFactorAuthenticationStatus = 'fetched';
				this.emit('changedEnableTwoFactorAuthenticationStatus');
				this.enableTwoFactorAuthenticationStatus = 'idle';
				this.emit('changedEnableTwoFactorAuthenticationStatus');
				break;
			}
			case "ERROR_ENABLING_TWO_FACTOR_AUTHENTICATION": {
				this.enableTwoFactorAuthenticationError = action.data;				
				this.enableTwoFactorAuthenticationStatus = 'error';
				this.emit('changedEnableTwoFactorAuthenticationStatus');
				this.enableTwoFactorAuthenticationStatus = 'idle';
				this.emit('changedEnableTwoFactorAuthenticationStatus');
				break;
			}

			//Disable Two Factor Authentication
			case "DISABLING_TWO_FACTOR_AUTHENTICATION": {
				this.disableTwoFactorAuthenticationStatus = 'fetching';
				this.emit('changedDisableTwoFactorAuthenticationStatus');
				break;
			}
			case "DISABLED_TWO_FACTOR_AUTHENTICATION": {
				this.user = action.data.user
				setTimeout(() => { this.emit('updatedUser'); }, 0);
				this.disableTwoFactorAuthenticationStatus = 'fetched';
				this.emit('changedDisableTwoFactorAuthenticationStatus');
				this.disableTwoFactorAuthenticationStatus = 'idle';
				this.emit('changedDisableTwoFactorAuthenticationStatus');
				break;
			}
			case "ERROR_DISABLING_TWO_FACTOR_AUTHENTICATION": {
				this.disableTwoFactorAuthenticationError = action.data;
				this.disableTwoFactorAuthenticationStatus = 'error';
				this.emit('changedDisableTwoFactorAuthenticationStatus');
				this.disableTwoFactorAuthenticationStatus = 'idle';
				this.emit('changedDisableTwoFactorAuthenticationStatus');
				break;
			}

			//Get Deposits
			case "GETTING_DEPOSITS": {
				this.depositAddresses = null;
				this.deposits = null;
				this.getDepositsStatus = 'fetching';
				this.emit('changedGetDepositsStatus');
				break;
			}
			case "GOT_DEPOSITS": {
				this.depositAddresses = action.data.depositAddresses;
				this.deposits = action.data.deposits;
				this.getDepositsStatus = 'fetched';
				this.emit('changedGetDepositsStatus');
				this.getDepositsStatus = 'idle';
				this.emit('changedGetDepositsStatus');
				break;
			}
			case "ERROR_GETTING_DEPOSITS": {
				this.getDepositsError = action.data;
				this.getDepositsStatus = 'error';
				this.emit('changedGetDepositsStatus');
				this.getDepositsStatus = 'idle';
				this.emit('changedGetDepositsStatus');
				break;
			}

			//Create Deposit address
			case "CREATING_DEPOSIT_ADDRESS": {
				this.createDepositAddressStatus = 'fetching';
				this.emit('changedCreateDepositAddressStatus');
				break;
			}
			case "CREATED_DEPOSIT_ADDRESS": {
				this.depositAddresses = action.data.depositAddresses;
				this.deposits = action.data.deposits;
				this.createDepositAddressStatus = 'fetched';
				this.emit('changedCreateDepositAddressStatus');
				this.createDepositAddressStatus = 'idle';
				this.emit('changedCreateDepositAddressStatus');
				break;
			}
			case "ERROR_CREATING_DEPOSIT_ADDRESS": {
				this.createDepositAddressError = action.data;
				this.createDepositAddressStatus = 'error';
				this.emit('changedCreateDepositAddressStatus');
				this.createDepositAddressStatus = 'idle';
				this.emit('changedCreateDepositAddressStatus');
				break;
			}

			//Get Withdrawals
			case "GETTING_WITHDRAWALS": {
				this.withdrawals = null;
				this.getWithdrawalsStatus = 'fetching';
				this.emit('changedGetWithdrawalsStatus');
				break;
			}
			case "GOT_WITHDRAWALS": {
				this.withdrawals = action.data.withdrawals;
				this.getWithdrawalsStatus = 'fetched';
				this.emit('changedGetWithdrawalsStatus');
				this.getWithdrawalsStatus = 'idle';
				this.emit('changedGetWithdrawalsStatus');
				break;
			}
			case "ERROR_GETTING_WITHDRAWALS": {
				this.getWithdrawalsError = action.data;
				this.getWithdrawalsStatus = 'error';
				this.emit('changedGetWithdrawalsStatus');
				this.getWithdrawalsStatus = 'idle';
				this.emit('changedGetWithdrawalsStatus');
				break;
			}

			//Request Withdrawal
			case "REQUESTING_WITHDRAWAL": {
				this.requestWithdrawalStatus = 'fetching';
				this.emit('changedRequestWithdrawalStatus');
				break;
			}
			case "REQUESTED_WITHDRAWAL": {
				this.withdrawals = action.data.withdrawals;
				this.user = action.data.user;
				this.requestedWithdrawal = action.data.withdrawal;
				this.emit('updatedUser');
				this.requestWithdrawalStatus = 'fetched';
				this.emit('changedRequestWithdrawalStatus');
				this.requestWithdrawalStatus = 'idle';
				this.emit('changedRequestWithdrawalStatus');
				break;
			}
			case "ERROR_REQUESTING_WITHDRAWAL": {
				this.requestWithdrawalError = action.data;
				this.requestWithdrawalStatus = 'error';
				this.emit('changedRequestWithdrawalStatus');
				this.requestWithdrawalStatus = 'idle';
				this.emit('changedRequestWithdrawalStatus');
				break;
			}

			//resend withdrawal request
			case "RESENDING_WITHDRAWAL_REQUEST": {
				this.resendWithdrawalRequestStatus = 'fetching';
				this.emit('changedResendWithdrawalRequestStatus');
				break;
			}
			case "RESENT_WITHDRAWAL_REQUEST": {
				this.resentWithdrawal = action.data.withdrawal;
				this.resendWithdrawalRequestStatus = 'fetched';
				this.emit('changedResendWithdrawalRequestStatus');
				this.resendWithdrawalRequestStatus = 'idle';
				this.emit('changedResendWithdrawalRequestStatus');
				break;
			}
			case "ERROR_RESENDING_WITHDRAWAL_REQUEST": {
				this.resendWithdrawalRequestError = action.data;
				this.resendWithdrawalRequestStatus = 'error';
				this.emit('changedResendWithdrawalRequestStatus');
				this.resendWithdrawalRequestStatus = 'idle';
				this.emit('changedResendWithdrawalRequestStatus');
				break;
			}

			//Get withdrawal request
			case "GETTING_WITHDRAWAL_REQUEST": {
				this.checkUser = null;
				this.withdrawal = null;
				this.getWithdrawRequestUser = null;
				this.getWithdrawalRequestStatus = 'fetching';
				this.emit('changedRequestWithdrawalStatus');
				break;
			}
			case "GOT_WITHDRAWAL_REQUEST": {
				this.checkUser = action.data.user;
				this.withdrawal = action.data.withdrawal;
				this.getWithdrawRequestUser = action.data.user;

				this.getWithdrawalRequestStatus = 'fetched';
				this.emit('changedGetWithdrawalRequestStatus');
				this.getWithdrawalRequestStatus = 'idle';
				this.emit('changedGetWithdrawalRequestStatus');
				break;
			}
			case "ERROR_GETTING_WITHDRAWAL_REQUEST": {
				this.getWithdrawalRequestError = action.data;
				this.getWithdrawalRequestStatus = 'error';
				this.emit('changedGetWithdrawalRequestStatus');
				this.getWithdrawalRequestStatus = 'idle';
				this.emit('changedGetWithdrawalRequestStatus');
				break;
			}

			//Confirm Withdraw
			case "CONFIRMING_WITHDRAWAL": {
				this.confirmWithdrawalStatus = 'fetching';
				this.emit('changedConfirmWithdrawalStatus');
				break;
			}
			case "CONFIRMED_WITHDRAWAL": {
				this.withdrawal = action.data.withdrawal;
				this.confirmUser = action.data.user;

				if (this.user && this.user.userId === action.data.user.userId) {
					this.user = action.data.user;
					this.emit('updatedUser');
				}

				this.confirmWithdrawalStatus = 'fetched';
				this.emit('changedConfirmWithdrawalStatus');
				this.confirmWithdrawalStatus = 'idle';
				this.emit('changedConfirmWithdrawalStatus');
				break;
			}
			case "ERROR_CONFIRMING_WITHDRAWAL": {
				this.confirmWithdrawalError = action.data;
				this.confirmWithdrawalStatus = 'error';
				this.emit('changedConfirmWithdrawalStatus');
				this.confirmWithdrawalStatus = 'idle';
				this.emit('changedConfirmWithdrawalStatus');
				break;
			}

			//Cancel Withdraw
			case "CANCELLING_WITHDRAWAL": {
				this.cancelWithdrawalStatus = 'fetching';
				this.emit('changedCancelWithdrawalStatus');
				break;
			}
			case "CANCELLED_WITHDRAWAL": {
				this.withdrawal = action.data.withdrawal;
				this.confirmUser = action.data.user;

				if (this.user && this.user.userId === action.data.user.userId) {
					this.user = action.data.user;
					this.emit('updatedUser');
				}

				this.cancelWithdrawalStatus = 'fetched';
				this.emit('changedCancelWithdrawalStatus');
				this.cancelWithdrawalStatus = 'idle';
				this.emit('changedCancelWithdrawalStatus');
				break;
			}
			case "ERROR_CANCELLING_WITHDRAWAL": {
				this.cancelWithdrawalError = action.data;
				this.cancelWithdrawalStatus = 'error';
				this.emit('changedCancelWithdrawalStatus');
				this.cancelWithdrawalStatus = 'idle';
				this.emit('changedCancelWithdrawalStatus');
				break;
			}
		}
	}
}

const loginStore = new LoginStore();
dispatcher.register(loginStore.handleActions.bind(loginStore));

if (cookie.load('userid') && cookie.load('sessiontoken')) {
	LoginActions.checkSession();
} else {
	loginStore.loggedInState = 'loggedout';
}

export default loginStore;