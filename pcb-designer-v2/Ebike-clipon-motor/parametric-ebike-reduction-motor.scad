////////////////////////////////////////////////////////////
// PARAMETRIC EBIKE REDUCTION MOTOR
////////////////////////////////////////////////////////////

$fn=120;

//---------------------------------------------------------
// PARAMETERS
//---------------------------------------------------------

motor_d = 90;
motor_len = 85;

pinion_d = 45;
pinion_w = 8;

ringgear_d = 170;
ringgear_id = 120;
ringgear_w = 20;

rotor_d = 203;
rotor_w = 2;

mount_th = 10;

tension_arm_len = 75;
tension_arm_w = 18;
tension_arm_th = 8;

pulley_d = 28;

//---------------------------------------------------------
// MOTOR
//---------------------------------------------------------

module motor_body()
{
    rotate([0,90,0])
    cylinder(
        d=motor_d,
        h=motor_len
    );
}

//---------------------------------------------------------
// PINION
//---------------------------------------------------------

module pinion()
{
    cylinder(
        d=pinion_d,
        h=pinion_w
    );
}

//---------------------------------------------------------
// LARGE GEAR
//---------------------------------------------------------

module ringgear()
{
    difference()
    {
        cylinder(
            d=ringgear_d,
            h=ringgear_w
        );

        translate([0,0,-1])
        cylinder(
            d=ringgear_id,
            h=ringgear_w+2
        );
    }
}

//---------------------------------------------------------
// BRAKE ROTOR
//---------------------------------------------------------

module brake_rotor()
{
    difference()
    {
        cylinder(
            d=rotor_d,
            h=rotor_w
        );

        cylinder(
            d=150,
            h=rotor_w+1
        );

        for(a=[0:12:360])
        {
            rotate([0,0,a])
            translate([85,0,-1])
            cylinder(
                d=4,
                h=rotor_w+2
            );
        }
    }
}

//---------------------------------------------------------
// MOUNT BRACKET
//---------------------------------------------------------

module bracket()
{
    linear_extrude(height=mount_th)
    polygon(
    [
        [-50,-20],
        [-10,60],
        [30,50],
        [50,-20]
    ]);
}

//---------------------------------------------------------
// TENSIONER LEVER
//---------------------------------------------------------

module tensioner()
{
    union()
    {
        hull()
        {
            cylinder(
                d=tension_arm_w,
                h=tension_arm_th
            );

            translate([tension_arm_len,0,0])
            cylinder(
                d=tension_arm_w,
                h=tension_arm_th
            );
        }

        translate([tension_arm_len,0,0])
        cylinder(
            d=pulley_d,
            h=12
        );
    }
}

//---------------------------------------------------------
// ASSEMBLY
//---------------------------------------------------------

module assembly()
{
    motor_body();

    translate([20,-70,0])
    rotate([90,0,0])
    pinion();

    translate([20,-140,0])
    rotate([90,0,0])
    ringgear();

    translate([20,-140,22])
    rotate([90,0,0])
    brake_rotor();

    translate([15,-80,-50])
    rotate([90,0,0])
    bracket();

    translate([65,-50,-30])
    rotate([0,0,-60])
    tensioner();
}

assembly();
