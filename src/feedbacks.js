const { combineRgb } = require('@companion-module/base')

module.exports = {
	initFeedbacks: function () {
		let self = this
		let feedbacks = {}

		const foregroundColor = combineRgb(255, 255, 255) // White
		const backgroundColor = combineRgb(255, 0, 0) // Red

		let model = self.config.model
		let buses = self[model + '_BUS'] || []
		let inputs = self[model + '_INPUTS'] || []
		// ABST reports the selected XPT button (00–31 / 99), not the physical
		// input or internal source. Keep those out of the dropdown.
		let xptChoices = inputs.filter((i) => /^XPT\s+\d+/i.test(i.label) || i.id === '99')
		if (xptChoices.length === 0) {
			xptChoices = inputs
		}
		// ATLY is a physical-input bitmap (IN1…), not XPT buttons.
		let physicalInputs = inputs.filter((i) => /^Input\s+\d+/i.test(i.label))
		if (physicalInputs.length === 0) {
			physicalInputs = inputs.filter((i) => {
				let n = parseInt(i.id, 10)
				return n >= 50 && n <= 69
			})
		}
		const atlyBuses = [
			{ id: '02', label: 'PGM' },
			{ id: '03', label: 'PVW' },
		]

		feedbacks.tally = {
			type: 'boolean',
			name: 'Tally Feedback',
			description:
				'True when the selected XPT is currently selected on the bus (ABST crosspoint, not the physical input). Requires multicast tally (HS410/HS450); on other models this stays off.',
			defaultStyle: {
				color: foregroundColor,
				bgcolor: backgroundColor,
			},
			options: [
				{
					label: 'BUS',
					type: 'dropdown',
					id: 'bus',
					choices: buses,
					default: buses[0] ? buses[0].id : '02',
				},
				{
					label: 'XPT',
					type: 'dropdown',
					id: 'input',
					choices: xptChoices,
					default: xptChoices[0] ? xptChoices[0].id : '00',
				},
			],
			callback: function (feedback) {
				let opt = feedback.options
				let tally = self.data.tally
				let inputsList = self[self.config.model + '_INPUTS'] || []

				let inputEntry = inputsList.find(({ id }) => id === opt.input)
				if (!inputEntry) {
					let padded = String(opt.input || '').padStart(2, '0')
					inputEntry = inputsList.find(({ id }) => id === padded)
				}
				if (!inputEntry) {
					return false
				}
				let input = inputEntry.label

				switch (opt.bus) {
					case '00':
						return input == tally.busA
					case '01':
						return input == tally.busB
					case '02':
						return input == tally.pgm
					case '03':
						return input == tally.pvw
					case '04':
						return input == tally.keyF
					case '05':
						return input == tally.keyS
					case '06':
						return input == tally.dskF
					case '07':
						return input == tally.dskS
					case '08':
						return input == tally.dsk2F
					case '09':
						return input == tally.dsk2S
					case '10':
						return input == tally.pinP1
					case '11':
						return input == tally.pinP2
					case '12':
						return input == tally.aux1
					case '13':
						return input == tally.aux2
					case '14':
						return input == tally.aux3
					case '15':
						return input == tally.aux4
					case '16':
						return input == tally.aux1s
					case '17':
						return input == tally.pinP1s
					case '18':
						return input == tally.pinP2s
					default:
						return false
				}
			},
		}

		if (self.config.model == 'HS410' || self.config.model == 'HS450') {
			const runningStates = self.ATST_RUNNING_STATES || ['02', '04', '06']
			const atstTargets =
				self[self.config.model + '_ATST_TARGETS'] || self.HS450_ATST_TARGETS

			feedbacks.atly_tally = {
				type: 'boolean',
				name: 'Input Tally Feedback (PGM/PVW-only)',
				description:
					'True when ATLY reports the selected physical input on PGM (red) or PVW (green). Bit0=Input 1 … — independent of XPT button mapping. Requires multicast.',
				defaultStyle: {
					color: foregroundColor,
					bgcolor: backgroundColor,
				},
				options: [
					{
						label: 'BUS',
						type: 'dropdown',
						id: 'bus',
						choices: atlyBuses,
						default: '02',
					},
					{
						label: 'Input',
						type: 'dropdown',
						id: 'input',
						choices: physicalInputs,
						default: physicalInputs[0] ? physicalInputs[0].id : '50',
					},
				],
				callback: function (feedback) {
					const opt = feedback.options
					const src = parseInt(opt.input, 10)
					if (!Number.isFinite(src) || src < 50 || src > 69) {
						return false
					}
					const bit = src - 50
					const mask = opt.bus === '03' ? self.data.tally.atlyPvw : self.data.tally.atlyPgm
					return ((mask >>> 0) & (1 << bit)) !== 0
				},
			}

			feedbacks.auto_status = {
				type: 'boolean',
				name: 'Auto Transition Status',
				description:
					'True when an ATST target matches the selected state (00=off, 01=pause, 02=BKGD running, 04=on-ramp, 05=on, 06=off-ramp)',
				defaultStyle: {
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 180, 0),
				},
				options: [
					{
						label: 'Target',
						type: 'dropdown',
						id: 'target',
						choices: atstTargets,
						default: '0',
					},
					{
						label: 'State',
						type: 'dropdown',
						id: 'state',
						choices: self.ATST_STATES,
						default: '05',
					},
				],
				callback: function (feedback) {
					const auto = self.data.tally.autoTrans || {}
					const current = auto[feedback.options.target]
					return current === feedback.options.state
				},
			}

			feedbacks.auto_running = {
				type: 'boolean',
				name: 'Auto Transition Running',
				description:
					'True when any ATST target is transitioning (02 BKGD, or 04/06 for KEY/DSK/PinP/FTB)',
				defaultStyle: {
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(255, 140, 0),
				},
				options: [],
				callback: function () {
					const auto = self.data.tally.autoTrans || {}
					return Object.values(auto).some((code) => runningStates.includes(code))
				},
			}

			feedbacks.auto_target_running = {
				type: 'boolean',
				name: 'Auto Transition Running (Target)',
				description:
					'True when the selected ATST target is transitioning (02/04/06)',
				defaultStyle: {
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(255, 140, 0),
				},
				options: [
					{
						label: 'Target',
						type: 'dropdown',
						id: 'target',
						choices: atstTargets,
						default: '0',
					},
				],
				callback: function (feedback) {
					const auto = self.data.tally.autoTrans || {}
					const current = auto[feedback.options.target]
					return runningStates.includes(current)
				},
			}

			feedbacks.auto_target_on = {
				type: 'boolean',
				name: 'Auto Effect On (Target)',
				description: 'True when the selected ATST target reports state 05 (on)',
				defaultStyle: {
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 180, 0),
				},
				options: [
					{
						label: 'Target',
						type: 'dropdown',
						id: 'target',
						choices: atstTargets,
						default: '1',
					},
				],
				callback: function (feedback) {
					const auto = self.data.tally.autoTrans || {}
					return auto[feedback.options.target] === '05'
				},
			}
		}

		self.setFeedbackDefinitions(feedbacks)
	},
}
