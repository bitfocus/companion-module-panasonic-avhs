# companion-module-panasonic-avhs

See [HELP.md](./companion/HELP.md) and [LICENSE](./LICENSE)

**V2.0.0**

- Conversion to Companion v3.x API

**Unreleased — AV-HS450 support**

- Added `AV-HS450` as a model option.
- HS450 uses TCP port 60020 (same as the AV-HS410 multicast port) and pushes
  tally/status via UDP multicast `224.0.0.200:60020`, so multicast tally support is enabled for the HS450 too.
- Added `HS450_BUS`, `HS450_INPUTS`, `HS450_TARGETS`, `HS450_CUTTARGETS` to `constants.js`.
  `HS450_INPUTS` covers all 32 XPT buttons (source ids 00-31), the 20 physical inputs
  (16 SDI + 2x2 optional cards = source 50-69), and the internal signals
  (CBAR, CBGD, Black, FMEM1-4, PGM, PVW, KEYOUT, CLN, MV1, MV2, ...).
  Source ids 73-76 are labelled `FMEM1-4` (the HS450 frame-memory names; the HS410
  spec labels them `Still1V`/`Still2V`/`Clip1V`/`Clip2V`).
- `storeData` now uses the model-specific inputs list
  (`self[model + '_INPUTS']`) so the HS450's 32-XPT range is resolved correctly (the HS410 only has 24 XPT).
- Added the HS450 source-bus entries (ABST buses 16-18: `aux1s`, `pinP1s`, `pinP2s`) to the tally data struct and the `storeData` ABST handler.
- 500ms keepalive polling enabled for the HS450 (same as the HS410).
- Tally feedbacks enabled for the HS450. Auto transition *time* (`STIM`) is HS410_IF-only and is not offered for HS450 (set rates on the mixer; VS-R45/AUXP_IP has no STIM).
- ATST auto-transition feedback (including DSK/PinP/FTB on/off) and ATLY physical-input PGM/PVW tally.
- HS410 + multicast uses AUXP_IP SAUT (2-field; DSK=`02`) so PinP/DSK AUTO keep working with tally enabled ([#7](https://github.com/bitfocus/companion-module-panasonic-avhs/issues/7), [#14](https://github.com/bitfocus/companion-module-panasonic-avhs/issues/14)).
- manifest `products` and `description` updated to include the AV-HS450.
