`default_nettype none
// Pixel clock domain; decoded and aligned video assumed. No DP PHY, DSC, or CDC.
module video_pipeline(input wire clk,input wire rst_n,
 input wire [23:0] s_rgb,input wire s_valid,input wire s_sof,input wire s_eol,
 input wire enable,input wire invert,input wire test_pattern,
 output reg [23:0] m_rgb,output reg m_valid,output reg m_sof,output reg m_eol,
 output reg [15:0] frame_count,output reg [15:0] line_count,
 output reg [15:0] pixel_count,output reg error_eol_without_pixels);
 reg [15:0] x;
 always @(posedge clk or negedge rst_n) begin
  if(!rst_n) begin m_rgb<=0;m_valid<=0;m_sof<=0;m_eol<=0;
   frame_count<=0;line_count<=0;pixel_count<=0;error_eol_without_pixels<=0;x<=0;end
  else begin
   m_valid<=s_valid && enable;
   m_sof<=s_valid && s_sof && enable;
   m_eol<=s_valid && s_eol && enable;
   if(s_valid && enable) begin
    if(test_pattern) begin
     if(x[5:4]==2'd0) m_rgb<=24'hff0000;
     else if(x[5:4]==2'd1) m_rgb<=24'h00ff00;
     else if(x[5:4]==2'd2) m_rgb<=24'h0000ff;
     else m_rgb<=24'hffffff;
    end else if(invert) m_rgb<=~s_rgb;
    else m_rgb<=s_rgb;
    if(s_sof) frame_count<=frame_count+16'd1;
    if(s_eol) begin
     line_count<=line_count+16'd1;
     pixel_count<=x+16'd1;
     x<=0;
    end else x<=x+16'd1;
   end else begin m_rgb<=0;end
  end
 end
endmodule
`default_nettype wire
