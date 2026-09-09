const { InstanceStatus, TCPHelper } = require('@companion-module/base');
const dgram = require('dgram');

const STX = String.fromCharCode(0x02)
const ETX = String.fromCharCode(0x03)

module.exports = {
	initConnection: function () {
		let self = this;

		let receivebuffer = '';

		try {
			if (self.socket !== undefined) {
				self.socket.destroy()
				delete self.socket
			}
		
			if (self.timer) {
				clearInterval(self.timer)
				delete self.timer
			}

			if (self.config.host) {
				let portTCP = 60020;

				if (self.config.model == 'HS450') {
					portTCP = 60020;
				}
				else if (self.config.model == 'HS410') {
					if (self.config.multicast == true) {
						portTCP = 60020;
					}
					else {
						portTCP = 60040;
					}
				}
				else if (self.config.model == 'UHS500') {
					portTCP = 62000;
				} else {
					// if HS50 is selected
					portTCP = 60040;
				}

				self.log('info', `Opening connection to ${self.config.host}:${portTCP}`);

				self.socket = new TCPHelper(self.config.host, portTCP);
	
				self.socket.on('error', function (err) {
						self.log('warn', 'Error: ' + err);
				});
		
				self.socket.on('connect', function () {
				self.updateStatus(InstanceStatus.Ok);

				if (self.config.model == 'UHS500') {
					self.timer = setInterval(function () {
						self.sendCommand('SPAT:0:00')
					}, 10000) // 10 sec keepalive command
				}

				if (self.config.model == 'HS450' || self.config.model == 'HS410') {
					self.timer = setInterval(function () {
						self.sendCommand('SPAT:0:00')
					}, 500) // 500 ms keepalive command

					//console.log(self.config.multicast)
					if (self.config.multicast == true) { // only when multicast is enabled in the config
						try {
							self.listenMulticast()
							self.log('info', 'Multicast Tally is enabled')
						} catch (e) {
							console.log('Error listening for Multicast Tally', e)
						}
					} else { // If not, delete old multicast sockets
						if (self.multi !== undefined) {
							self.multi.destroy() // Somehow this is needed even though it's not defined, if you remove it, then Companion will crash when updating the instance, but if you leave it it works and you will only get an error thrown, LOL 🤷
							delete self.multi
						}
						}
					}
				});
		
				self.socket.on('data', function(chunk) {
					let i = 0;
					let packet = '';
					let offset = 0;

					receivebuffer += chunk

					while ((i = receivebuffer.indexOf(ETX, offset)) !== -1) {
						packet = receivebuffer.substr(offset, i - offset)
						offset = i + 1

						if (packet.substr(0, 1) == STX) {
							self.socket.emit('receivepacket', packet.substr(1).toString())
						}
					}
					receivebuffer = receivebuffer.substr(offset)
				});

				self.socket.on('receivepacket', function (data) {
					// Ready for feedbacks
				});
			}
		}
		catch(error) {
			self.log('error', `Failed to connect: ${error}`);
			self.updateStatus(InstanceStatus.ConnectionFailure);
		}
	},

	// Send a TCP command
	sendCommand: function (command) {
		let self = this;

		if (self.socket !== undefined && self.socket.isConnected) {
			self.socket.send(STX + command + ETX)
		} else {
			self.updateStatus(InstanceStatus.ConnectionFailure, 'Error: Not connected')
		}
	},

	// Resolve an ABST source id against the model input table.
	// HS450 (and sometimes HS410) omits leading zeros in multicast ABST
	// frames — e.g. "5" instead of "05" — so match both the raw and a
	// zero-padded (min 2 digit) form.
	resolveInputLabel: function (rawId) {
		let self = this;
		let inputs = self[self.config.model + '_INPUTS'];
		if (!inputs || rawId === undefined || rawId === null || rawId === '') {
			return null;
		}

		let entry = inputs.find(({ id }) => id === rawId);
		if (!entry) {
			let padded = String(rawId).padStart(2, '0');
			if (padded !== rawId) {
				entry = inputs.find(({ id }) => id === padded);
			}
		}
		if (!entry) {
			self.log('debug', `Unknown ABST input id "${rawId}" for model ${self.config.model}`);
			return String(rawId);
		}
		return entry.label;
	},

	// Store received data
	storeData: function (str) {
		let self = this;
		let tally = self.data.tally;

		// Store Values from Events
		switch (str[0]) {
			case 'ABST': {
				// ABST:<bus>:<source>[:<tally>]
				let label = self.resolveInputLabel(str[2]);
				if (label === null) {
					break;
				}
				switch (str[1]) {
					case '00':
						tally.busA = label;
						break // Bus A
					case '01':
						tally.busB = label;
						break // Bus B
					case '02':
						tally.pgm = label;
						break // PGM
					case '03':
						tally.pvw = label;
						break // PVW
					case '04':
						tally.keyF = label;
						break // Key Fill
					case '05':
						tally.keyS = label;
						break // Key Source
					case '06':
						tally.dskF = label;
						break // DSK1 Fill
					case '07':
						tally.dskS = label;
						break // DSK1 Source
					case '08':
						tally.dsk2F = label;
						break // DSK2 Fill (HS450)
					case '09':
						tally.dsk2S = label;
						break // DSK2 Source (HS450)
					case '10':
						tally.pinP1 = label;
						break // PinP 1
					case '11':
						tally.pinP2 = label;
						break // PinP 2
					case '12':
						tally.aux1 = label;
						break // AUX 1
					case '13':
						tally.aux2 = label;
						break // AUX 2
					case '14':
						tally.aux3 = label;
						break // AUX 3
					case '15':
						tally.aux4 = label;
						break // AUX 4
					case '16':
						tally.aux1s = label;
						break // AUX1 source (HS450)
					case '17':
						tally.pinP1s = label;
						break // PinP1 source (HS450)
					case '18':
						tally.pinP2s = label;
						break // PinP2 source (HS450)
					default:
						break
				}
				break
			}
			case 'ATST':
				if (str.length >= 3) {
					tally.autoTrans[str[1]] = str[2]
				}
				break
			case 'ATLY':
				// ATLY:<pvw_hex>:<pgm_hex> — physical IN tally bitmasks.
				// bit0 = Input 1 (source 50), bit1 = Input 2, … (confirmed live for PGM;
				// PVW field matches earlier HS450 captures / AUXP_IP layout).
				if (str.length >= 3) {
					const pvw = parseInt(str[1], 16)
					const pgm = parseInt(str[2], 16)
					tally.atlyPvw = Number.isFinite(pvw) ? pvw >>> 0 : 0
					tally.atlyPgm = Number.isFinite(pgm) ? pgm >>> 0 : 0
				}
				break
			case 'SPAT':
				break // Store some data when SPAT command is recieved

			default:
				break
		}
	},

	// Setup Multicast for Tally
	listenMulticast: function () {
		let self = this;
		let receivebuffer = '';
		let multicastAddress = '224.0.0.200';
		let multicastInterface = self.interfaces;
		let multicastPort = 60020;		

		if (self.multi !== undefined) {
			self.multi.destroy()
			delete self.multi
		}

		return new Promise(function (resolve, reject) {
			self.multi = dgram.createSocket({ type: 'udp4', reuseAddr: true })

			self.multi.on('listening', function () {
				console.log('Now listening for Multicast Tally')
			})

			self.multi.on('message', function (message, remote) {
				var i = 0,
					packet = '',
					offset = 0
					receivebuffer += message

				while ((i = receivebuffer.indexOf(ETX, offset)) !== -1) {
					packet = receivebuffer.substr(offset, i - offset)
					offset = i + 1

					if (packet.substr(0, 1) == STX) {
						self.multi.emit('receivepacket', packet.substr(1).toString())
					}
				}
				receivebuffer = receivebuffer.substr(offset)
			})

			self.multi.on('error', function (err) {
				if (err.code === 'EINVAL') {
					console.log('Multicast error: ' + err)
					self.log('error', "Multicast error: Please only use one module for AV-HS410's at a time")
				}
				else if (err.code === 'EADDRINUSE') {
					console.log('Multicast error: ' + err)
					self.log('error', "Multicast error: Please only use one module for AV-HS410's at a time")
				}
				else if (err.code === ' ECONNREFUSED') {
					console.log('Multicast error: ' + err)
					self.log('error', "Multicast error: Please only use one module for AV-HS410's at a time")
				}
				else {
					console.log('multicast: on error: ' + err.stack)
				}
				reject(err)
			})

			self.multi.on('receivepacket', function (str_raw) {
				// Ready for feedbacks on multicast data
				str = str_raw.trim() // remove new line, carage return and so on.
				str = str.split(':') // Split Commands and data

				// Store Data
				self.storeData(str)
				self.checkVariables()
				self.checkFeedbacks()
			})

			self.multi.bind(multicastPort, () => {
				for (let i = 0; i < multicastInterface.length; i++) {
					try {
						self.multi.addMembership(multicastAddress, multicastInterface[i])
					} catch (error) {
						// Expected on some interfaces; tally still works if one join succeeds.
						self.log('debug', `Multicast join skipped on ${multicastInterface[i]}: ${error}`)
					}
				}
			})
			resolve()
		})
	},

	// Get All Network Interfaces
	getNetworkInterfaces: async function () {
		let self = this

		self.interfaces = []

		let temp = await self.parseVariablesInString('$(internal:all_ip)');
		let str = temp.split('\\n') // Split interfaces up

		for (let i = 0; i < str.length - 1; i++) {
			self.interfaces.push(str[i])
		}
	},

	// AUXP_IP Vol.2 SAUT is 2-field (SAUT:00:0). HS410 uses that when multicast
	// is enabled (TCP 60020); otherwise HS410_IF 3-field SAUT on 60040.
	usesAuxpIpSaut: function () {
		let self = this
		return (
			self.config.model == 'HS50' ||
			self.config.model == 'HS450' ||
			(self.config.model == 'HS410' && self.config.multicast == true)
		)
	},

	getSautTargets: function () {
		let self = this
		let model = self.config.model
		if (model == 'HS410' && self.config.multicast == true) {
			return self.HS410_AUXP_TARGETS
		}
		return self[model + '_TARGETS'] || []
	},
}