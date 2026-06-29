# Hardware Learning Notes

Firmware and hardware learning material, currently focused on ESP32-S3 firmware fundamentals and a safe DS-02 learning path.

## Firmware 101

Open the lesson index:

```text
firmware-101-wiki.html
```

Each lesson is also available as its own page:

```text
firmware-101/lesson-0.html
firmware-101/lesson-1.html
...
firmware-101/lesson-11.html
```

## Local Server

The static pages work without a build step. To enable the floating lesson chat, run the local server so `/v1/*` proxies to the Pi agent gateway:

```bash
HOST=127.0.0.1 PORT=8766 GATEWAY_ORIGIN=http://127.0.0.1:9137 node firmware-101-server.mjs
```

The Pi agent gateway is expected to expose an OpenAI-compatible API:

```text
GET /v1/models
POST /v1/chat/completions
POST /v1/voice/messages
GET /v1/voice/audio/:id.mp3
```

Text questions use `/v1/chat/completions`. Voice questions use the local-first
pipeline in `pi-agents-gateway`: browser audio upload, `whisper-cli` STT,
Pi text answer, macOS `say` TTS, then an MP3 response.

## Tailnet Preview

On the current machine, Tailscale Serve can proxy HTTPS root to the local server:

```text
https://nams-mac-mini-2.tail15870.ts.net -> http://127.0.0.1:8766
```

The chat widget calls same-origin `/v1/*`, so the server proxy avoids mobile browser CORS and mixed-content issues.
