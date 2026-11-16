`default_nettype none
// Educational digital display bridge. No DisplayPort/MIPI/LVDS analog PHY.
module display_bridge (
 input wire clk, input wire rst_n,
 // PHY-decoded RGB888 stream; all signals synchronous to clk
 input wire [23:0] dp_rgb, input wire dp_valid,
 input wire dp_sof, input wire dp_eol,
 // simple register write port (driven by I2C register adapter or testbench)
 input wire cfg_we, input wire [7:0] cfg_addr, input wire [7:0] cfg_wdata,
 output reg [7:0] cfg_rdata,
 output reg [23:0] tx_rgb, output reg tx_valid,
 output reg tx_sof, output reg tx_eol,
 output wire panel_enable, output wire backlight_enable,
 output wire backlight_pwm, output wire [7:0] status
);
 reg enable, invert, test_pattern, panel_request, backlight_request;
 reg [7:0] brightness;
 reg [15:0] frames;
 reg [7:0] pwm_count;
 reg [1:0] startup;
 // Power-up sequencing is illustrative, not a KTZ8866 datasheet sequence.
 always @(posedge clk or negedge rst_n) begin
  if (!rst_n) begin
   enable<=0; invert<=0; test_pattern<=0;
   panel_request<=0; backlight_request<=0; brightness<=8'd128;
   frames<=0; pwm_count<=0; startup<=0;
   tx_rgb<=0; tx_valid<=0; tx_sof<=0; tx_eol<=0;
  end else begin
   pwm_count <= pwm_count + 8'd1;
   if (cfg_we) begin
    case (cfg_addr)
     8'h00: begin enable<=cfg_wdata[0]; invert<=cfg_wdata[1]; test_pattern<=cfg_wdata[2]; end
     8'h01: brightness<=cfg_wdata;
     8'h02: begin panel_request<=cfg_wdata[0]; backlight_request<=cfg_wdata[1]; end
     default: begin end
    endcase
   end
   if (!panel_request) startup<=0;
   else if (startup != 2'd3) startup<=startup+2'd1;
   tx_valid <= dp_valid && enable;
   tx_sof <= dp_sof && dp_valid && enable;
   tx_eol <= dp_eol && dp_valid && enable;
   if (dp_valid && enable) begin
    if (test_pattern) tx_rgb <= 24'hFF00FF;
    else if (invert) tx_rgb <= ~dp_rgb;
    else tx_rgb <= dp_rgb;
   end else tx_rgb<=0;
   if (dp_valid && dp_sof && enable) frames<=frames+16'd1;
  end
 end
 assign panel_enable = panel_request && (startup==2'd3);
 assign backlight_enable = panel_enable && backlight_request;
 assign backlight_pwm = backlight_enable && (pwm_count < brightness);
 assign status = {4'b0000, backlight_enable, panel_enable, tx_valid, enable};
 always @* begin
  case (cfg_addr)
   8'h00: cfg_rdata={5'b0,test_pattern,invert,enable};
   8'h01: cfg_rdata=brightness;
   8'h02: cfg_rdata={6'b0,backlight_request,panel_request};
   8'h03: cfg_rdata=status;
   8'h04: cfg_rdata=frames[7:0];
   8'h05: cfg_rdata=frames[15:8];
   8'h06: cfg_rdata=8'hA1; // educational core ID
   default: cfg_rdata=0;
  endcase
 end
endmodule
`default_nettype wire
