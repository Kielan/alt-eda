`timescale 1ns/1ps
module tb_display_bridge;
 reg clk=0;always #5 clk=~clk;
 reg rst_n=0,valid=0,sof=0,eol=0,we=0;
 reg [23:0] rgb=0;reg [7:0] addr=0,wdata=0;
 wire [7:0] rdata,status;wire [23:0] out;
 wire ov,os,oe,pe,be,pwm;
 display_bridge dut(.clk(clk),.rst_n(rst_n),.dp_rgb(rgb),.dp_valid(valid),.dp_sof(sof),.dp_eol(eol),
 .cfg_we(we),.cfg_addr(addr),.cfg_wdata(wdata),.cfg_rdata(rdata),
 .tx_rgb(out),.tx_valid(ov),.tx_sof(os),.tx_eol(oe),.panel_enable(pe),
 .backlight_enable(be),.backlight_pwm(pwm),.status(status));
 task write_reg(input [7:0] a,input [7:0] d);begin
 @(negedge clk);addr=a;wdata=d;we=1;
 @(negedge clk);we=0;
 end endtask
 initial begin
 $dumpfile("display_bridge.vcd");$dumpvars(0,tb_display_bridge);
 repeat(3) @(negedge clk);rst_n=1;
 write_reg(8'h00,8'h01);
 write_reg(8'h01,8'h80);
 write_reg(8'h02,8'h03);
 repeat(5) @(negedge clk);
 if(!pe||!be) $fatal(1,"panel/backlight enable failed");
 rgb=24'h123456;valid=1;sof=1;eol=1;
 @(negedge clk);
 if(!ov||out!==24'h123456||!os||!oe) $fatal(1,"RGB pass-through failed");
 valid=0;sof=0;eol=0;
 write_reg(8'h00,8'h03);
 rgb=24'h123456;valid=1;
 @(negedge clk);
 if(out!==24'hEDCBA9) $fatal(1,"invert failed");
 valid=0;
 write_reg(8'h00,8'h05);
 rgb=24'h123456;valid=1;
 @(negedge clk);
 if(out!==24'hFF00FF) $fatal(1,"test pattern failed");
 $display("PASS: display bridge register, RGB, invert, test pattern, backlight tests");
 $finish;
 end
endmodule
