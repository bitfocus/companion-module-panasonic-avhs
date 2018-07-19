var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

// https://github.com/bitfocus/companion/files/2163236/AV-HS410-HS410_IF-Protocol-Ver1.3EVol_1.pdf
// https://eww.pass.panasonic.co.jp/pro-av/support/dload/hs410_aux202/AV-HS410-AUXP_IP-Protocol-Ver1.3EVol_2.pdf
// https://eww.pass.panasonic.co.jp/pro-av/support/content/guide/DEF/HS50_IP/AW-HS50InterfaceSpecifications-V1.00E.pdf

var STX = String.fromCharCode(0x02);
var ETX = String.fromCharCode(0x03);

var HS410_BUS = [
	{ id: '00', label: 'Bus A' },
	{ id: '01', label: 'Bus B' },
	{ id: '02', label: 'PGM' },
	{ id: '03', label: 'PVW' },
	{ id: '04', label: 'Key Fill' },
	{ id: '05', label: 'Key Source' },
	{ id: '06', label: 'DSK Fill' },
	{ id: '07', label: 'DSK Source' },
	{ id: '10', label: 'PinP1' },
	{ id: '11', label: 'PinP2' },
	{ id: '12', label: 'Aux 1' },
	{ id: '13', label: 'Aux 2' },
	{ id: '14', label: 'Aux 3' },
	{ id: '15', label: 'Aux 4' }
];

var HS50_BUS = [
	{ id: '00', label: 'Bus A' },
	{ id: '01', label: 'Bus B' },
	{ id: '02', label: 'PGM' },
	{ id: '03', label: 'PVW' },
	{ id: '04', label: 'Key Fill' },
	{ id: '05', label: 'Key Source' },
	{ id: '10', label: 'PinP' },
	{ id: '12', label: 'Aux' }
];

var HS410_INPUTS = [
	{ id: '00', label: 'XPT 1' },
	{ id: '01', label: 'XPT 2' },
	{ id: '02', label: 'XPT 3' },
	{ id: '03', label: 'XPT 4' },
	{ id: '04', label: 'XPT 5' },
	{ id: '05', label: 'XPT 6' },
	{ id: '06', label: 'XPT 7' },
	{ id: '07', label: 'XPT 8' },
	{ id: '08', label: 'XPT 9' },
	{ id: '09', label: 'XPT 10' },
	{ id: '10', label: 'XPT 11' },
	{ id: '11', label: 'XPT 12' },
	{ id: '12', label: 'XPT 13' },
	{ id: '13', label: 'XPT 14' },
	{ id: '14', label: 'XPT 15' },
	{ id: '15', label: 'XPT 16' },
	{ id: '16', label: 'XPT 17' },
	{ id: '17', label: 'XPT 18' },
	{ id: '18', label: 'XPT 19' },
	{ id: '19', label: 'XPT 20' },
	{ id: '20', label: 'XPT 21' },
	{ id: '21', label: 'XPT 22' },
	{ id: '22', label: 'XPT 23' },
	{ id: '23', label: 'XPT 24' },
	{ id: '50', label: 'Input 1' },
	{ id: '51', label: 'Input 2' },
	{ id: '52', label: 'Input 3' },
	{ id: '53', label: 'Input 4' },
	{ id: '54', label: 'Input 5' },
	{ id: '55', label: 'Input 6' },
	{ id: '56', label: 'Input 7' },
	{ id: '57', label: 'Input 8' },
	{ id: '58', label: 'Input 9' },
	{ id: '59', label: 'Input 10' },
	{ id: '60', label: 'Input 11' },
	{ id: '61', label: 'Input 12' },
	{ id: '62', label: 'Input 13' },
	{ id: '70', label: 'Color bars' },
	{ id: '71', label: 'Color background 1' },
	{ id: '96', label: 'Color background 2' },
	{ id: '72', label: 'Black' },
	{ id: '73', label: 'Still1V' },
	{ id: '74', label: 'Still2V' },
	{ id: '75', label: 'Clip1V' },
	{ id: '76', label: 'Clip2V' },
	{ id: '77', label: 'PGM' },
	{ id: '78', label: 'PVW' },
	{ id: '79', label: 'KeyOut' },
	{ id: '80', label: 'CLN' },
	{ id: '81', label: 'Multi view' },
	{ id: '91', label: 'M-PVW' },
	{ id: '92', label: 'Still1K' },
	{ id: '93', label: 'Still2K' },
	{ id: '94', label: 'Clip1K' },
	{ id: '95', label: 'Clip2K' }
];

var HS50_INPUTS = [
	{ id: '00', label: 'XPT 1' },
	{ id: '01', label: 'XPT 2' },
	{ id: '02', label: 'XPT 3' },
	{ id: '03', label: 'XPT 4' },
	{ id: '04', label: 'XPT 5' },
	{ id: '05', label: 'XPT 6' },
	{ id: '06', label: 'XPT 7' },
	{ id: '07', label: 'XPT 8' },
	{ id: '08', label: 'XPT 9' },
	{ id: '09', label: 'XPT 10' },
	{ id: '50', label: 'Input 1' },
	{ id: '51', label: 'Input 2' },
	{ id: '52', label: 'Input 3' },
	{ id: '53', label: 'Input 4' },
	{ id: '54', label: 'Input 5' },
	{ id: '70', label: 'Color bars' },
	{ id: '71', label: 'Color background' },
	{ id: '72', label: 'Black' },
	{ id: '73', label: 'Frame memory 1' },
	{ id: '74', label: 'Frame memory 2' },
	{ id: '77', label: 'PGM' },
	{ id: '78', label: 'PVW' },
	{ id: '79', label: 'KeyOut' },
	{ id: '80', label: 'CLN' },
	{ id: '81', label: 'Multi view' }
];

