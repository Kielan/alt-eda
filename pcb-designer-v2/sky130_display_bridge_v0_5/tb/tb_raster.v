`timescale 1ns/1ps
`default_nettype none
module tb_raster;
reg clk=0;always #5 clk=~clk;
reg rst_n=0;wire [15:0] x,y;wire de,hs,vs,sof,eol;wire [23:0] rgb;
integer active=0,lines=0,frames=0,cycles=0;
raster_timing_generator #(.H_ACTIVE(16'd4),.H_FRONT(16'd1),.H_SYNC(16'd1),.H_BACK(16'd2),
 .V_ACTIVE(16'd3),.V_FRONT(16'd1),.V_SYNC(16'd1),.V_BACK(16'd1)) dut(
 .clk(clk),.rst_n(rst_n),.enable(1'b1),.x(x),.y(y),.de(de),.hs(hs),.vs(vs),
 .sof(sof),.eol(eol),.rgb(rgb));
initial begin repeat(3)@(negedge clk);rst_n=1;
 repeat(48)begin @(negedge clk);cycles=cycles+1;
 if(de)active=active+1;
 if(eol)lines=lines+1;
 if(sof)frames=frames+1;
 end
 if(active!==12 || lines!==3 || frames!==1)$fatal(1,"raster counts %0d %0d %0d",active,lines,frames);
 $display("PASS raster timing: 8x6 total, 4x3 active");$finish;end
endmodule
`default_nettype wire
