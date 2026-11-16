`default_nettype none
module stream_monitor(input wire clk,input wire rst_n,input wire video_enable,
 input wire frame_pulse,output reg stream_healthy);
 parameter [23:0] TIMEOUT=24'd1000000;
 reg [23:0] ticks;
 always @(posedge clk or negedge rst_n) begin
  if(!rst_n) begin ticks<=0;stream_healthy<=0;end
  else if(!video_enable) begin ticks<=0;stream_healthy<=0;end
  else if(frame_pulse) begin ticks<=0;stream_healthy<=1;end
  else if(ticks>=TIMEOUT) begin stream_healthy<=0;end
  else ticks<=ticks+1'b1;
 end
endmodule
`default_nettype wire
