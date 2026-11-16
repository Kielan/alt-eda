`timescale 1ns/1ps
`default_nettype none
module tb_dsi_packet;
 reg clk=0;always #5 clk=~clk;
 reg rst_n=0,start_line=0,pixel_valid=0,byte_ready=1;
 reg [23:0] pixel_rgb=0;wire pixel_ready,byte_valid,busy,done,err;
 wire [7:0] byte_data;
 integer n=0;
 reg [7:0] captured[0:11];
 dsi_rgb888_packetizer dut(.clk(clk),.rst_n(rst_n),.start_line(start_line),
 .line_pixels(16'd2),.pixel_rgb(pixel_rgb),.pixel_valid(pixel_valid),
 .pixel_ready(pixel_ready),.byte_data(byte_data),.byte_valid(byte_valid),
 .byte_ready(byte_ready),.busy(busy),.line_done(done),.underrun_error(err));
 always @(posedge clk) if(rst_n && byte_valid && byte_ready) begin
  if(n>11)$fatal(1,"too many bytes");
  captured[n]=byte_data;n=n+1;
 end
 task send_pixel(input [23:0] rgb);begin
  wait(pixel_ready);@(negedge clk);pixel_valid=1;pixel_rgb=rgb;
  @(negedge clk);pixel_valid=0;
 end endtask
 initial begin
  $dumpfile("build/dsi.vcd");$dumpvars(0,tb_dsi_packet);
  repeat(3)@(negedge clk);rst_n=1;
  @(negedge clk);start_line=1;
  @(negedge clk);start_line=0;
  send_pixel(24'h112233);send_pixel(24'haabbcc);
  wait(done);#1;
  if(n!=12)$fatal(1,"packet length expected 12 got %0d",n);
  if(captured[0]!==8'h3e || captured[1]!==8'h06 || captured[2]!==8'h00)
    $fatal(1,"bad RGB888 header");
  if(captured[4]!==8'h11 || captured[5]!==8'h22 || captured[6]!==8'h33 ||
     captured[7]!==8'haa || captured[8]!==8'hbb || captured[9]!==8'hcc)
    $fatal(1,"bad pixel bytes");
  if(err)$fatal(1,"unexpected packet error");
  $display("PASS tb_dsi_packet, header/payload/CRC bytes=%0d",n);$finish;
 end
 initial begin #10000;$fatal(1,"timeout");end
endmodule
`default_nettype wire
