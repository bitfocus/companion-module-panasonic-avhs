## Panasonic AVHS

This module will connect to the Panasonic AV-UHS500, AV-HS410 and AW-HS50 video switchers. To control the AV-HS410, you will need to install the plug-in software for external interface control.

If you want feedbacks to work on the AV-HS410 please enable both network plugins (AUXP_IP and HS410_IF)
Plugins for the AV-HS410 mixer can be found by creating a login and downloading them directy from Panasonic: [Panasonic Support](https://eww.pass.panasonic.co.jp/p2ui/guest/TopLogin.do?lang=en&category=pav)

### Configuration

- Type in the device IP address.
- The device will communicate over port 60040 as default, this can be changed in the settings.

### Available actions

- Bus crosspoint control
- Send AUTO transition (HS50 and HS410 only)
- Send CUT transition (HS50 and HS410 only)
- Auto transition time control (HS410 only)

For additional actions, please raise a feature request on [GitHub](https://github.com/bitfocus/companion-module-panasonic-avhs/).
