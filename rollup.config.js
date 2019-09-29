import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'build/index.js',
  output: {
    format: 'umd',
    file: process.env.DEBUG === 'true' ? 'dist/littlepy.js' : 'dist/littlepy.min.js',
    name: 'littlepy',
  },
  plugins: [
    replace({
      DEBUG: process.env.DEBUG,
    }),
    process.env.DEBUG === 'false' && terser(),
  ],
};
