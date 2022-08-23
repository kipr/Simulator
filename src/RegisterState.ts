export default {
  WALLABY_SPI_VERSION: 4,

  /* READ Only Registers ----------------------- */
  REG_R_START:  0,

  // SHAREDARRAYBUFFER PADDING (1 BYTE)

  REG_R_VERSION_H:      1,
  REG_R_VERSION_L:      2,



  /* READ/Write Registers ----------------------- */
  REG_RW_DIG_IN_H:    3,
  REG_RW_DIG_IN_L:    4,
  REG_RW_DIG_OUT_H:   5,
  REG_RW_DIG_OUT_L:   6,
  REG_RW_DIG_PE_H:    7,
  REG_RW_DIG_PE_L:    8,
  REG_RW_DIG_OE_H:    9,
  REG_RW_DIG_OE_L:    10,

  REG_RW_ADC_0_H:     11,
  REG_RW_ADC_0_L:     12,
  REG_RW_ADC_1_H:     13,
  REG_RW_ADC_1_L:     14,
  REG_RW_ADC_2_H:     15,
  REG_RW_ADC_2_L:     16,
  REG_RW_ADC_3_H:     17,
  REG_RW_ADC_3_L:     18,
  REG_RW_ADC_4_H:     19,
  REG_RW_ADC_4_L:     20,
  REG_RW_ADC_5_H:     21,
  REG_RW_ADC_5_L:     22,
  REG_RW_ADC_PE:      23,// low 6 bits used

  // SHAREDARRAYBUFFER PADDING (1 BYTE)

  REG_RW_MAG_X_H:     24,
  REG_RW_MAG_X_L:     25,
  REG_RW_MAG_Y_H:     26,
  REG_RW_MAG_Y_L:     27,
  REG_RW_MAG_Z_H:     28,
  REG_RW_MAG_Z_L:     29,

  REG_RW_ACCEL_X_H:   30,
  REG_RW_ACCEL_X_L:   31,
  REG_RW_ACCEL_Y_H:   32,
  REG_RW_ACCEL_Y_L:   33,
  REG_RW_ACCEL_Z_H:   34,
  REG_RW_ACCEL_Z_L:   35,

  REG_RW_GYRO_X_H:    36,
  REG_RW_GYRO_X_L:    37,
  REG_RW_GYRO_Y_H:    38,
  REG_RW_GYRO_Y_L:    39,
  REG_RW_GYRO_Z_H:    40,
  REG_RW_GYRO_Z_L:    41,
  // Motor 0 position
  REG_RW_MOT_0_B3:    42,
  REG_RW_MOT_0_B2:    43,
  REG_RW_MOT_0_B1:    44,
  REG_RW_MOT_0_B0:    45,

  // Motor 1 position
  REG_RW_MOT_1_B3:    46,
  REG_Rw_MOT_1_B2:    47,
  REG_Rw_MOT_1_B1:    48,
  REG_RW_MOT_1_B0:    49,

  // Motor 2 position
  REG_RW_MOT_2_B3:    50,
  REG_RW_MOT_2_B2:    51,
  REG_RW_MOT_2_B1:    52,
  REG_RW_MOT_2_B0:    53,

  // Motor 3 position
  REG_RW_MOT_3_B3:    54,
  REG_RW_MOT_3_B2:    55,
  REG_RW_MOT_3_B1:    56,
  REG_RW_MOT_3_B0:    57,

  REG_RW_MOT_MODES:   58,  //   Normal PWM, MTP, MAV, MRP, 2 bits per motor
  REG_RW_MOT_DIRS:    59,  //   IDLE, FORWARD, REVERSE, BREAK, 2 bits per motor
  REG_RW_MOT_DONE:    60,  //   4 lowest bit used:   0000 (chan0) (chan1) (chan2) (chan3)
  REG_RW_MOT_SRV_ALLSTOP: 61, //  2nd lowest bit is motor all stop, lowest bit is servo allstop

  // 16 bit signed speed goals
  REG_RW_MOT_0_SP_H:  62,
  REG_RW_MOT_0_SP_L:  63,
  REG_RW_MOT_1_SP_H:  64,
  REG_RW_MOT_1_SP_L:  65,
  REG_RW_MOT_2_SP_H:  66,
  REG_RW_MOT_2_SP_L:  67,
  REG_RW_MOT_3_SP_H:  68,
  REG_RW_MOT_3_SP_L:  69,

  // 16 bit unsigned pwms, from the user or PID controller
  REG_RW_MOT_0_PWM_H:  70,
  REG_RW_MOT_0_PWM_L:  71,
  REG_RW_MOT_1_PWM_H:  72,
  REG_RW_MOT_1_PWM_L:  73,
  REG_RW_MOT_2_PWM_H:  74,
  REG_RW_MOT_2_PWM_L:  75,
  REG_RW_MOT_3_PWM_H:  76,
  REG_RW_MOT_3_PWM_L:  77,

  // 16 bit unsigned servo goals
  // microsecond servo pulse, where 1500 is neutral
  // +/- about 10 per degree from neutral
  REG_RW_SERVO_0_H:   78,
  REG_RW_SERVO_0_L:   79,
  REG_RW_SERVO_1_H:   80,
  REG_RW_SERVO_1_L:   81,
  REG_RW_SERVO_2_H:   82,
  REG_RW_SERVO_2_L:   83,
  REG_RW_SERVO_3_H:   84,
  REG_RW_SERVO_3_L:   85,

  // 12 bit unsigned int adc result
  REG_RW_BATT_H:      86,
  REG_RW_BATT_L:      87,

  // msb is "extra show", then a non used bit
  // then 6 virtual button bits
  // E x 5 4 3 2 1 0
  REG_RW_BUTTONS: 88,

  REG_READABLE_COUNT: 89,

  // SHAREDARRAYBUFFER PADDING (1 BYTE)



  // WRITE ONLY Registers---------------------------------------------------------
  REG_W_PID_0_P_H:    89,
  REG_W_PID_0_P_L:    90,
  REG_W_PID_0_PD_H:   91,
  REG_W_PID_0_PD_L:   92,
  REG_W_PID_0_I_H:    93,
  REG_W_PID_0_I_L:    94,
  REG_W_PID_0_ID_H:   95,
  REG_W_PID_0_ID_L:   96,
  REG_W_PID_0_D_H:    97,
  REG_W_PID_0_D_L:    98,
  REG_W_PID_0_DD_H:   99,
  REG_W_PID_0_DD_L:  100,
  REG_W_PID_1_P_H:    101,
  REG_W_PID_1_P_L:    102,
  REG_W_PID_1_PD_H:   103,
  REG_W_PID_1_PD_L:   104,
  REG_W_PID_1_I_H:    105,
  REG_W_PID_1_I_L:    106,
  REG_W_PID_1_ID_H:   107,
  REG_W_PID_1_ID_L:  108,
  REG_W_PID_1_D_H:    119,
  REG_W_PID_1_D_L:    110,
  REG_W_PID_1_DD_H:   111,
  REG_W_PID_1_DD_L:   112,
  REG_W_PID_2_P_H:    113,
  REG_W_PID_2_P_L:    114,
  REG_W_PID_2_PD_H:   115,
  REG_W_PID_2_PD_L:   116,
  REG_W_PID_2_I_H:    117,
  REG_W_PID_2_I_L:    118,
  REG_W_PID_2_ID_H:   119,
  REG_W_PID_2_ID_L:   120,
  REG_W_PID_2_D_H:    121,
  REG_W_PID_2_D_L:    122,
  REG_W_PID_2_DD_H:   123,
  REG_W_PID_2_DD_L:   124,

  REG_W_PID_3_P_H:    125,
  REG_W_PID_3_P_L:    126,
  REG_W_PID_3_PD_H:   127,
  REG_W_PID_3_PD_L:   128,
  REG_W_PID_3_I_H:    129,
  REG_W_PID_3_I_L:    130,
  REG_W_PID_3_ID_H:   131,
  REG_W_PID_3_ID_L:   132,
  REG_W_PID_3_D_H:    133,
  REG_W_PID_3_D_L:    134,
  REG_W_PID_3_DD_H:  135,
  REG_W_PID_3_DD_L:   136,

  // Motor 0 position goal
  REG_W_MOT_0_GOAL_B3:    137,
  REG_W_MOT_0_GOAL_B2:    138,
  REG_W_MOT_0_GOAL_B1:    139,
  REG_W_MOT_0_GOAL_B0:    140,

  // Motor 1 position goal
  REG_W_MOT_1_GOAL_B3:    141,
  REG_w_MOT_1_GOAL_B2:    142,
  REG_w_MOT_1_GOAL_B1:    143,
  REG_W_MOT_1_GOAL_B0:    144,

  // Motor 2 position goal
  REG_W_MOT_2_GOAL_B3:    145,
  REG_W_MOT_2_GOAL_B2:    146,
  REG_W_MOT_2_GOAL_B1:    147,
  REG_W_MOT_2_GOAL_B0:    148,

  // Motor 3 position goal
  REG_W_MOT_3_GOAL_B3:    149,
  REG_W_MOT_3_GOAL_B2:    150,
  REG_W_MOT_3_GOAL_B1:    151,
  REG_W_MOT_3_GOAL_B0:    152,

  REG_ALL_COUNT:      153
};

export const MotorControlMode = {
  Inactive: 0,
  Speed: 1,
  Position: 2,
  SpeedPosition: 3,
} as const;
