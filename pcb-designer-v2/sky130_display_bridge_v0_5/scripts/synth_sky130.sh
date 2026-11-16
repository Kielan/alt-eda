#!/usr/bin/env bash
set -euo pipefail
: "${SKY130_LIB:?Set SKY130_LIB to sky130_fd_sc_hd__tt_025C_1v80.lib path}"
mkdir -p build
# For readable area statistics, use full synthesis and ABC mapping against Liberty.
yosys -l build/synth_sky130.log -p "
  read_verilog rtl/*.v;
  hierarchy -check -top display_soc_v05;
  synth -top display_soc_v05 -noabc;
  dfflibmap -liberty ${SKY130_LIB};
  abc -liberty ${SKY130_LIB};
  clean;
  check;
  stat -liberty ${SKY130_LIB};
  write_verilog -noattr -noexpr build/display_soc_sky130.v
"
