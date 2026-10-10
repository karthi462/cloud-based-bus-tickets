import app from './app.js';
import { CONFIG } from './config/constants.js';

const PORT = CONFIG.PORT;

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚌 CloudBus API Server running on http://localhost:${PORT}`);
  console.log(`📡 Mode: ${CONFIG.USE_DYNAMODB ? 'AWS DynamoDB Cloud Mode' : 'Local Persistent Storage Mode'}`);
  console.log(`🔐 WebAuthn RP_ID: ${CONFIG.RP_ID} | Origin: ${CONFIG.ORIGIN}`);
  console.log(`⚡ Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
