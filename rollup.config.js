import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'build/api/Main.js',
  output: {
    format: 'cjs',
    file: process.env.DEBUG === 'true' ? 'lib/littlepy.js' : 'lib/littlepy.min.js',
  },
  plugins: [
    replace({
      DEBUG: process.env.DEBUG,
    }),
    process.env.DEBUG === 'false' && terser(),
  ],
  onwarn(warning, warn) {
    // this is caused by TS decorators
    if (warning.code === 'THIS_IS_UNDEFINED') return;
    warn(warning);
  },
};
