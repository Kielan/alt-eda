# SKY130 Display Bridge v0.5 (code-review release)

**Educational digital ASIC project, inspired by a DP-to-MIPI/LVDS display converter.** Not a commercial LT7911UXC replacement, not drop-in compatible, and not usable as a real 2560×1600 144-Hz panel driver without major high-speed PHY and clock-domain subsystems.

## What's actually included

- v0.2: I2C register slave (0x3C), configuration/status bank, firmware-like hardware startup FSM
- v0.3: decoded RGB888 video pipeline, inversion/test pattern, SOF/EOL counters and stream watchdog; **standalone** configurable raster timing generator
- v0.4: RGB888 MIPI DSI **byte packetizer**, header ECC / payload CRC and output backpressure; LVDS **logic-only** mapping example
- v0.5: power sequencing proxy, brightness PWM/backlight-enable control, status/fault registers, integrated RTL top, basic testbenches and Yosys scripts
- Standalone `visual/display_bridge_review.html` **browser simulation / inspection UI** that makes no hardware claims.

## Verify when EDA tools are installed

```sh
bash scripts/run_tests.sh
```

Or individually:

```sh
mkdir -p build
iverilog -g2012 -s tb_soc_v05 -o build/soc_tb rtl/*.v tb/tb_soc_v05.v
vvp build/soc_tb
iverilog -g2012 -s tb_dsi_packet -o build/dsi_tb rtl/*.v tb/tb_dsi_packet.v
vvp build/dsi_tb
yosys -s scripts/synth_generic.ys
```

Map to SKY130 standard cells (install matching SKY130 Liberty first):

```sh
SKY130_LIB=/path/to/sky130_fd_sc_hd__tt_025C_1v80.lib bash scripts/synth_sky130.sh
```

**Not executed here:** Yosys and Icarus Verilog are unavailable in the current environment. Testbenches are provided for local use and **should not be assumed passing**. The generic and SKY130 scripts are templates, not a proof of physical implementation. Ensure your PDK/Liberty version and timing corner match your toolchain.

## File map

- `rtl/display_soc_v05.v`: integrated top + register readers
- `rtl/bridge_control.v`: register write bank, power sequencing FSM
- `rtl/i2c_reg_slave_v05.v`: experimental I2C slave (further bus verification required)
- `rtl/video_pipeline.v`: streaming decoded RGB path
- `rtl/stream_monitor.v`: watchdog
- `rtl/raster_timing_generator.v`: standalone programmable raster test-source (not integrated in top)
- `rtl/dsi_rgb888_packetizer.v`, `rtl/dsi_ecc_crc.v`: DSI line packet byte stream, ECC & CRC
- `rtl/lvds_mapping_proxy.v`: unverified logical mapping, not LVDS electrical signaling
- `rtl/ktz8866_control_proxy.v`: abstract PWM / enable, NOT a KTZ8866 chip model
- `tb/`: basic testbenches
- `scripts/`: simulation and Yosys
- `docs/ARCHITECTURE.md`: register table, limitations and stage-by-stage review
- `legacy_starter/`: previous v0.1 files for comparison only; not compiled

## Critical validation boundary

The DP video input is **already decoded** by an external (absent) receiver. The DSI output is **bytes**, not a MIPI D-PHY lane. The backlight output is logic, not an LED boost converter. Board pinout, voltage domains, firmware protocols, DSI panel initialization, high-speed timing and actual Legion Go connectivity are not known.
