`default_nettype none
// Oversampled I2C 7-bit slave, address 0x3C. Register pointer + auto-increment.
// START/Sr re-enters address phase without clearing pointer. No stretching.
// Inputs must be externally pulled up; SDA output is open-drain low-enable.
// clk >= 20*SCL recommended. Avoid high-rate use without timing validation.
module i2c_reg_slave_v05(input wire clk,input wire rst_n,input wire scl,input wire sda_in,
 output wire sda_drive_low,input wire [7:0] rd_data,output wire [7:0] rd_addr,
 output reg wr_pulse,output reg [7:0] wr_addr,output reg [7:0] wr_data);
 localparam IDLE=0,RX=1,RX_ACK=2,TX=3,TX_ACK=4;
 reg [2:0] state;
 reg [2:0] scl_ff,sda_ff;
 wire rise=(scl_ff[2:1]==2'b01);
 wire fall=(scl_ff[2:1]==2'b10);
 wire start=(sda_ff[2:1]==2'b10)&&scl_ff[2];
 wire stop=(sda_ff[2:1]==2'b01)&&scl_ff[2];
 reg [2:0] bit_index;
 reg [7:0] rx_shift,tx_shift,ptr;
 reg [1:0] phase; // 0 address 1 register-pointer 2 data
 reg selected,read_mode,ack_enable,ack_driving,ack_seen,tx_released;
 reg master_ack_seen,master_acked;
 reg [7:0] received;
 assign rd_addr=ptr;
 assign sda_drive_low=(state==RX_ACK && ack_driving && ack_enable) ||
   (state==TX && !tx_shift[7]) ||
   (state==TX_ACK && !tx_released && !tx_shift[7]);
 always @(posedge clk or negedge rst_n) begin
  if(!rst_n) begin
   scl_ff<=3'b111;sda_ff<=3'b111;state<=IDLE;bit_index<=0;
   rx_shift<=0;tx_shift<=0;ptr<=0;phase<=0;selected<=0;
   read_mode<=0;ack_enable<=0;ack_driving<=0;ack_seen<=0;
   tx_released<=0;master_ack_seen<=0;master_acked<=0;received<=0;wr_pulse<=0;wr_addr<=0;wr_data<=0;
  end else begin
   scl_ff<={scl_ff[1:0],scl};sda_ff<={sda_ff[1:0],sda_in};wr_pulse<=0;
   if(start) begin
    state<=RX;phase<=0;bit_index<=0;selected<=0;
    ack_driving<=0;ack_seen<=0;tx_released<=0;master_ack_seen<=0;
   end else if(stop) begin
    state<=IDLE;ack_driving<=0;ack_seen<=0;tx_released<=0;
   end else case(state)
    IDLE: begin end
    RX: if(rise) begin
     rx_shift<={rx_shift[6:0],sda_ff[2]};
     if(bit_index==3'd7) begin
      received<={rx_shift[6:0],sda_ff[2]};bit_index<=0;
      state<=RX_ACK;ack_seen<=0;ack_driving<=0;
      if(phase==0) begin
       selected<=(rx_shift[6:0]==7'h3c);
       read_mode<=sda_ff[2];
       ack_enable<=(rx_shift[6:0]==7'h3c);
       phase<=1;
      end else if(phase==1) begin
       ptr<={rx_shift[6:0],sda_ff[2]};
       ack_enable<=selected;phase<=2;
      end else begin
       ack_enable<=selected;
       if(selected) begin
        wr_addr<=ptr;wr_data<={rx_shift[6:0],sda_ff[2]};
        wr_pulse<=1;ptr<=ptr+1'b1;
       end
      end
     end else bit_index<=bit_index+1'b1;
    end
    RX_ACK:begin
     if(fall && !ack_driving && !ack_seen) ack_driving<=1;
     if(rise && ack_driving) ack_seen<=1;
     if(fall && ack_seen) begin
      ack_driving<=0;ack_seen<=0;
      if(!ack_enable) state<=IDLE;
      else if(phase==1 && read_mode) begin
       state<=TX;bit_index<=0;tx_shift<=rd_data;
      end else begin state<=RX;bit_index<=0;end
     end
    end
    TX:begin
     if(rise) begin
      if(bit_index==3'd7) begin
       bit_index<=0;state<=TX_ACK;tx_released<=0;master_ack_seen<=0;ptr<=ptr+1'b1;
      end else bit_index<=bit_index+1'b1;
     end
     // Advance data only on falling SCL after a completed bit.
     if(fall && bit_index!=0) tx_shift<={tx_shift[6:0],1'b1};
    end
    TX_ACK:begin
     if(fall && !tx_released) tx_released<=1; // release for ninth clock
     else if(rise && tx_released && !master_ack_seen) begin
      master_ack_seen<=1;master_acked<=!sda_ff[2];
     end else if(fall && master_ack_seen) begin
      master_ack_seen<=0;tx_released<=0;
      if(!master_acked) state<=IDLE; // master NACK
      else begin state<=TX;bit_index<=0;tx_shift<=rd_data;end
     end
    end
    default:state<=IDLE;
   endcase
  end
 end
endmodule
`default_nettype wire
