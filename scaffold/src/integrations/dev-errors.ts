/**
 * Astro integration that exposes compilation errors via HTTP endpoint.
 * This allows the agent to poll for errors instead of running manual builds.
 *
 * Endpoint: GET /__dev-errors
 * Response: { errors: ErrorInfo[], hasErrors: boolean, timestamp: number }
 */

import type { AstroIntegration } from 'astro';
import type { IncomingMessage, ServerResponse } from 'node:http';

interface ErrorInfo {
  message: string;
  file?: string;
  line?: number;
  column?: number;
  frame?: string;
  stack?: string;
  timestamp: number;
}

interface ErrorState {
  errors: ErrorInfo[];
  lastUpdate: number;
}

export function devErrors(): AstroIntegration {
  // Store current errors - cleared on successful HMR updates
  const state: ErrorState = {
    errors: [],
    lastUpdate: Date.now(),
  };

  return {
    name: 'dev-errors',
    hooks: {
      'astro:server:setup': ({ server, logger }) => {
        // Add middleware to expose errors endpoint
        server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
          if (req.url === '/__dev-errors') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({
              errors: state.errors,
              hasErrors: state.errors.length > 0,
              timestamp: state.lastUpdate,
            }));
            return;
          }
          next();
        });

        // Hook into Vite's WebSocket to capture errors
        const originalSend = server.ws.send.bind(server.ws);
        server.ws.send = (payload: unknown) => {
          if (typeof payload === 'object' && payload !== null) {
            const msg = payload as { type?: string; err?: { message?: string; stack?: string; id?: string; frame?: string; loc?: { file?: string; line?: number; column?: number } } };

            if (msg.type === 'error' && msg.err) {
              const err = msg.err;
              const errorInfo: ErrorInfo = {
                message: err.message || 'Unknown error',
                file: err.loc?.file || err.id,
                line: err.loc?.line,
                column: err.loc?.column,
                frame: err.frame,
                stack: err.stack,
                timestamp: Date.now(),
              };

              // Add to error list (keep last 10 errors)
              state.errors.unshift(errorInfo);
              if (state.errors.length > 10) {
                state.errors.pop();
              }
              state.lastUpdate = Date.now();

              logger.error(`[dev-errors] Captured: ${errorInfo.message}`);
            }

            // Clear errors on successful update
            if (msg.type === 'update' || msg.type === 'full-reload') {
              if (state.errors.length > 0) {
                logger.info('[dev-errors] Errors cleared after successful update');
                state.errors = [];
                state.lastUpdate = Date.now();
              }
            }
          }

          return originalSend(payload);
        };

        // Also listen for connection errors
        server.ws.on('error', (err: Error) => {
          const errorInfo: ErrorInfo = {
            message: err.message,
            stack: err.stack,
            timestamp: Date.now(),
          };
          state.errors.unshift(errorInfo);
          if (state.errors.length > 10) {
            state.errors.pop();
          }
          state.lastUpdate = Date.now();
        });

        logger.info('[dev-errors] Error tracking enabled at /__dev-errors');
      },
    },
  };
}

export default devErrors;
