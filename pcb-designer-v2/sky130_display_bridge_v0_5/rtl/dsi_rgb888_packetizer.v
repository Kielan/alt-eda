`default_nettype none
// MIPI DSI RGB888 long-packet byte generator ONLY. No D-PHY/LP mode/VSYNC
// packet timing/virtual channel arbitration. One RGB888 line per start pulse.
// Caller must issue start_line when idle and then supply exactly WIDTH pixels,
// obeying pixel_ready. Byte stream supports downstream stall.
module dsi_rgb888_packetizer(input wire clk,input wire rst_n,
 input wire start_line,input wire [15:0] line_pixels,
 input wire [23:0] pixel_rgb,input wire pixel_valid,output wire pixel_ready,
 output reg [7:0] byte_data,output wire byte_valid,input wire byte_ready,
 output wire busy,output reg line_done,output reg underrun_error);
 localparam IDLE=4'd0,H0=4'd1,H1=4'd2,H2=4'd3,H3=4'd4,
  GET=4'd5,R=4'd6,G=4'd7,B=4'd8,CRC0=4'd9,CRC1=4'd10;
 reg [3:0] state;
 reg [15:0] remaining,word_count,crc;
 reg [23:0] held_pixel;
 reg [7:0] byte_value;
 wire [7:0] ecc;
 wire [15:0] crc_next;
 wire fire=byte_valid && byte_ready;
 wire [23:0] header={word_count,8'h3e};
 dsi_header_ecc u_ecc(.d(header),.ecc(ecc));
 dsi_crc16_step u_crc(.crc_in(crc),.data_in(byte_value),.crc_out(crc_next));
 assign busy=(state!=IDLE);
 assign pixel_ready=(state==GET);
 assign byte_valid=(state!=IDLE && state!=GET);
 always @* begin
  case(state)
   H0:byte_value=8'h3e;
   H1:byte_value=word_count[7:0];
   H2:byte_value=word_count[15:8];
   H3:byte_value=ecc;
   R:byte_value=held_pixel[23:16];
   G:byte_value=held_pixel[15:8];
   B:byte_value=held_pixel[7:0];
   CRC0:byte_value=crc[7:0];
   CRC1:byte_value=crc[15:8];
   default:byte_value=0;
  endcase
 end
 always @* byte_data=byte_value;
 always @(posedge clk or negedge rst_n) begin
  if(!rst_n) begin state<=IDLE;remaining<=0;word_count<=0;
   crc<=16'hffff;held_pixel<=0;line_done<=0;underrun_error<=0;end
  else begin
   line_done<=0;
   if(state==IDLE) begin
    if(start_line) begin
     if(line_pixels==0 || line_pixels>16'd21845) underrun_error<=1;
     else begin
      remaining<=line_pixels;
      word_count<=line_pixels*16'd3;
      crc<=16'hffff;state<=H0;underrun_error<=0;
     end
    end
   end else case(state)
    H0:if(fire)state<=H1;
    H1:if(fire)state<=H2;
    H2:if(fire)state<=H3;
    H3:if(fire)state<=GET;
    GET:if(pixel_valid) begin held_pixel<=pixel_rgb;state<=R;end
    R:if(fire)begin crc<=crc_next;state<=G;end
    G:if(fire)begin crc<=crc_next;state<=B;end
    B:if(fire)begin
     crc<=crc_next;
     remaining<=remaining-1'b1;
     if(remaining==16'd1)state<=CRC0;
     else state<=GET;
    end
    CRC0:if(fire)state<=CRC1;
    CRC1:if(fire)begin state<=IDLE;line_done<=1;end
    default:state<=IDLE;
   endcase
  end
 end
endmodule
`default_nettype wire
