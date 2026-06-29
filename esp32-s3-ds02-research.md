# ESP32-S3 DS-02 AI Speaker Research

Date: 2026-06-29

## Device From Photo

- Product name on box: `LOA CHATBOT AI DS-02` / `AIDS-02`.
- Seller mentioned by user: https://tandev.click/
- Same/similar listing found on Shopee from D-Solution:
  - `Loa Chatbot AI Xiaozhi Đối Thoại Trí Tuệ Nhân Tạo Học Tập Giải Trí ESP32-S3 Loa Thông Minh DS-02`
  - Listing text confirms `Xiaozhi`, `ESP32-S3`, and `DS-02`.
  - Search result showed price around 500,000 VND and high sales count, but treat marketplace metadata as volatile.
- Box claims:
  - 15 voice/model characters.
  - 2 inch LCD touch display.
  - Wi-Fi connection.
  - 600 mAh battery.
  - USB Type-C.
  - Multiple AI models.
  - Customizable character configuration.
  - Vietnamese conversation guide/video.

## Likely Firmware Ecosystem

- The device appears to be in the Xiaozhi ESP32 AI chatbot ecosystem.
- Upstream project: https://github.com/78/xiaozhi-esp32
- Project language stack: mostly C/C++ with ESP-IDF and CMake.
- Upstream features:
  - Wi-Fi networking.
  - WebSocket or MQTT + UDP communication.
  - OPUS audio codec.
  - Streaming ASR + LLM + TTS voice interaction.
  - LCD/OLED emoji display.
  - Battery display and power management.
  - Device-side MCP for controlling speaker, LED, servo, GPIO, etc.
  - ESP32-S3 support.
- Upstream recommends ESP-IDF 5.4 or newer.
- Upstream v2 firmware is not OTA-compatible with v1 partition tables; manual flashing is required when crossing v1 to v2.

## TanDev Notes

- TanDev page includes firmware/key workflow for Xiaozhi-related firmware.
- TanDev documents a paid `Bluetooth Xiaozhi` firmware acting as a Bluetooth audio bridge:
  - ESP32 receives audio from ESP32-S3 over I2S.
  - Outputs to Bluetooth speakers/headphones through A2DP.
  - Voice commands include enabling Bluetooth, scanning speakers, connecting, disconnecting, status, paired list, and deleting pairing.
- TanDev page includes actions/buttons for connecting ESP32, getting MAC, rebooting, flashing firmware, entering activation key, and activation.

## Confirmed ESP32-S3 Facts

- CPU: dual-core Xtensa LX7, up to 240 MHz.
- Wireless: 2.4 GHz Wi-Fi 802.11 b/g/n and Bluetooth LE 5.
- Typical ESP32-S3 module line supports USB Serial/JTAG and USB OTG, useful for firmware flashing/debugging over Type-C.
- Common peripherals relevant to this speaker:
  - I2S for microphone/speaker codec.
  - I2C for audio codec control and touch controller.
  - SPI/LCD interface for display.
  - ADC for battery measurement.
  - LEDC/PWM for display backlight or LEDs.
- ESP32-S3-WROOM-2 variants support 16/32 MB flash and 8/16 MB PSRAM, but the exact DS-02 module must be verified with `esptool flash-id`.

## Closest Public Hardware Clue Found

There is a GitHub discussion for an `AiKoder S3 LCD` Xiaozhi board. This may or may not match the DS-02, but it is useful as a starting hypothesis because it is also an ESP32-S3 LCD chatbot device.

Reported `AiKoder S3 LCD` details:

- Board: `aikoder-s3-lcd`
- Chip: ESP32-S3
- Flash: 8 MB in that report
- Display:
  - Driver: JD9853 over SPI
  - Resolution: 240 x 240
  - MOSI: GPIO38
  - SCK: GPIO39
  - CS: GPIO40
  - Backlight: GPIO13
- Touch:
  - Controller: CST816D over I2C
  - Address: 0x15
- Audio:
  - Codec: ES8311
  - I2C address: 0x18
  - I2C SDA: GPIO2
  - I2C SCL: GPIO1
  - I2S BCLK: GPIO17
  - I2S WS/LRCK: GPIO18
  - I2S speaker DOUT: GPIO8
  - I2S mic DIN: GPIO7
  - MCLK: GPIO16 optional
  - PA enable: GPIO3 must be high
- System:
  - Boot button: GPIO0
  - Battery ADC: GPIO9
  - Charging detect: GPIO10 optional

Do not treat this as confirmed DS-02 pinout until the board is inspected or probed.

## First Firmware Path

1. Preserve the vendor firmware before flashing anything:
   - Identify USB serial port.
   - Run `esptool.py --chip esp32s3 --port <PORT> flash-id`.
   - Dump the full flash with the detected flash size.
2. Record chip/module facts:
   - Flash size.
   - PSRAM mode/size.
   - USB mode.
   - MAC address.
   - Boot log at 115200 baud.
3. Try non-destructive identification:
   - Connect serial monitor.
   - Capture boot messages.
   - Scan I2C buses if a test firmware can safely run.
   - Compare display/touch/audio behavior against known Xiaozhi board configs.
4. Build a minimal firmware ladder:
   - Hello serial.
   - Wi-Fi scan.
   - LCD backlight/display test.
   - Touch I2C scan.
   - Audio codec I2C scan.
   - I2S speaker tone.
   - Microphone capture level meter.
   - Battery ADC read.
5. Only after backup and pinout confidence, attempt a Xiaozhi custom board port.

## Useful Links

- TanDev: https://tandev.click/
- Shopee listing found by search: https://shopee.vn/Loa-Chatbot-AI-Xiaozhi-%C4%90%E1%BB%91i-Tho%E1%BA%A1i-Tr%C3%AD-Tu%E1%BB%87-Nh%C3%A2n-T%E1%BA%A1o-H%E1%BB%8Dc-T%E1%BA%ADp-Gi%E1%BA%A3i-Tr%C3%AD-ESP32-S3-Loa-Th%C3%B4ng-Minh-DS-02-i.878485628.28175620017
- Xiaozhi ESP32 upstream: https://github.com/78/xiaozhi-esp32
- ESP32-S3-WROOM-2 datasheet: https://www.espressif.com/sites/default/files/documentation/esp32-s3-wroom-2_datasheet_en.pdf
- AiKoder S3 LCD hardware discussion: https://github.com/78/xiaozhi-esp32/discussions/1371
- DS-02 setup video found by search: https://www.youtube.com/watch?v=enut6GI_D9k
- DS-02 upgrade/showcase video found by search: https://www.youtube.com/watch?v=vzQ7WI7dNZY
