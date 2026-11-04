## Panasonic AVHS

This module connects to Panasonic AV-UHS500, AV-HS450, AV-HS410, and AW-HS50 video switchers.

### Plug-ins (AV-HS410)

To control an AV-HS410 you need Panasonic’s network plug-ins. Download them from [Panasonic Support](https://eww.pass.panasonic.co.jp/p2ui/guest/TopLogin.do?lang=en&category=pav) (login required).

| Goal | Plug-in | Module setting |
|------|---------|----------------|
| Control only (TCP 60040, HS410_IF) | **HS410_IF** | Multicast **off** |
| Control + tally/feedback (TCP/UDP 60020, AUXP_IP) | **AUXP_IP** (+ HS410_IF if you also need STIM/etc.) | Multicast **on** |

AV-HS450 uses AUXP_IP-compatible control on TCP **60020** with multicast tally on `224.0.0.200:60020` (no separate HS410_IF port).

**Note:** With more than one AV-HS410 on the same multicast group, tally variables are shared and follow the first mixer only.

### Configuration

- Enter the device IP address.
- Default ports: **62000** (UHS500), **60020** (HS450; HS410 with multicast), **60040** (HS410 without multicast, HS50).

### Available actions

- Bus crosspoint control (`SBUS`)
- Send AUTO transition (`SAUT`) — toggles BKGD / KEY / DSK / PinP / FTB (model-dependent)
- Send CUT transition (`SCUT`) — BKGD/KEY on AUXP_IP; broader on HS410_IF
- Auto transition time (`STIM`) — HS410_IF / UHS500 only (not HS450 / HS50)

### DSK on/off (#7)

There is no separate “DSK cut” on AUXP_IP. Use **Send AUTO transition** with target **DSK** (HS410) or **DSK 1 / DSK 2** (HS450). That is the same as pressing AUTO on the mixer for that effect.

With multicast enabled, **Auto Effect On** / AUTO presets use live `ATST` status (`05` = on) on HS450. HS410 AUXP_IP does not publish DSK in `ATST` (official table leaves slots 2–6 unused), so on/off feedback there is limited to what the mixer exposes.

### PinP + multicast tally (#14)

Enabling multicast on HS410 switches the module to **AUXP_IP** (port 60020, 2-field `SAUT`). PinP AUTO targets are `04`/`05` with `SAUT:<target>:0`. With multicast off, the module stays on **HS410_IF** (port 60040, 3-field `SAUT`).

If PinP worked before enabling tally and stopped after, use the main **Send AUTO transition** action after updating to this build — it picks the correct SAUT shape from the multicast setting (you should not need the old “Auto (2)” workaround for that case).

For additional actions, please raise a feature request on [GitHub](https://github.com/bitfocus/companion-module-panasonic-avhs/).
