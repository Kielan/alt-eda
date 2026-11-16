`default_nettype none
// Optional timing demonstration source (not connected to display_soc_v05).
// All parameters in pixel-clock ticks. No clock generation/PLL or panel claim.
// Produces positive-polarity sync for review; panel polarity may differ.
module raster_timing_generator #(
 parameter [15:0] H_ACTIVE=16'd64,
 parameter [15:0] H_FRONT=16'd8,
 parameter [15:0] H_SYNC=16'd8,
 parameter [15:0] H_BACK=16'd8,
 parameter [15:0] V_ACTIVE=16'd40,
 parameter [15:0] V_FRONT=16'd2,
 parameter [15:0] V_SYNC=16'd2,
 parameter [15:0] V_BACK=16'd2
)(input wire clk,input wire rst_n,input wire enable,
 output reg [15:0] x,y,output wire de,hs,vs,sof,eol,
 output reg [23:0] rgb);
 localparam [16:0] H_TOTAL=H_ACTIVE+H_FRONT+H_SYNC+H_BACK;
 localparam [16:0] V_TOTAL=V_ACTIVE+V_FRONT+V_SYNC+V_BACK;
 always @(posedge clk or negedge rst_n) begin
  if(!rst_n)begin x<=0;y<=0;end
  else if(!enable)begin x<=0;y<=0;end
  else if(x==H_TOTAL-1) begin
   x<=0;
   if(y==V_TOTAL-1)y<=0;
   else y<=y+16'd1;
  end else x<=x+16'd1;
 end
 assign de=enable && (x<H_ACTIVE) && (y<V_ACTIVE);
 assign hs=enable && (x>=H_ACTIVE+H_FRONT) &&
   (x<H_ACTIVE+H_FRONT+H_SYNC);
 assign vs=enable && (y>=V_ACTIVE+V_FRONT) &&
   (y<V_ACTIVE+V_FRONT+V_SYNC);
 assign sof=de && x==0 && y==0;
 assign eol=de && x==H_ACTIVE-1;
 always @* begin
  if(!de)rgb=24'h000000;
  else if(x<(H_ACTIVE/4))rgb=24'hff0000;
  else if(x<(H_ACTIVE/2))rgb=24'h00ff00;
  else if(x<((H_ACTIVE*3)/4))rgb=24'h0000ff;
  else rgb=24'hffffff;
 end
endmodule
`default_nettype wire
