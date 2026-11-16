`default_nettype none
// register map (8-bit): 00 CTRL enable/invert/test; 01 PWM brightness;
// 02 POWER req panel/backlight; 03 TIMING line width low; 04 high;
// 05 STATUS read-only; 06..09 frame/line counters low/high;
// 0A firmware mode (0=boot FSM, 1=hold); 0B fault flags (W1C bit0).
// A separate hardware startup microsequencer is used instead of CPU firmware.
module bridge_control(input wire clk,input wire rst_n,
 input wire wr_en,input wire [7:0] addr,input wire [7:0] wr_data,
 output reg [7:0] rd_data,
 input wire [15:0] frame_count,input wire [15:0] line_count,
 input wire stream_healthy,input wire packet_busy,input wire clear_fault_external,
 output reg video_enable,output reg invert,output reg test_pattern,
 output reg [7:0] brightness,output reg [15:0] active_width,
 output reg panel_request,output reg backlight_request,
 output reg hold_boot,output reg sticky_stream_fault,
 output reg [2:0] boot_state,
 output wire panel_enable,output wire backlight_permit);
 // Delays are measured in clk cycles, not real silicon power supply rise times.
 parameter [15:0] RESET_DELAY=16'd8;
 parameter [15:0] PANEL_DELAY=16'd16;
 reg [15:0] timer;
 always @(posedge clk or negedge rst_n) begin
  if(!rst_n) begin
   video_enable<=0;invert<=0;test_pattern<=0;brightness<=8'd128;
   active_width<=16'd2560;panel_request<=0;backlight_request<=0;
   hold_boot<=0;sticky_stream_fault<=0;boot_state<=0;timer<=0;
  end else begin
   if(clear_fault_external) sticky_stream_fault<=0;
   if(panel_request && video_enable && !stream_healthy && boot_state==3)
     sticky_stream_fault<=1;
   if(wr_en) case(addr)
    8'h00: begin video_enable<=wr_data[0];invert<=wr_data[1];test_pattern<=wr_data[2];end
    8'h01: brightness<=wr_data;
    8'h02: begin panel_request<=wr_data[0];backlight_request<=wr_data[1];end
    8'h03: active_width[7:0]<=wr_data;
    8'h04: active_width[15:8]<=wr_data;
    8'h0A: hold_boot<=wr_data[0];
    8'h0B: if(wr_data[0]) sticky_stream_fault<=0;
    default: begin end
   endcase
   if(!panel_request || hold_boot) begin boot_state<=0;timer<=0;end
   else case(boot_state)
    0: begin boot_state<=1;timer<=0;end
    1: if(timer>=RESET_DELAY) begin boot_state<=2;timer<=0;end
       else timer<=timer+1'b1;
    2: if(timer>=PANEL_DELAY) begin boot_state<=3;timer<=0;end
       else timer<=timer+1'b1;
    3: begin end
    default: begin boot_state<=0;timer<=0;end
   endcase
  end
 end
 assign panel_enable=(boot_state==3) && panel_request;
 assign backlight_permit=panel_enable && backlight_request && video_enable;
 always @* begin
  case(addr)
   8'h00:rd_data={5'b0,test_pattern,invert,video_enable};
   8'h01:rd_data=brightness;
   8'h02:rd_data={6'b0,backlight_request,panel_request};
   8'h03:rd_data=active_width[7:0];
   8'h04:rd_data=active_width[15:8];
   8'h05:rd_data={1'b0,packet_busy,sticky_stream_fault,stream_healthy,1'b0,boot_state};
   8'h06:rd_data=frame_count[7:0];
   8'h07:rd_data=frame_count[15:8];
   8'h08:rd_data=line_count[7:0];
   8'h09:rd_data=line_count[15:8];
   8'h0A:rd_data={7'b0,hold_boot};
   8'h0B:rd_data={7'b0,sticky_stream_fault};
   8'h0C:rd_data=8'h05; // revision
   8'h0D:rd_data=8'hD5; // identification
   default:rd_data=8'h00;
  endcase
 end
endmodule
`default_nettype wire
