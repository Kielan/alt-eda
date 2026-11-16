`default_nettype none
module display_bridge_top(input wire clk,input wire rst_n,
 input wire [23:0] dp_rgb,input wire dp_valid,input wire dp_sof,input wire dp_eol,
 input wire i2c_scl,input wire i2c_sda_in,output wire i2c_sda_drive_low,
 output wire [23:0] tx_rgb,output wire tx_valid,output wire tx_sof,output wire tx_eol,
 output wire panel_enable,output wire backlight_enable,output wire backlight_pwm,
 output wire [7:0] status);
 wire we;wire [7:0] addr,wdata,rdata;
 i2c_reg_slave u_i2c(.clk(clk),.rst_n(rst_n),.scl(i2c_scl),.sda_in(i2c_sda_in),
  .sda_drive_low(i2c_sda_drive_low),.cfg_we(we),.cfg_addr(addr),.cfg_wdata(wdata),.cfg_rdata(rdata));
 display_bridge u_core(.clk(clk),.rst_n(rst_n),.dp_rgb(dp_rgb),.dp_valid(dp_valid),
 .dp_sof(dp_sof),.dp_eol(dp_eol),.cfg_we(we),.cfg_addr(addr),.cfg_wdata(wdata),.cfg_rdata(rdata),
 .tx_rgb(tx_rgb),.tx_valid(tx_valid),.tx_sof(tx_sof),.tx_eol(tx_eol),
 .panel_enable(panel_enable),.backlight_enable(backlight_enable),.backlight_pwm(backlight_pwm),.status(status));
endmodule
`default_nettype wire
