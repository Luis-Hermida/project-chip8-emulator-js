// Chip-8 specifications
/* 
- 4KB (4096 bytes) of memory
- 16 8-bit registers
- A 16-bit register (this.i) to store memory addresses
- Two timers. One for the delay, and one for the sound.
- A program counter that stores the address currently being executed
- An array to represent the stack
- Variable that stores whether the emulator is paused or not
- Variable that stores the execution speed of the emulator
*/

export default class CPU {
  constructor(renderer, keyboard, speaker) {
    this.renderer = renderer;
    this.keyboard = keyboard;
    this.speaker = speaker;

    // 4KB (4096 bytes) of memory
    this.memory = new Uint8Array(4096);

    // 16 8-bit registers
    this.v = new Uint8Array(16);

    // Single 16-bit register to store memory addresses
    // Set this to 0 since we aren't storing anything at initialization.
    this.i = 0;

    // Timers
    this.delayTimer = 0;
    this.soundTimer = 0;

    // Program counter. Stores the currently executing address.
    this.pc = 0x200;

    // Don't initialize this with a size in order to avoid empty results.
    this.stack = new Array();

    // Variables
    this.paused = false;
    this.speed = 10;
  }
}
