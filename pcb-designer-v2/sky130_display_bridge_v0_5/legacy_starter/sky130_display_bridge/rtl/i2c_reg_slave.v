`default_nettype none
// 7-bit I2C address 0x3C, single-byte register address, sequential data writes.
// Standard-mode oriented oversampled implementation; no clock stretching.
// SDA is open drain; external pull-up required. Clock domain must be much faster than SCL.
module i2c_reg_slave(input wire clk,input wire rst_n,input wire scl,input wire sda_in,
 output wire sda_drive_low, output reg cfg_we, output reg [7:0] cfg_addr,
 output reg [7:0] cfg_wdata,input wire [7:0] cfg_rdata);
 reg [2:0] scl_sync,sda_sync;
 wire scl_rise=(scl_sync[2:1]==2'b01);
 wire scl_fall=(scl_sync[2:1]==2'b10);
 wire start_cond=(sda_sync[2:1]==2'b10)&&scl_sync[2];
 wire stop_cond=(sda_sync[2:1]==2'b01)&&scl_sync[2];
 localparam IDLE=0,RECV=1,ACK=2,SEND=3,MASTER_ACK=4;
 reg [2:0] state;
 reg [2:0] bit_count;
 reg [7:0] shift,tx_shift;
 reg [1:0] phase; // address, register, payload
 reg rw,selected,ack_pending,drive_ack,send_after_ack;
 reg [7:0] reg_ptr;
 assign sda_drive_low = (state==ACK && drive_ack) || (state==SEND && !tx_shift[7]);
 always @(posedge clk or negedge rst_n) begin
  if(!rst_n) begin
   scl_sync<=3'b111;sda_sync<=3'b111;state<=IDLE;bit_count<=0;
   shift<=0;tx_shift<=0;phase<=0;rw<=0;selected<=0;
   ack_pending<=0;drive_ack<=0;send_after_ack<=0;
   reg_ptr<=0;cfg_we<=0;cfg_addr<=0;cfg_wdata<=0;
  end else begin
   scl_sync<={scl_sync[1:0],scl};sda_sync<={sda_sync[1:0],sda_in};
   cfg_we<=0;
   if(start_cond) begin state<=RECV;bit_count<=0;phase<=0;selected<=0;drive_ack<=0;end
   else if(stop_cond) begin state<=IDLE;drive_ack<=0;end
   else case(state)
    IDLE: begin end
    RECV: if(scl_rise) begin
     shift<={shift[6:0],sda_sync[2]};
     if(bit_count==7) begin
      bit_count<=0;state<=ACK;
      if(phase==0) begin
       selected<=(shift[6:0]==7'h3c);
       rw<=sda_sync[2];
       ack_pending<=(shift[6:0]==7'h3c);
       send_after_ack<=sda_sync[2] && (shift[6:0]==7'h3c);
       phase<=1;
      end else if(phase==1) begin
       reg_ptr<={shift[6:0],sda_sync[2]};
       ack_pending<=selected;send_after_ack<=0;phase<=2;
      end else begin
       ack_pending<=selected;send_after_ack<=0;
       if(selected) begin cfg_addr<=reg_ptr;cfg_wdata<={shift[6:0],sda_sync[2]};cfg_we<=1;reg_ptr<=reg_ptr+1'b1;end
      end
     end else bit_count<=bit_count+1'b1;
    end
    ACK: begin
     if(scl_fall && !drive_ack) drive_ack<=ack_pending;
     else if(scl_fall && drive_ack) begin
      drive_ack<=0;
      if(send_after_ack) begin state<=SEND;tx_shift<=cfg_rdata;cfg_addr<=reg_ptr;end
      else state<=RECV;
     end
    end
    SEND: if(scl_fall) tx_shift<={tx_shift[6:0],1'b1};
          else if(scl_rise && bit_count==7) begin state<=MASTER_ACK;bit_count<=0;end
          else if(scl_rise) bit_count<=bit_count+1'b1;
    MASTER_ACK: if(scl_rise) begin
      if(!sda_sync[2]) begin reg_ptr<=reg_ptr+1'b1;cfg_addr<=reg_ptr+1'b1;tx_shift<=cfg_rdata;state<=SEND;end
      else state<=IDLE;
    end
    default: state<=IDLE;
   endcase
  end
 end
endmodule
`default_nettype wire
