import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

/**
 * Initializes error logging.
 */
export function initErrorLogging() {
  // Used for remote error reporting
  // https://sentry.io/organizations/decent-mg/issues/
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
    integrations: [new BrowserTracing()],

    // Setting tracesSampleRate to 1.0 captures 100%
    // of sentry transactions for performance monitoring.
    tracesSampleRate: 1.0,

    debug: process.env.NODE_ENV !== 'production',
  });
}

/**
 * Sets the wallet address of the currently connected wallet,
 * in order to add more context to Sentry events.
 * Pass `null` to unset the current wallet.
 * @param walletAddress the wallet address of the currently connected wallet
 */
export function setLoggedWallet(walletAddress: string | null) {
  // don't track wallet addresses in production
  if (process.env.NODE_ENV === 'production') return;
  if (!walletAddress) {
    Sentry.setUser(null);
  } else {
    Sentry.setUser({
      id: walletAddress,
    });
  }
}

/**
 * Adds arbitrary context parameters, which are indexed/searchable
 * on Sentry event logging.
 * @param key the context key
 * @param value the context value
 */
export function setErrorContext(key: string, value: string) {
  Sentry.setTag(key, value);
}

/**
 * Clears any additional context that has been added to currently logging
 * Sentry events.
 */
export function clearErrorContext() {
  Sentry.setTags({});
  setLoggedWallet(null);
}

/**
 * Logs an error to Sentry and the console.
 * @param error the error to log. Strings are logged on Sentry as "messages", anything
 * else is logged as an exception.
 */
export function logError(error: any, ...optionalParams: any[]) {
  if (typeof error === 'string' || error instanceof String) {
    Sentry.captureMessage(error + ': ' + optionalParams);
  } else {
    Sentry.captureException(error);
  }
  console.error(error, optionalParams);
}

/**
 * Extension of Sentry's ErrorBoundary class which simply logs the error to
 * console as well.
 */
export class FractalErrorBoundary extends Sentry.ErrorBoundary {
  componentDidCatch(
    error: Error & {
      cause?: Error;
    },
    errorInfo: React.ErrorInfo
  ) {
    super.componentDidCatch(error, errorInfo);
    console.error(error, errorInfo);
  }
}
