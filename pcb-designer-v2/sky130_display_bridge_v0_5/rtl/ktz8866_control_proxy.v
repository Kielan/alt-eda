`default_nettype none
// This is NOT a KTZ8866 replacement. It drives abstract enable/PWM pins.
// The real driver has analog boost, bias, I2C/pin features and protections.
module ktz8866_control_proxy(input wire clk,input wire rst_n,
 input wire permit,input wire [7:0] brightness,
 output wire led_enable,output wire led_pwm,
 output reg [7:0] pwm_phase);
 always @(posedge clk or negedge rst_n) begin
  if(!rst_n) pwm_phase<=0;
  else pwm_phase<=pwm_phase+8'd1;
 end
 assign led_enable=permit && (brightness!=0);
 assign led_pwm=led_enable && (pwm_phase<brightness);
endmodule
`default_nettype wire
