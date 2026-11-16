# SKY130 Display Bridge v0.5 — Design Review

## Boundary declaration

This is a synthesizable digital subsystem, **not** an LT7911UXC copy or drop-in compatible replacement. It is not a functioning DP receiver or DSI/LVDS electrical transmitter, and does not implement KTZ8866 analog power conversion. DP RGB is an already decoded stream in the single `clk` domain. DSI packet RGB is a separate source with an explicit ready/valid handshake; no video frame buffer or CDC is integrated. The LVDS mapping is a logical experiment and requires authoritative bit mapping verification before panel use.

## Module graph

- `display_soc_v05` top
  - `i2c_reg_slave_v05`: 7-bit address `0x3c`; register pointer and repeated-start read
  - `bridge_control`: central configuration and reset/panel-delay microsequencer
  - `bridge_register_reader`: I2C and debug reads
  - `video_pipeline`: registered pixel color mapping / valid / frame/line markers
  - `stream_monitor`: receives valid SOF pulse and checks timeout
  - `dsi_rgb888_packetizer`: RGB888 line packet byte stream (DI=0x3E, 4-byte header, payload, 2-byte CRC); external D-PHY required
  - `dsi_header_ecc`, `dsi_crc16_step`: header parity / payload CRC
  - `ktz8866_control_proxy`: PWM, enable only
- `lvds_mapping_proxy`: separately available logical lane-mapping example, not instantiated in top.

## Register map

| Address | Name | Direction | Description |
|---|---|---|---|
| 0x00 | CTRL | R/W | bit0 enable video, bit1 invert, bit2 RGB bars |
| 0x01 | BRIGHTNESS | R/W | 8-bit PWM duty setting |
| 0x02 | POWER | R/W | bit0 panel request, bit1 backlight request |
| 0x03 | WIDTH_L | R/W | DSI packet line width low byte |
| 0x04 | WIDTH_H | R/W | DSI packet line width high byte |
| 0x05 | STATUS | R | bit6 packet busy, bit5 sticky stream fault, bit4 stream healthy, bits2:0 boot state |
| 0x06 | FRAMES_L | R | low byte frame counter |
| 0x07 | FRAMES_H | R | high byte frame counter |
| 0x08 | LINES_L | R | low byte line counter |
| 0x09 | LINES_H | R | high byte line counter |
| 0x0A | FW_MODE | R/W | bit0 hold startup FSM (not CPU firmware) |
| 0x0B | FAULTS | R/W1C | bit0 sticky stream-fault flag |
| 0x0C | REVISION | R | 0x05 |
| 0x0D | IDENTIFIER | R | 0xD5 |

Writes through `debug_wr` take priority if I2C and debug write on same cycle. Debug is a development port, not an on-chip bus specification.

## v0.2 to v0.5 coverage

- v0.2: register map, I2C slave with register pointer; example bench covers debug writes; physical-bus I2C test vectors still required.
- v0.3: RGB888 data path, inversion, test pattern, input SOF/EOL accounting, plus **standalone compile-time configurable** raster timing generator with active/porch/sync outputs. It is not integrated into the main stream and is not a frame scaler.
- v0.4: DSI RGB888 long-packet byte stream, ECC, CRC and backpressure. LVDS logical lane bits; actual electrical lanes absent. DSI flow lacks DCS command scheduling, blanking, LP mode, frame sync, D-PHY and display initialization.
- v0.5: boot-state sequencer in hardware, status and fault reporting, brightness PWM and enable proxy. No embedded RISC-V, compiled firmware, actual KTZ8866 register programming, or analog regulators.

## Known issues and review priorities

1. No actual DP AUX, training, video decoding, 8b/10b or 128b/132b receiver.
2. No PHY, DDR serializer, clock recovery, PLL, or compliant pad library; this design cannot directly attach to a display panel.
3. No video buffering / pixel clock crossing. The DSI packet input must be fed explicitly using its ready signal.
4. DSI byte generator is a packet fragment, not a display protocol controller; ECC and CRC must be independently verified against published golden vectors.
5. I2C functionality is modeled in RTL but must be verified with dedicated START/repeated START/ACK/NACK test cases and electrical timing margins.
6. `RESET_DELAY`/`PANEL_DELAY` are reference clock cycles (defaults 8 and 16), not safe power-rail timing values.
7. The backlight abstraction does not protect LED strings or implement boost regulation, panel bias, fault detection, or fault-safe power shutdown.
8. `lvds_mapping_proxy` is a deliberately unverified bit allocation and must not be used as a real VESA/JEIDA implementation without rework.
9. One clock domain and no asynchronous input synchronization except the I2C sampling logic.
10. No synthesis, timing, DRC, LVS, STA, or FPGA/ASIC physical validation has been completed for this release.

## Review acceptance

- Register reset values and W1C behavior are readable and testable.
- Pipeline produces RGB color and sync with one registered cycle of latency.
- Packetizer produces 4-byte header + 3*width payload + two CRC bytes, pausing while not ready.
- PWM enable goes low with brightness zero.
- Startup FSM cannot enable backlight until panel request has progressed to ready state.
- Use supported Yosys Liberty and external PHY IP for SKY130 integration. Do not use this for real Legion Go display wiring.
