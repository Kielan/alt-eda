`default_nettype none
// JEIDA-style RGB888 logical mapping only: seven parallel bits per channel.
// NOT a serializer, LVDS output pad, PLL, or verified panel mapping.
module lvds_mapping_proxy(input wire [23:0] rgb,input wire de,input wire hs,input wire vs,
 output wire [6:0] ch0,output wire [6:0] ch1,output wire [6:0] ch2,output wire [6:0] ch3);
 assign ch0={rgb[5:0],rgb[16]};
 assign ch1={rgb[11:8],rgb[17:16],rgb[6]};
 assign ch2={de,vs,hs,rgb[15:12]};
 assign ch3={rgb[23:18],rgb[7]};
endmodule
`default_nettype wire
