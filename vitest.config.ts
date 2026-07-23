import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist'],
    resolveSnapshotPath: (testPath, snapExtension) => `${testPath.replace('/test/', '/test/snapshots/')}${snapExtension}`,
    testTimeout: 30_000,
  }
});
