const { InstanceBase, InstanceStatus, runEntrypoint } = require('@companion-module/base');
const UpgradeScripts = require('./src/upgrades');

const config = require('./src/config');
const actions = require('./src/actions');
const feedbacks = require('./src/feedbacks');
const variables = require('./src/variables');
const presets = require('./src/presets');

const utils = require('./src/utils');
const constants = require('./src/constants');

// https://github.com/bitfocus/companion/files/2163236/AV-HS410-HS410_IF-Protocol-Ver1.3EVol_1.pdf
// https://eww.pass.panasonic.co.jp/pro-av/support/dload/hs410_aux202/AV-HS410-AUXP_IP-Protocol-Ver1.3EVol_2.pdf
// https://eww.pass.panasonic.co.jp/pro-av/support/content/guide/DEF/HS50_IP/AW-HS50InterfaceSpecifications-V1.00E.pdf
// https://eww.pass.panasonic.co.jp/pro-av/support/content/download/DEF/soft/lps/AV-UHS500_InterfaceGuide(DVQP2369YA)_E.pdf

class avhsInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		// Assign the methods from the listed files to this class
		Object.assign(this, {
			...config,
			...actions,
			...feedbacks,
			...variables,
			...presets,
			...utils,
			...constants,
		})

		this.interfaces = [] // Store all network interface ip's for multicast listening

		this.data = {
			tally: {
				pgm: '',
				pvw: '',
				busA: '',
				busB: '',
				keyF: '',
				keyS: '',
				dskF: '',
				dskS: '',
				dsk2F: '',
				dsk2S: '',
				pinP1: '',
				pinP2: '',
				aux1: '',
				aux2: '',
				aux3: '',
				aux4: '',
				// HS450 source-bus entries (ABST buses 16-18)
				aux1s: '',
				pinP1s: '',
				pinP2s: '',
				// ATST:<target>:<state> — 00 off, 01 pause, 02 BKGD run, 04/05/06 on-ramp/on/off-ramp
				autoTrans: {},
				// ATLY:<pvw_hex>:<pgm_hex> physical-input bitmasks (bit0=IN1 … bit19=IN20)
				atlyPvw: 0,
				atlyPgm: 0,
			},
		}

	}

	async destroy() {
		let self = this;

		if (self.timer) {
			clearInterval(self.timer)
			delete self.timer
		}
	
		if (self.socket !== undefined) {
			self.socket.destroy()
		}
	
		if (self.multi !== undefined) {
			// self.multi.disconnect()
		}
	}

	async init(config) {
		this.configUpdated(config);
	}

	async configUpdated(config) {
		this.config = config;

		this.updateStatus(InstanceStatus.Connecting);

		await this.getNetworkInterfaces();

		this.initActions();
		this.initFeedbacks();
		this.initVariables();
		this.initPresets();

		this.checkFeedbacks();
		this.checkVariables();

		this.initConnection();
	}
}

runEntrypoint(avhsInstance, UpgradeScripts);