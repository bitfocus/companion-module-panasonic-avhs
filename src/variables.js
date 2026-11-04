module.exports = {
	initVariables: function () {
		let self = this;
		let variables = []

		variables.push({ variableId: 'tally_pgm', name: 'Tally Program' })
		variables.push({ variableId: 'tally_pvw', name: 'Tally Preview' })
		variables.push({ variableId: 'bus_a', name: 'Bus A Selected' })
		variables.push({ variableId: 'bus_b', name: 'Bus B Selected' })
		variables.push({ variableId: 'key_fill', name: 'Key Fill Selected' })
		variables.push({ variableId: 'key_source', name: 'Key Source Selected' })
		variables.push({ variableId: 'dsk_fill', name: 'DSK1 Fill Selected' })
		variables.push({ variableId: 'dsk_source', name: 'DSK1 Source Selected' })
		variables.push({ variableId: 'dsk2_fill', name: 'DSK2 Fill Selected' })
		variables.push({ variableId: 'dsk2_source', name: 'DSK2 Source Selected' })
		variables.push({ variableId: 'pinp_1', name: 'PinP 1 Selected' })
		variables.push({ variableId: 'pinp_2', name: 'PinP 2 Selected' })
		variables.push({ variableId: 'aux_1', name: 'AUX 1 Selected' })
		variables.push({ variableId: 'aux_2', name: 'AUX 2 Selected' })
		variables.push({ variableId: 'aux_3', name: 'AUX 3 Selected' })
		variables.push({ variableId: 'aux_4', name: 'AUX 4 Selected' })

		if (self.config.model == 'HS410' || self.config.model == 'HS450') {
			variables.push({ variableId: 'auto_bkgd', name: 'Auto Status: BKGD' })
			variables.push({ variableId: 'auto_key', name: 'Auto Status: KEY' })
			variables.push({ variableId: 'auto_dsk1', name: 'Auto Status: DSK 1' })
			variables.push({ variableId: 'auto_dsk2', name: 'Auto Status: DSK 2' })
			variables.push({ variableId: 'auto_pinp1', name: 'Auto Status: PinP 1' })
			variables.push({ variableId: 'auto_pinp2', name: 'Auto Status: PinP 2' })
			variables.push({ variableId: 'auto_ftb', name: 'Auto Status: FTB' })
			variables.push({ variableId: 'auto_aux', name: 'Auto Status: AUX' })
			variables.push({ variableId: 'auto_any_running', name: 'Any Auto Transition Running' })
		}

		self.setVariableDefinitions(variables);
	},

	checkVariables: function () {
		let self = this;

		//set variables
		let variableObj = {};

		variableObj['tally_pgm'] = self.data.tally.pgm;
		variableObj['tally_pvw'] = self.data.tally.pvw;
		variableObj['bus_a'] = self.data.tally.busA;
		variableObj['bus_b'] = self.data.tally.busB;
		variableObj['key_fill'] = self.data.tally.keyF;
		variableObj['key_source'] = self.data.tally.keyS;
		variableObj['dsk_fill'] = self.data.tally.dskF;
		variableObj['dsk_source'] = self.data.tally.dskS;
		variableObj['dsk2_fill'] = self.data.tally.dsk2F;
		variableObj['dsk2_source'] = self.data.tally.dsk2S;
		variableObj['pinp_1'] = self.data.tally.pinP1;
		variableObj['pinp_2'] = self.data.tally.pinP2;
		variableObj['aux_1'] = self.data.tally.aux1;
		variableObj['aux_2'] = self.data.tally.aux2;
		variableObj['aux_3'] = self.data.tally.aux3;
		variableObj['aux_4'] = self.data.tally.aux4;

		if (self.config.model == 'HS410' || self.config.model == 'HS450') {
			const auto = self.data.tally.autoTrans || {}
			const runningStates = self.ATST_RUNNING_STATES || ['02', '04', '06']
			const label = (id) => {
				const code = auto[id]
				if (!code) return ''
				const state = self.ATST_STATES.find(({ id: sid }) => sid === code)
				return state ? state.label : code
			}
			variableObj['auto_bkgd'] = label('0')
			variableObj['auto_key'] = label('1')
			variableObj['auto_dsk1'] = label('2')
			variableObj['auto_dsk2'] = label('3')
			variableObj['auto_pinp1'] = label('4')
			variableObj['auto_pinp2'] = label('5')
			variableObj['auto_ftb'] = label('6')
			variableObj['auto_aux'] = label('7')
			variableObj['auto_any_running'] = Object.values(auto).some((code) =>
				runningStates.includes(code)
			)
				? 'yes'
				: 'no'
		}

		self.setVariableValues(variableObj);
	}
}