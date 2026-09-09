const { combineRgb } = require('@companion-module/base')

module.exports = {
	initPresets: function () {
		let self = this
		let presets = {}

		const fgWhite = combineRgb(255, 255, 255)
		const fgBlack = combineRgb(0, 0, 0)
		const bgDark = combineRgb(30, 30, 30)
		const bgOrange = combineRgb(200, 100, 0)
		const tallyRed = combineRgb(255, 0, 0)
		const tallyGreen = combineRgb(0, 180, 0)
		const tallyBlue = combineRgb(0, 80, 180)
		const dimRed = combineRgb(90, 0, 0)
		const dimGreen = combineRgb(0, 70, 0)
		const dimBlue = combineRgb(0, 35, 90)

		let model = self.config.model
		let buses = self[model + '_BUS'] || []
		let inputs = self[model + '_INPUTS'] || []
		let targets = self.getSautTargets()
		let cutTargets = self[model + '_CUTTARGETS'] || self[model + '_TARGETS'] || []

		const busStyle = {
			'02': { category: 'PGM', short: 'PGM', idle: dimRed, tally: tallyRed },
			'03': { category: 'PVW', short: 'PVW', idle: dimGreen, tally: tallyGreen },
			'12': { category: 'AUX 1', short: 'AUX1', idle: dimBlue, tally: tallyBlue },
			'13': { category: 'AUX 2', short: 'AUX2', idle: dimBlue, tally: tallyBlue },
			'14': { category: 'AUX 3', short: 'AUX3', idle: dimBlue, tally: tallyBlue },
			'15': { category: 'AUX 4', short: 'AUX4', idle: dimBlue, tally: tallyBlue },
		}

		let xptSources = inputs.filter((i) => /^XPT\s+\d+/i.test(i.label))
		if (xptSources.length === 0) {
			xptSources = inputs
		}

		for (let bus of buses) {
			let style = busStyle[bus.id]
			if (!style) continue

			for (let src of xptSources) {
				let shortSrc = src.label.replace(/^XPT\s+/i, '')
				presets[`xpt_${bus.id}_${src.id}`] = {
					type: 'button',
					category: style.category,
					name: `${src.label} → ${bus.label}`,
					style: {
						text: `${shortSrc}\\n${style.short}`,
						size: '14',
						color: fgWhite,
						bgcolor: style.idle,
					},
					steps: [
						{
							down: [
								{
									actionId: 'xpt',
									options: {
										bus: bus.id,
										input: src.id,
									},
								},
							],
							up: [],
						},
					],
					feedbacks: [
						{
							feedbackId: 'tally',
							options: {
								bus: bus.id,
								input: src.id,
							},
							style: {
								color: fgWhite,
								bgcolor: style.tally,
							},
						},
					],
				}
			}
		}

		for (let target of cutTargets) {
			presets[`cut_${target.id}`] = {
				type: 'button',
				category: 'Transitions',
				name: `CUT ${target.label}`,
				style: {
					text: `CUT\\n${target.label}`,
					size: '14',
					color: fgBlack,
					bgcolor: bgOrange,
				},
				steps: [
					{
						down: [
							{
								actionId: 'cut',
								options: {
									target: target.id,
								},
							},
						],
						up: [],
					},
				],
				feedbacks: [],
			}
		}

		for (let target of targets) {
			// SAUT ids are zero-padded ("02"); ATST wire/target ids are not ("2").
			const atstTarget = String(parseInt(target.id, 10))
			const autoFeedbacks = []
			if (self.config.model == 'HS410' || self.config.model == 'HS450') {
				autoFeedbacks.push(
					{
						feedbackId: 'auto_target_on',
						options: { target: atstTarget },
						style: {
							color: fgWhite,
							bgcolor: tallyGreen,
						},
					},
					{
						feedbackId: 'auto_target_running',
						options: { target: atstTarget },
						style: {
							color: fgWhite,
							bgcolor: bgOrange,
						},
					}
				)
			}
			presets[`auto_${target.id}`] = {
				type: 'button',
				category: 'Transitions',
				name: `AUTO ${target.label}`,
				style: {
					text: `AUTO\\n${target.label}`,
					size: '14',
					color: fgWhite,
					bgcolor: bgDark,
				},
				steps: [
					{
						down: [
							{
								actionId: 'auto',
								options: {
									target: target.id,
								},
							},
						],
						up: [],
					},
				],
				feedbacks: autoFeedbacks,
			}
		}

		self.setPresetDefinitions(presets)
	},
}
