import serverless from 'serverless-http';
import app from '../app.js';

// AWS Lambda entry handler for Amazon API Gateway proxy integration
export const handler = serverless(app);
