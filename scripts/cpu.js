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

  loadSpritesIntoMemory() {
    // Array of hex values for each sprite. Each sprite is 5 bytes.
    // The technical reference provides us with each one of these values.
    // prettier-ignore
    const sprites = [
        0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
        0x20, 0x60, 0x20, 0x20, 0x70, // 1
        0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
        0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
        0x90, 0x90, 0xF0, 0x10, 0x10, // 4
        0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
        0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
        0xF0, 0x10, 0x20, 0x40, 0x40, // 7
        0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
        0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
        0xF0, 0x90, 0xF0, 0x90, 0x90, // A
        0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
        0xF0, 0x80, 0x80, 0x80, 0xF0, // C
        0xE0, 0x90, 0x90, 0x90, 0xE0, // D
        0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
        0xF0, 0x80, 0xF0, 0x80, 0x80  // F
    ];

    // According to the technical reference, sprites are stored in the interpreter section of memory starting at hex 0x000
    // From 0 to 79 of all 4096 memory space is used for the sprites using bytes values.
    for (let i = 0; i < sprites.length; i++) {
      this.memory[i] = sprites[i];
    }
  }

  // Chip-8 programs start at location 0x200, so we start loading the program into that memory and upwards.
  loadProgramIntoMemory(program) {
    for (let loc = 0; loc < program.length; loc++) {
      this.memory[0x200 + loc] = program[loc];
    }
  }

  // We make an HTTP request and retrieve a file.
  loadRom(romName) {
    var request = new XMLHttpRequest();
    var self = this;

    // Handles the response received from sending (request.send()) our request
    request.onload = function () {
      // If the request response has content
      if (request.response) {
        // Store the contents of the response in an 8-bit array
        let program = new Uint8Array(request.response);

        // Load the ROM/program into memory
        self.loadProgramIntoMemory(program);
      }
    };

    // Initialize a GET request to retrieve the ROM from our roms folder
    request.open("GET", "roms/" + romName);
    request.responseType = "arraybuffer";

    // Send the GET request
    request.send();
  }

  cycle() {
    for (let i = 0; i < this.speed; i++) {
      if (!this.paused) {
        // Each instruction is 16 bits (2 bytes) but our memory is made up of 8 bit (1 byte) pieces.
        // But you can't just combine two, 1-byte values to get a 2-byte value. To properly do this, we need to shift the first piece of memory.

        /* Example
        this.memory[this.pc] = PC = 0x10
        this.memory[this.pc + 1] = PC + 1 = 0xF0

        this.memory[this.pc] << 8 = 0x1000
        0x1000 | 0xF0 = 0x10F0
        */
        let opcode = (this.memory[this.pc] << 8) | this.memory[this.pc + 1];
        this.executeInstruction(opcode);
      }

      if (!this.paused) {
        this.updateTimers();
      }

      this.playSound();
      this.renderer.render();
    }
  }

  // The delay timer is active whenever the delay timer register (DT) is non-zero.
  // This timer does nothing more than subtract 1 from the value of DT at a rate of 60Hz. When DT reaches 0, it deactivates.

  // The sound timer is active whenever the sound timer register (ST) is non-zero. This timer also decrements at a rate of 60Hz,
  // however, as long as ST's value is greater than zero, the Chip-8 buzzer will sound. When ST reaches zero, the sound timer deactivates.
  updateTimers() {
    if (this.delayTimer > 0) {
      this.delayTimer -= 1;
    }

    if (this.soundTimer > 0) {
      this.soundTimer -= 1;
    }
  }

  playSound() {
    if (this.soundTimer > 0) {
      this.speaker.playSound(440);
    } else {
      this.speaker.stop();
    }
  }

  /*
  Variables: 
  nnn or addr - A 12-bit value, the lowest 12 bits of the instruction
  n or nibble - A 4-bit value, the lowest 4 bits of the instruction
  x - A 4-bit value, the lower 4 bits of the high byte of the instruction
  y - A 4-bit value, the upper 4 bits of the low byte of the instruction
  kk or byte - An 8-bit value, the lowest 8 bits of the instruction
  */
  executeInstruction(opcode) {
    // Increment the program counter to prepare it for the next instruction.
    // Each instruction is 2 bytes long, so increment it by 2.
    this.pc += 2;

    // We only need the 2nd nibble, so grab the value of the 2nd nibble
    // and shift it right 8 bits to get rid of everything but that 2nd nibble.
    // 0x5460 & 0x0F00 = 0x0400 >> 8 = 0x04
    let x = (opcode & 0x0f00) >> 8;

    // We only need the 3rd nibble, so grab the value of the 3rd nibble
    // and shift it right 4 bits to get rid of everything but that 3rd nibble.
    // 0x5460 & 0x00F0 = 0x060 >> 8 = 0x006
    let y = (opcode & 0x00f0) >> 4;

    // We take the 1st nibble of each instruction because it's the most significant value
    switch (opcode & 0xf000) {
      case 0x0000:
        // 0x0nnn This instruction is only used on the old computers on which Chip-8 was originally implemented. It is ignored by modern interpreters.
        switch (opcode) {
          case 0x00e0:
            // Clear the display
            this.renderer.clear();
            break;
          case 0x00ee:
            // Return from a subroutine.
            // The interpreter sets the program counter to the address at the top of the stack, then subtracts 1 from the stack pointer.
            this.pc = this.stack.pop();
            break;
        }
        break;
      case 0x1000:
        // Jump to location nnn.
        // The interpreter sets the program counter to nnn.
        this.pc = opcode & 0xfff;
        break;
      case 0x2000:
        // Call subroutine at nnn.
        // The interpreter increments the stack pointer, then puts the current PC on the top of the stack. The PC is then set to nnn.
        // ! - We don't use a stack pointer we have an array to handle it.
        this.stack.push(this.pc);
        this.pc = opcode & 0xfff;
        break;
      case 0x3000:
        // Skip next instruction if Vx = kk.
        // The interpreter compares register Vx to kk, and if they are equal, increments the program counter by 2.

        // prettier-ignore
        if (this.v[x] === (opcode & 0xff)) {
          this.pc += 2;
        }
        break;
      case 0x4000:
        // Skip next instruction if Vx != kk.
        // The interpreter compares register Vx to kk, and if they are not equal, increments the program counter by 2.

        // prettier-ignore
        if (this.v[x] !== (opcode & 0xff)) {
          this.pc += 2;
        }
        break;
      case 0x5000:
        // Skip next instruction if Vx = Vy.
        // The interpreter compares register Vx to register Vy, and if they are equal, increments the program counter by 2.
        if (this.v[x] === this.v[y]) {
          this.pc += 2;
        }
        break;
      case 0x6000:
        // Set Vx = kk.
        // The interpreter puts the value kk into register Vx.
        this.v[x] = opcode & 0xff;
        break;
      case 0x7000:
        // Set Vx = Vx + kk.
        // Adds the value kk to the value of register Vx, then stores the result in Vx.
        this.v[x] += opcode & 0xff;
        break;
      case 0x8000:
        switch (opcode & 0xf) {
          case 0x0:
            //Set Vx = Vy.
            // Stores the value of register Vy in register Vx.
            this.v[x] = this.v[y];
            break;
          case 0x1:
            // Set Vx = Vx OR Vy.
            // Performs a bitwise OR on the values of Vx and Vy, then stores the result in Vx.
            // A bitwise OR compares the corrseponding bits from two values, and if either bit is 1, then the same bit in the result is also 1. Otherwise, it is 0.
            this.v[x] |= this.v[y];
            break;
          case 0x2:
            // Set Vx = Vx AND Vy.
            // Performs a bitwise AND on the values of Vx and Vy, then stores the result in Vx.
            // A bitwise AND compares the corrseponding bits from two values, and if both bits are 1, then the same bit in the result is also 1. Otherwise, it is 0.
            this.v[x] &= this.v[y];
            break;
          case 0x3:
            // Set Vx = Vx XOR Vy.
            // Performs a bitwise exclusive OR on the values of Vx and Vy, then stores the result in Vx.
            // An exclusive OR compares the corrseponding bits from two values, and if the bits are not both the same, then the corresponding bit in the result is set to 1. Otherwise, it is 0.
            this.v[x] ^= this.v[y];
            break;
          case 0x4:
            // Set Vx = Vx + Vy, set VF = carry.
            // The values of Vx and Vy are added together.
            // If the result is greater than 8 bits (i.e., > 255,) VF is set to 1, otherwise 0. Only the lowest 8 bits of the result are kept, and stored in Vx.
            let sum = (this.v[x] += this.v[y]);
            this.v[0xf] = 0;
            if (sum > 0xff) this.v[0xf] = 1;
            this.v[x] = sum;
            break;
          case 0x5:
            // Set Vx = Vx - Vy, set VF = NOT borrow.
            // If Vx > Vy, then VF is set to 1, otherwise 0. Then Vy is subtracted from Vx, and the results stored in Vx.
            this.v[0xf] = 0;
            if (this.v[x] > this.v[y]) this.v[0xf] = 1;
            this.v[x] -= this.v[y];
            break;
          case 0x6:
            // Set Vx = Vx SHR 1.
            // If the least-significant bit of Vx is 1, then VF is set to 1, otherwise 0. Then Vx is divided by 2.
            // 0x1 == 0001
            this.v[0xf] = this.v[x] & 0x1;
            this.v[x] >>= 1;
            break;
          case 0x7:
            //Set Vx = Vy - Vx, set VF = NOT borrow.
            //If Vy > Vx, then VF is set to 1, otherwise 0. Then Vx is subtracted from Vy, and the results stored in Vx.
            this.v[0xf] = 0;
            if (this.v[y] > this.v[x]) this.v[0xf] = 1;
            this.v[x] = this.v[y] - this.v[x];
            break;
          case 0xe:
            // Set Vx = Vx SHL 1.
            // If the most-significant bit of Vx is 1, then VF is set to 1, otherwise to 0. Then Vx is multiplied by 2.
            // 0x80 === 10000000
            this.v[0xf] = this.v[x] & 0x80;
            this.v[x] <<= 1;
            break;
        }
        break;
      case 0x9000:
        // Skip next instruction if Vx != Vy.
        // The values of Vx and Vy are compared, and if they are not equal, the program counter is increased by 2.
        if (this.v[x] !== this.v[y]) this.pc += 2;
        break;
      case 0xa000:
        // Set I = nnn.
        // The value of register I is set to nnn.
        this.i = opcode & 0xfff;
        break;
      case 0xb000:
        // Jump to location nnn + V0.
        // The program counter is set to nnn plus the value of V0.
        this.pc = (opcode & 0xfff) + this.v[0];
        break;
      case 0xc000:
        // Set Vx = random byte AND kk.
        // The interpreter generates a random number from 0 to 255, which is then ANDed with the value kk.
        // The results are stored in Vx.
        let rand = Math.floor(Math.random() * 0xff);
        this.v[x] = rand & (opcode & 0xff);
        break;
      case 0xd000:
        // ??
        // Display n-byte sprite starting at memory location I at (Vx, Vy), set VF = collision.

        // The interpreter reads n bytes from memory, starting at the address stored in I.
        // These bytes are then displayed as sprites on screen at coordinates (Vx, Vy).
        // Sprites are XORed onto the existing screen.
        // If this causes any pixels to be erased, VF is set to 1, otherwise it is set to 0.
        // If the sprite is positioned so part of it is outside the coordinates of the display,
        // it wraps around to the opposite side of the screen.
        let width = 8; // Each sprite is 8 pixesl width
        let height = opcode & 0xf;

        this.v[0xf] = 0;

        for (let row = 0; row < height; row++) {
          let sprite = this.memory[this.i + row];

          for (let col = 0; col < width; col++) {
            // If the bit (sprite) is not 0, render/erase the pixel
            if ((sprite & 0x80) > 0) {
              // If setPixel returns 1, which means a pixel was erased, set VF to 1
              if (this.renderer.setPixel(this.v[x] + col, this.v[y] + row)) {
                this.v[0xf] = 1;
              }
            }

            // Shift the sprite left 1. This will move the next next col/bit of the sprite into the first position.
            // Ex. 10010000 << 1 will become 0010000
            sprite <<= 1;
          }
        }
        break;
      case 0xe000:
        switch (opcode & 0xff) {
          case 0x9e:
            // Checks the keyboard, and if the key corresponding to the value of Vx is currently in the down position, PC is increased by 2.
            // Skip next instruction if key with the value of Vx is pressed.
            if (this.keyboard.isKeyPressed(this.v[x])) this.pc += 2;
            break;
          case 0xa1:
            // Skip next instruction if key with the value of Vx is not pressed.
            // Checks the keyboard, and if the key corresponding to the value of Vx is currently in the up position, PC is increased by 2.
            if (!this.keyboard.isKeyPressed(this.v[x])) this.pc += 2;
            break;
        }
        break;
      case 0xf000:
        switch (opcode & 0xff) {
          case 0x07:
            // Set Vx = delay timer value.
            // The value of DT is placed into Vx.
            this.v[x] = this.delayTimer;
            break;
          case 0x0a:
            // Wait for a key press, store the value of the key in Vx.
            // All execution stops until a key is pressed, then the value of that key is stored in Vx.
            this.paused = true;

            this.keyboard.onNextKeyPress = function (key) {
              this.v[x] = key;
              this.paused = false;
            }.bind(this);
            break;
          case 0x15:
            // Set delay timer = Vx.
            // DT is set equal to the value of Vx.
            this.delayTimer = this.v[x];
            break;
          case 0x18:
            // Set sound timer = Vx.
            // ST is set equal to the value of Vx.
            this.soundTimer = this.v[x];
            break;
          case 0x1e:
            // Set I = I + Vx.
            // The values of I and Vx are added, and the results are stored in I.
            this.i += this.v[x];
            break;
          case 0x29:
            // Set I = location of sprite for digit Vx.
            // The value of I is set to the location for the hexadecimal sprite corresponding to the value of Vx.
            this.i = this.v[x] * 5;
            break;
          case 0x33:
            // Store BCD representation of Vx in memory locations I, I+1, and I+2.

            // The interpreter takes the decimal value of Vx, and places the hundreds digit in memory at location in I,
            // the tens digit at location I+1, and the ones digit at location I+2.

            // Get the hundreds digit and place it in I.
            this.memory[this.i] = parseInt(this.v[x] / 100);

            // Get tens digit and place it in I+1. Gets a value between 0 and 99,
            // then divides by 10 to give us a value between 0 and 9.
            this.memory[this.i + 1] = parseInt((this.v[x] % 100) / 10);

            // Get the value of the ones (last) digit and place it in I+2.
            this.memory[this.i + 2] = parseInt(this.v[x] % 10);
            break;
          case 0x55:
            // Store registers V0 through Vx in memory starting at location I.
            // The interpreter copies the values of registers V0 through Vx into memory, starting at the address in I.
            for (let registerIndex = 0; registerIndex <= x; registerIndex++) {
              this.memory[this.i + registerIndex] = this.v[registerIndex];
            }
            break;
          case 0x65:
            // Read registers V0 through Vx from memory starting at location I.
            // The interpreter reads values from memory starting at location I into registers V0 through Vx.
            for (let registerIndex = 0; registerIndex <= x; registerIndex++) {
              this.v[registerIndex] = this.memory[this.i + registerIndex];
            }
            break;
        }
        break;
      default:
        throw new Error("Unknown opcode " + opcode);
    }
  }
}
