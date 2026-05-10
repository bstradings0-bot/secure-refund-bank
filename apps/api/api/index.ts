import serverless from 'serverless-http';
import { app } from '../src/server';

// Wrap Express app with serverless-http for Vercel
export const handler = serverless(app);
