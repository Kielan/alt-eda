`default_nettype none
// Review-oriented SKY130 digital display subsystem, single system/pixel clock.
// Top-level DP is ALREADY-DECODED RGB. It is not a DP/eDP PHY or receiver.
// The packet port is a separate, backpressured pixel input for DSI byte framing;
// there is NO clock-domain crossing or frame FIFO between video and packet paths.
module display_soc_v05(input wire clk,input wire rst_n,
 input wire i2c_scl,input wire i2c_sda_in,output wire i2c_sda_drive_low,
 input wire [23:0] dp_rgb,input wire dp_valid,input wire dp_sof,input wire dp_eol,
 output wire [23:0] out_rgb,output wire out_valid,output wire out_sof,output wire out_eol,
 input wire pkt_start,input wire [23:0] pkt_rgb,input wire pkt_valid,
 output wire pkt_ready,output wire [7:0] pkt_byte,output wire pkt_byte_valid,
 input wire pkt_byte_ready,output wire pkt_done,output wire pkt_busy,
 output wire panel_enable,output wire backlight_enable,output wire backlight_pwm,
 output wire [2:0] boot_state,output wire stream_healthy,
 output wire [7:0] debug_reg_data,input wire [7:0] debug_reg_addr,
 input wire debug_wr,input wire [7:0] debug_wr_addr,input wire [7:0] debug_wr_data);
 wire i2c_wr;wire [7:0] i2c_wa,i2c_wd,i2c_ra,i2c_rd;
 wire we=debug_wr|i2c_wr;
 wire [7:0] wa=debug_wr?debug_wr_addr:i2c_wa;
 wire [7:0] wd=debug_wr?debug_wr_data:i2c_wd;
 wire video_enable,invert,test_pattern,panel_request,backlight_request,hold_boot;
 wire [7:0] brightness;
 wire [15:0] active_width,frame_count,line_count,pixel_count;
 wire pipe_err,sticky_fault,backlight_permit;
 wire [7:0] pwm_phase;
 i2c_reg_slave_v05 u_i2c(.clk(clk),.rst_n(rst_n),.scl(i2c_scl),
  .sda_in(i2c_sda_in),.sda_drive_low(i2c_sda_drive_low),
  .rd_addr(i2c_ra),.rd_data(i2c_rd),.wr_pulse(i2c_wr),
  .wr_addr(i2c_wa),.wr_data(i2c_wd));
 bridge_control u_control(.clk(clk),.rst_n(rst_n),.wr_en(we),
  .addr(wa),.wr_data(wd),.rd_data(),.frame_count(frame_count),
  .line_count(line_count),.stream_healthy(stream_healthy),.packet_busy(pkt_busy),
  .clear_fault_external(1'b0),.video_enable(video_enable),.invert(invert),
  .test_pattern(test_pattern),.brightness(brightness),.active_width(active_width),
  .panel_request(panel_request),.backlight_request(backlight_request),
  .hold_boot(hold_boot),.sticky_stream_fault(sticky_fault),
  .boot_state(boot_state),.panel_enable(panel_enable),
  .backlight_permit(backlight_permit));
 // Two combinational reg readers, same register bank.
 bridge_register_reader u_read_i2c(.addr(i2c_ra),.video_enable(video_enable),
  .invert(invert),.test_pattern(test_pattern),.brightness(brightness),
  .panel_request(panel_request),.backlight_request(backlight_request),
  .active_width(active_width),.boot_state(boot_state),.stream_healthy(stream_healthy),
  .packet_busy(pkt_busy),.sticky_fault(sticky_fault),.hold_boot(hold_boot),
  .frame_count(frame_count),.line_count(line_count),.data(i2c_rd));
 bridge_register_reader u_read_debug(.addr(debug_reg_addr),.video_enable(video_enable),
  .invert(invert),.test_pattern(test_pattern),.brightness(brightness),
  .panel_request(panel_request),.backlight_request(backlight_request),
  .active_width(active_width),.boot_state(boot_state),.stream_healthy(stream_healthy),
  .packet_busy(pkt_busy),.sticky_fault(sticky_fault),.hold_boot(hold_boot),
  .frame_count(frame_count),.line_count(line_count),.data(debug_reg_data));
 video_pipeline u_video(.clk(clk),.rst_n(rst_n),.s_rgb(dp_rgb),
  .s_valid(dp_valid),.s_sof(dp_sof),.s_eol(dp_eol),
  .enable(video_enable),.invert(invert),.test_pattern(test_pattern),
  .m_rgb(out_rgb),.m_valid(out_valid),.m_sof(out_sof),.m_eol(out_eol),
  .frame_count(frame_count),.line_count(line_count),.pixel_count(pixel_count),
  .error_eol_without_pixels(pipe_err));
 stream_monitor u_mon(.clk(clk),.rst_n(rst_n),.video_enable(video_enable),
  .frame_pulse(out_valid && out_sof),.stream_healthy(stream_healthy));
 dsi_rgb888_packetizer u_dsi(.clk(clk),.rst_n(rst_n),
  .start_line(pkt_start),.line_pixels(active_width),.pixel_rgb(pkt_rgb),
  .pixel_valid(pkt_valid),.pixel_ready(pkt_ready),.byte_data(pkt_byte),
  .byte_valid(pkt_byte_valid),.byte_ready(pkt_byte_ready),
  .busy(pkt_busy),.line_done(pkt_done),.underrun_error());
 ktz8866_control_proxy u_led(.clk(clk),.rst_n(rst_n),
  .permit(backlight_permit),.brightness(brightness),
  .led_enable(backlight_enable),.led_pwm(backlight_pwm),.pwm_phase(pwm_phase));
endmodule
module bridge_register_reader(input wire [7:0] addr,input wire video_enable,
 input wire invert,test_pattern,input wire [7:0] brightness,
 input wire panel_request,backlight_request,input wire [15:0] active_width,
 input wire [2:0] boot_state,input wire stream_healthy,packet_busy,sticky_fault,hold_boot,
 input wire [15:0] frame_count,line_count,output reg [7:0] data);
 always @* case(addr)
  8'h00:data={5'b0,test_pattern,invert,video_enable};
  8'h01:data=brightness;
  8'h02:data={6'b0,backlight_request,panel_request};
  8'h03:data=active_width[7:0];
  8'h04:data=active_width[15:8];
  8'h05:data={1'b0,packet_busy,sticky_fault,stream_healthy,1'b0,boot_state};
  8'h06:data=frame_count[7:0];
  8'h07:data=frame_count[15:8];
  8'h08:data=line_count[7:0];
  8'h09:data=line_count[15:8];
  8'h0A:data={7'b0,hold_boot};
  8'h0B:data={7'b0,sticky_fault};
  8'h0C:data=8'h05;
  8'h0D:data=8'hD5;
  default:data=8'h00;
 endcase
endmodule
`default_nettype wire
