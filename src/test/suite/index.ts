import * as path from 'path';
import Mocha from 'mocha';
import { glob } from 'glob';

export function run(): Promise<void> {
  // Check if running in CI environment
  const isCI = process.env.CI === 'true';

  // Create the mocha test with appropriate settings
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
    timeout: isCI ? 60000 : 10000, // Much longer timeout for CI environments
  });

  const testsRoot = path.resolve(__dirname, '..');

  return new Promise<void>((resolve, reject) => {
    glob('**/**.test.js', { cwd: testsRoot })
      .then((files: string[]) => {
        // Add files to the test suite
        files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)));

        try {
          // Run the mocha test
          mocha
            .run((failures: number) => {
              if (failures > 0) {
                reject(new Error(`${failures} tests failed.`));
              } else {
                resolve();
              }
            })
            .on('error', (err: Error) => {
              console.error('Mocha run error:', err);
              reject(err);
            })
            .on('end', () => {
              // Test run completed
            });
        } catch (err: unknown) {
          console.error('Exception during test execution:', err);
          reject(err);
        }
      })
      .catch((err: Error) => {
        reject(err);
      });
  });
}
