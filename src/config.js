const { Regex } = require('@companion-module/base')

module.exports = {
	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module controls some Panasonic AV-HS model switchers.',
			},
			{
				type: 'dropdown',
				id: 'model',
				label: 'Device Model',
				choices: [
					{ id: 'HS6000', label: 'AV-HS6000' },
					{ id: 'UHS500', label: 'AV-UHS500' },
					{ id: 'HS410', label: 'AV-HS410' },
					{ id: 'HS450', label: 'AV-HS450' },
					{ id: 'HS50', label: 'AW-HS50' },
					{ id: 'HSW10', label: 'AV-HSW10' },
				],
				default: 'HS410',
				width: 6,
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'IP Address',
				width: 6,
				regex: Regex.IP,
				default: '192.168.0.8'
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Port',
				width: 3,
				regex: Regex.PORT,
				default: 62000,
				tooltip: 'Default: 62000',
				isVisible: (config) => config.model === 'HS6000' || config.model === 'UHS500' || config.model === 'HSW10'
			},
			{
				type: 'static-text',
				id: 'info1',
				width: 12,
				label: 'Plug-in Requirements',
				value: 'To control AV-HS410, you need to install two plug-ins: AUXP_IP and HS410_IF, not just HS410_IF.',
				isVisible: (config) => config.model == 'HS410'
			},
			{
				type: 'static-text',
				id: 'info2',
				width: 12,
				label: 'Plug-in Requirements',
				value: 'To control AV-HS6000, you need to install the plug-in: External_Control.',
				isVisible: (config) => config.model == 'HS6000'
			},
			{
				type: 'static-text',
				id: 'info3',
				width: 12,
				label: 'Variables and AV-HS410/450 Support',
				value: 'Make sure you have Multicast traffic enabled on your network. If multicast is disabled, then variables will not work with the AV-HS410/450',
				isVisible: (config) => config.model == 'HS410' || config.model === 'HS450'
			},
			{
				type: 'checkbox',
				id: 'multicast',
				width: 1,
				label: 'Enable',
				default: false,
				isVisible: (config) => config.model == 'HS410' || config.model === 'HS450'
			},
			{
				type: 'static-text',
				id: 'multicastInfo',
				width: 11,
				label: 'Enable Multicast Support (Tally Info)',
				value: 'If you are using an AV-HS410/450, enable this for multicast tally support, giving you variables and feedbacks for tally.',
				isVisible: (config) => config.model == 'HS410' || config.model === 'HS450'
			},
		]
	},
}
