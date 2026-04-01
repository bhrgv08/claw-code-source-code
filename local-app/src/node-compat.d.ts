declare module 'node:fs' {
  const fs: any;
  export = fs;
}
declare module 'node:path' {
  const path: any;
  export = path;
}
declare module 'node:readline/promises' {
  const rl: any;
  export = rl;
}
declare module 'node:process' {
  export const stdin: any;
  export const stdout: any;
}
declare const process: any;
declare const console: any;
