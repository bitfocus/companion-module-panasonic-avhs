const { combineRgb } = require('@companion-module/base')

module.exports = {
	initFeedbacks: function () {
		let self = this
		let feedbacks = {}

		const foregroundColor = combineRgb(255, 255, 255) // White
		const backgroundColor = combineRgb(255, 0, 0) // Red

		let model = self.config.model
		let inputs = self[model + '_INPUTS'].slice(0, 24) // Only get the valid range of inputs for tally feedbacks

		// Only avaliable for HS410
		if (self.config.model == 'HS410') {
			feedbacks.tally = {
				type: 'boolean',
				name: 'Tally Feedback',
				description: 'Indicate if Camera is selected on a bus',
				defaultStyle: {
					color: foregroundColor,
					bgcolor: backgroundColor,
				},
				options: [
					{
						label: 'BUS',
						type: 'dropdown',
						id: 'bus',
						choices: self[model + '_BUS'],
						default: self[model + '_BUS'][0].id,
					},
					{
						label: 'Input',
						type: 'dropdown',
						id: 'input',
						choices: inputs,
						default: inputs[0].id,
					},
				],
				callback: function (feedback, bank) {
					let opt = feedback.options
					let tally = self.data.tally

					let input = self.HS410_INPUTS.find(({ id }) => id === opt.input).label

					// Only avaliable with HS410
					switch (opt.bus) {
						case '00':
							if (input == tally.busA) {
								return true
							}
							break // Bus A
						case '01':
							if (input == tally.busB) {
								return true
							}
							break // Bus B
						case '02':
							if (input == tally.pgm) {
								return true
							}
							break // PGM
						case '03':
							if (input == tally.pvw) {
								return true
							}
							break // PVW
						case '04':
							if (input == tally.keyF) {
								return true
							}
							break // Key Fill
						case '05':
							if (input == tally.keyS) {
								return true
							}
							break // Key Source
						case '06':
							if (input == tally.dskF) {
								return true
							}
							break // DSK Fill
						case '07':
							if (input == tally.dskS) {
								return true
							}
							break // DSK Source
						case '10':
							if (input == tally.pinP1) {
								return true
							}
							break // PinP 1
						case '11':
							if (input == tally.pinP2) {
								return true
							}
							break // PinP 2
						case '12':
							if (input == tally.aux1) {
								return true
							}
							break // AUX 1
						case '13':
							if (input == tally.aux2) {
								return true
							}
							break // AUX 2
						case '14':
							if (input == tally.aux3) {
								return true
							}
							break // AUX 3
						case '15':
							if (input == tally.aux4) {
								return true
							}
							break // AUX 4
						default:
							return false
					}
					return false
				},
			}
		}

		self.setFeedbackDefinitions(feedbacks);
	}
}