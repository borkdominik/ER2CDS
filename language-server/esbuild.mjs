//@ts-check
import * as esbuild from 'esbuild';
import path from 'path';

const __dirname = import.meta.dirname;
const watch = process.argv.includes('--watch');

const ctx = await esbuild.context({
    entryPoints: ['src/server.ts'],
    outdir: path.resolve(__dirname, '../extension/out'),
    bundle: true,
    target: "ES2022",
    loader: { '.ts': 'ts' },
    external: ['vscode'],
    platform: 'node',
    sourcemap: true,
    format: 'cjs',
    outExtension: {
        '.js': '.cjs'
    }
});

if (watch) {
    await ctx.watch();
} else {
    await ctx.rebuild();
    ctx.dispose();
}