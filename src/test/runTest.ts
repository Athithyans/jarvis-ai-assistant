import * as path from 'path';
import * as fs from 'fs';
import { runTests } from '@vscode/test-electron';

// Simple logger that writes to a file instead of using console
function log(message: string): void {
  const logPath = path.resolve(__dirname, '../../test-logs.txt');
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;

  // Append to log file
  fs.appendFileSync(logPath, logMessage, { encoding: 'utf8' });
}

async function main(): Promise<void> {
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');

    // The path to the extension test script
    // Passed to --extensionTestsPath
    const extensionTestsPath = path.resolve(__dirname, './suite/index');

    // Check if running in CI environment
    const isCI = process.env.CI === 'true';

    // Configure launch arguments
    const launchArgs = ['--disable-extensions'];

    // For CI environments, we need special configuration
    if (isCI) {
      // Set environment variables for CI
      process.env.VSCODE_SKIP_PREFERRED_USER_DIR = '1';
      process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
      process.env.ELECTRON_NO_ATTACH_CONSOLE = '1';

      // Add CI-specific arguments
      launchArgs.push('--no-sandbox');
      // Note: We're not using --headless as it's causing issues

      // Skip tests in CI environment if needed
      log('Running in CI environment - tests may be skipped if display is not available');

      // Check if we should skip tests entirely in this environment
      if (process.env.SKIP_VSCODE_TESTS === 'true') {
        log('Skipping VS Code tests as per SKIP_VSCODE_TESTS environment variable');
        process.exit(0); // Exit with success
      }
    }

    // Download VS Code, unzip it and run the integration test
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs,
    });
  } catch (err) {
    log(`Failed to run tests: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

main();
