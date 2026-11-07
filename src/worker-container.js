// Entry point for Cloudflare Containers. Main Educa+ worker remains unchanged.
// The Container class handles lifecycle. The token remains a Worker secret.
import { Container } from '@cloudflare/containers';
import educaWorker from './worker.js';

export class LiaKokoroContainer extends Container {
  defaultPort = 7860;
  sleepAfter = '2m';
  // Keep the secret out of Dockerfile, GitHub, and frontend code.
  envVars = {
    LIA_API_TOKEN: this.env.LIA_BACKEND_TOKEN || '',
    LIA_TTS_ENGINE: 'kokoro',
    LIA_PREWARM_VOICE: 'true',
    LIA_MUSETALK_ENABLED: 'false',
    PORT: '7860',
  };
}

export default educaWorker;
