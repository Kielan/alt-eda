`timescale 1ns/1ps
`default_nettype none
module tb_soc_v05;
 reg clk=0;always #5 clk=~clk;
 reg rst_n=0;
 reg [23:0] dp_rgb=0;reg dp_valid=0,dp_sof=0,dp_eol=0;
 reg debug_wr=0;reg [7:0] debug_wr_addr=0,debug_wr_data=0,debug_reg_addr=0;
 wire [7:0] debug_reg_data;
 wire [23:0] out_rgb;wire out_valid,out_sof,out_eol;
 wire panel_enable,backlight_enable,backlight_pwm,stream_healthy;
 wire [2:0] boot_state;
 wire pkt_ready,pkt_byte_valid,pkt_done,pkt_busy;wire [7:0] pkt_byte;
 reg pkt_start=0,pkt_valid=0;reg [23:0] pkt_rgb=0;reg pkt_byte_ready=1;
 reg scl=1,sda=1;wire sda_low;
 display_soc_v05 dut(.clk(clk),.rst_n(rst_n),
  .i2c_scl(scl),.i2c_sda_in(sda && !sda_low),.i2c_sda_drive_low(sda_low),
  .dp_rgb(dp_rgb),.dp_valid(dp_valid),.dp_sof(dp_sof),.dp_eol(dp_eol),
  .out_rgb(out_rgb),.out_valid(out_valid),.out_sof(out_sof),.out_eol(out_eol),
  .pkt_start(pkt_start),.pkt_rgb(pkt_rgb),.pkt_valid(pkt_valid),.pkt_ready(pkt_ready),
  .pkt_byte(pkt_byte),.pkt_byte_valid(pkt_byte_valid),.pkt_byte_ready(pkt_byte_ready),
  .pkt_done(pkt_done),.pkt_busy(pkt_busy),
  .panel_enable(panel_enable),.backlight_enable(backlight_enable),
  .backlight_pwm(backlight_pwm),.boot_state(boot_state),.stream_healthy(stream_healthy),
  .debug_reg_data(debug_reg_data),.debug_reg_addr(debug_reg_addr),
  .debug_wr(debug_wr),.debug_wr_addr(debug_wr_addr),.debug_wr_data(debug_wr_data));
 task write_reg(input [7:0] a,input [7:0] d);begin
  @(negedge clk);debug_wr=1;debug_wr_addr=a;debug_wr_data=d;
  @(negedge clk);debug_wr=0;
 end endtask
 task check(input condition,input [255:0] message);begin
  if(!condition)begin $display("FAIL: %0s",message);$fatal(1);end
 end endtask
 initial begin
  $dumpfile("build/soc.vcd");$dumpvars(0,tb_soc_v05);
  repeat(4)@(negedge clk);rst_n=1;
  write_reg(8'h00,8'h01); // enable video
  @(negedge clk);dp_rgb=24'h123456;dp_valid=1;dp_sof=1;dp_eol=1;
  @(negedge clk);check(out_valid && out_sof && out_eol,"RGB valid and timing");
  check(out_rgb==24'h123456,"RGB pass-through");
  dp_valid=0;dp_sof=0;dp_eol=0;
  write_reg(8'h00,8'h03); // inversion
  @(negedge clk);dp_rgb=24'h0000aa;dp_valid=1;
  @(negedge clk);check(out_rgb==24'hffff55,"inversion");dp_valid=0;
  write_reg(8'h00,8'h05); // bars
  @(negedge clk);dp_valid=1;
  @(negedge clk);check(out_rgb==24'hff0000,"pattern red");dp_valid=0;
  write_reg(8'h02,8'h03); // request panel and light
  repeat(34)@(negedge clk);
  check(panel_enable,"panel sequence complete");
  check(backlight_enable,"backlight enable");
  write_reg(8'h01,8'h00);
  repeat(2)@(negedge clk);
  check(!backlight_enable,"zero brightness disables LED");
  debug_reg_addr=8'h0d;#1;
  check(debug_reg_data==8'hd5,"ID register");
  $display("PASS tb_soc_v05");$finish;
 end
endmodule
`default_nettype wire
