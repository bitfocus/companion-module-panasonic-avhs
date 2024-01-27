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
		variables.push({ variableId: 'dsk_fill', name: 'DSK Fill Selected' })
		variables.push({ variableId: 'dsk_source', name: 'DSK Source Selected' })
		variables.push({ variableId: 'pinp_1', name: 'PinP 1 Selected' })
		variables.push({ variableId: 'pinp_2', name: 'PinP 2 Selected' })
		variables.push({ variableId: 'aux_1', name: 'AUX 1 Selected' })
		variables.push({ variableId: 'aux_2', name: 'AUX 2 Selected' })
		variables.push({ variableId: 'aux_3', name: 'AUX 3 Selected' })
		variables.push({ variableId: 'aux_4', name: 'AUX 4 Selected' })

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
		variableObj['pinp_1'] = self.data.tally.pinP1;
		variableObj['pinp_2'] = self.data.tally.pinP2;
		variableObj['aux_1'] = self.data.tally.aux1;
		variableObj['aux_2'] = self.data.tally.aux2;
		variableObj['aux_3'] = self.data.tally.aux3;
		variableObj['aux_4'] = self.data.tally.aux4;
		
		self.setVariableValues(variableObj);
	}
}