var HS410_TARGETS = [
	{ id: '00', label: 'BKGD' },
	{ id: '01', label: 'KEY' },
	{ id: '04', label: 'PinP 1' },
	{ id: '05', label: 'PinP 2' },
	{ id: '06', label: 'FTB' },
	{ id: '07', label: 'DSK' },
];

var HS50_TARGETS = [
	{ id: '00', label: 'BKGD' },
	{ id: '01', label: 'KEY' },
	{ id: '04', label: 'PinP' },
	{ id: '06', label: 'FTB' }
];

var HS410_CUTTARGETS = [
	{ id: '00', label: 'BKGD' },
	{ id: '01', label: 'KEY' },
	{ id: '04', label: 'PinP1' },
	{ id: '05', label: 'PinP2' },
	{ id: '06', label: 'FTB' },
	{ id: '07', label: 'DSK' }
];

var HS50_CUTTARGETS = HS410_CUTTARGETS.slice(0, 2);

function instance(system, id, config) {
	var self = this;

	// Because we use dynamic variables ex: self[model + '_INPUTS']
	self.HS410_INPUTS = HS410_INPUTS;
	self.HS410_BUS = HS410_BUS;
	self.HS410_TARGETS = HS410_TARGETS;
	self.HS410_CUTTARGETS = HS410_CUTTARGETS;
	self.HS50_INPUTS = HS50_INPUTS;
	self.HS50_BUS = HS50_BUS;
	self.HS50_TARGETS = HS50_TARGETS;
	self.HS50_CUTTARGETS = HS50_CUTTARGETS;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;
	self.init_tcp();
	self.actions();
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.status(self.STATE_UNKNOWN);

	self.init_tcp();
};

instance.prototype.init_tcp = function() {
	var self = this;
	var receivebuffer = '';

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (self.config.host) {
		self.socket = new tcp(self.config.host, 60040);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.log('error',"Network error: " + err.message);
		});

		// Extract packet from STX/ETX from device
		self.socket.on('data', function (chunk) {
			var i = 0, packet = '', offset = 0;
			receivebuffer += chunk;

			while ( (i = receivebuffer.indexOf(ETX, offset)) !== -1) {
				packet = receivebuffer.substr(offset, i - offset);
				offset = i + 1;

				if (packet.substr(0,1) == STX) {
					self.socket.emit('receivepacket', packet.substr(1).toString());
				}
			}
			receivebuffer = receivebuffer.substr(offset);
		});

		self.socket.on('receivepacket', function (data) {
			// Ready for feedbacks
		});
	}
};

instance.prototype.sendCommand = function(command) {
	var self = this;

	if (self.socket !== undefined && self.socket.connected) {
		self.socket.send(STX + command + ETX);
	} else {
		debug('Socket not connected :(');
	}
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;

	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'To control AV-HS410 you need to install the plug-in software for external interface control'
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Device IP',
			width: 6,
			regex: self.REGEX_IP
		},
		{
			type: 'dropdown',
			id: 'model',
			label: 'Device Model',
			choices: [ { id: 'HS410', label: 'AV-HS410' }, { id: 'HS50', label: 'AW-HS50' }],
			default: 'HS410',
			width: 6
		}
	];
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
	}

	debug("destroy", self.id);
};


instance.prototype.actions = function(system) {
	var self = this;
	var model = self.config.model;

	self.system.emit('instance_actions', self.id, {
		'xpt': {
			label: 'Bus crosspoint control',
			options: [
				{
					label: 'BUS',
					type: 'dropdown',
					id: 'bus',
					choices: self[model + '_BUS']
				},
				{
					label: 'Input',
					type: 'dropdown',
					id: 'input',
					choices: self[model + '_INPUTS']
				}
			]
		},
		'auto': {
			label: 'Send AUTO transition',
			options: [
				{
					label: 'Target',
					type: 'dropdown',
					id: 'target',
					choices: self[model + '_TARGETS']
				}
			]
		},
		'cut': {
			label: 'Send CUT transition',
			options: [
				{
					label: 'Target',
					type: 'dropdown',
					id: 'target',
					choices: self[model + '_CUTTARGETS']
				}
			]
		},
		'time': {
			label: 'Auto transition time control (HS410)',
			options: [
				{
					label: 'Target',
					type: 'dropdown',
					id: 'target',
					choices: self[model + '_TARGETS']
				},
				{
					label: 'Time (in number of frames)',
					type: 'textinput',
					id: 'frames',
					regex: '/^0*([0-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9])$/'
				}
			]
		}
	});
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd;
	var opt = action.options;

	switch (action.action) {

		case 'xpt':
			self.sendCommand('SBUS:' + opt.bus + ':' + opt.input);
			break;

		case 'auto':
			if (self.config.model == 'HS50') {
				self.sendCommand('SAUT:' + opt.target + ':0');
			} else {
				self.sendCommand('SAUT:' + opt.target + ':0:0');
			}
			break;

		case 'cut':
			self.sendCommand('SCUT:' + opt.target);
			break;

		case 'time':
			if (self.config.model == 'HS50') {
				self.log('error', 'HS50 does not have support for setting auto transition times');
				break;
			}

			if (parseInt(opt.frames) > 999) {
				opt.frames = 999;
			}
			self.sendCommand('STIM:' + opt.target + ':' + ('000' + parseInt(opt.frames)).substr(-3));
			break;
	}

	debug('action():', action.action);
};

instance.module_info = {
	label: 'Panasonic AV-HS410/AV-HS50',
	id: 'panasonic-avhs',
	version: '0.0.1'
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
