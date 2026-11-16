#!/usr/bin/env bash
set -euo pipefail
mkdir -p build
iverilog -g2012 -Wall -s tb_soc_v05 -o build/soc_tb rtl/*.v tb/tb_soc_v05.v
vvp build/soc_tb
iverilog -g2012 -Wall -s tb_dsi_packet -o build/dsi_tb rtl/*.v tb/tb_dsi_packet.v
vvp build/dsi_tb
iverilog -g2012 -Wall -s tb_raster -o build/raster_tb rtl/*.v tb/tb_raster.v
vvp build/raster_tb
yosys -Q -s scripts/synth_generic.ys | tee build/synth_generic.log
