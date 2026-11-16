`default_nettype none
// DSI packet header ECC parity matrix; header [7:0] = data ID,
// [15:8] = WC LSB, [23:16] = WC MSB. ECC top bits 0.
module dsi_header_ecc(input wire [23:0] d,output wire [7:0] ecc);
 assign ecc[0]=d[0]^d[1]^d[2]^d[4]^d[5]^d[7]^d[10]^d[11]^d[13]^d[16]^d[20]^d[21]^d[22]^d[23];
 assign ecc[1]=d[0]^d[1]^d[3]^d[4]^d[6]^d[8]^d[10]^d[12]^d[14]^d[17]^d[20]^d[21]^d[22]^d[23];
 assign ecc[2]=d[0]^d[2]^d[3]^d[5]^d[6]^d[9]^d[11]^d[12]^d[15]^d[18]^d[20]^d[21]^d[22];
 assign ecc[3]=d[1]^d[2]^d[3]^d[7]^d[8]^d[9]^d[13]^d[14]^d[15]^d[19]^d[20]^d[21]^d[23];
 assign ecc[4]=d[4]^d[5]^d[6]^d[7]^d[8]^d[9]^d[16]^d[17]^d[18]^d[19]^d[20]^d[22]^d[23];
 assign ecc[5]=d[10]^d[11]^d[12]^d[13]^d[14]^d[15]^d[16]^d[17]^d[18]^d[19]^d[21]^d[22]^d[23];
 assign ecc[7:6]=2'b00;
endmodule
// Reflected CRC-16 X.25/MIPI payload algorithm, LSB-first per byte.
// Polynomial x^16 + x^12 + x^5 + 1, init FFFF, no final XOR.
module dsi_crc16_step(input wire [15:0] crc_in,input wire [7:0] data_in,
 output reg [15:0] crc_out);
 integer i;
 reg [15:0] c;
 always @* begin
  c=crc_in;
  for(i=0;i<8;i=i+1) begin
   if(c[0]^data_in[i]) c=(c>>1)^16'h8408;
   else c=(c>>1);
  end
  crc_out=c;
 end
endmodule
`default_nettype wire
