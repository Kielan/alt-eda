# SKY130 Educational Display Bridge

An **LT7911UXC-inspired**, non-compatible digital display bridge training project.
It does **not** implement the Lontium chip, DisplayPort decoding/link training,
MIPI D-PHY/C-PHY, LVDS serializers, KTZ8866 power conversion, or production firmware.

## Files
- `rtl/display_bridge.v`: pixel pass-through, invert, test pattern, registers, PWM and panel enable.
- `rtl/i2c_reg_slave.v`: experimental I2C slave register adapter (not yet bus-verified; see limitations).
- `rtl/display_bridge_top.v`: combined top-level.
- `tb/tb_display_bridge.v`: core-only regression tests.
- `scripts/synth_generic.ys`: generic Yosys synthesis.
- `scripts/synth_sky130.ys`: starting point for SKY130 library mapping.

## Run simulation
```bash
iverilog -g2012 -s tb_display_bridge -o build/test.vvp rtl/display_bridge.v tb/tb_display_bridge.v
vvp build/test.vvp
```

## Run generic synthesis
```bash
yosys -s scripts/synth_generic.ys
```

## Map to SKY130 HD
Install the PDK/standard-cell liberty. Run `synth -top display_bridge_top -noabc`,
then `dfflibmap -liberty <your_sky130_fd_sc_hd_liberty>` and
`abc -liberty <your_sky130_fd_sc_hd_liberty>` in Yosys. Real physical design
requires timing constraints, floorplanning, pin placement, power grid, placement,
clock tree, routing, DRC/LVS and signoff.

## Register map
| Address | Meaning |
|---|---|
| 0x00 | bit0 enable, bit1 invert RGB, bit2 magenta test pattern |
| 0x01 | PWM duty 0-255 |
| 0x02 | bit0 panel request, bit1 backlight request |
| 0x03 | status: bit3 backlight, bit2 panel, bit1 video valid, bit0 enable |
| 0x04 | frame counter low |
| 0x05 | frame counter high |
| 0x06 | fixed core ID 0xA1 |

## Interface boundaries
Input `dp_rgb`, `dp_valid`, `dp_sof`, `dp_eol` is **already decoded pixel data**,
not DisplayPort lane signals. Output `tx_rgb` and strobes are parallel pixels,
not MIPI or LVDS electrical signaling. One input clock domain is assumed.
There is no frame buffer, DSC, scaling, color space conversion, DP AUX/HPD,
line coding, video packetization, lane mapping or real firmware CPU.

## KTZ8866 clarification
A KTZ8866 is a separate analog power/backlight-driver device. `backlight_enable`
and `backlight_pwm` are *illustrative controller signals*, not validated pin
connections, polarity, voltage or timing for the KTZ8866. Use its official
datasheet and a suitable external driver; never connect these signals to
an unknown physical pin without electrical verification.

## Known limitations / warnings
- I2C slave is an **experimental educational adapter**. Its ACK timing and read
  behavior have not been verified with a protocol testbench; do not tape out or
  attach it to real hardware without a bus-level test and fixes.
- 2-flop/3-flop synchronization is not a replacement for full I2C timing filtering.
- No high-speed PHY macros, no mixed-signal macro layout, no ESD/pad ring.
- PWM is digital only; analog LED current regulation and protection are absent.
- The illustrative startup delay is only three clock cycles, **not safe real
  panel/backlight sequencing**.
- The top-level is for digital synthesis exploration, not pin-compatible replacement.
