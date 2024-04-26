const { Regex } = require('@companion-module/base')

module.exports = {
	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module controls some Panasonic AV-HS model switchers. To control AV-HS410, you now need to install two plug-ins: AUXP_IP and HS410_IF, not just HS410_IF.'
			},
			{
				type: 'static-text',
				id: 'info2',
				width: 12,
				label: 'Information',
				value: 'Default ports used in this module are 62000 for AV-UHS500, 60040 (60020 for multicast) for AV-HS410, and 60040 for AV-HS50.'
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'IP Address',
				width: 6,
				regex: Regex.IP,
				default: '192.168.1.5'
			},
			{
				type: 'dropdown',
				id: 'model',
				label: 'Device Model',
				choices: [
					{ id: 'UHS500', label: 'AV-UHS500' },
					{ id: 'HS410', label: 'AV-HS410' },
					{ id: 'HS50', label: 'AW-HS50' },
				],
				default: 'HS410',
				width: 6,
			},
			{
				type: 'static-text',
				id: 'info3',
				width: 12,
				label: 'Variables and AV-HS410 Support',
				value: 'Make sure you have Multicast traffic enabled on your network. If multicast is disabled, then variables will not work with the AV-HS410',
				isVisible: (config) => config.model == 'HS410'
			},
			{
				type: 'checkbox',
				id: 'multicast',
				width: 1,
				label: 'Enable',
				default: false,
				isVisible: (config) => config.model == 'HS410'
			},
			{
				type: 'static-text',
				id: 'multicastInfo',
				width: 11,
				label: 'Enable Multicast Support (Tally Info)',
				value: 'If you are using an AV-HS410, enable this for multicast tally support, giving you variables and feedbacks for tally.',
				isVisible: (config) => config.model == 'HS410'
			},
		]
	},
}
