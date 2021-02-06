const fs = require('fs');
const path = require('path');

const DIR = './build/types';
const DEPENDENCIES = ['api/Main', 'api/Decorators', 'api/CallContext'];
const MODULE = 'littlepy';
const OUTPUT_FILE = './lib/littlepy.d.ts';

const files = {};

function scanDir(dirPath) {
  const fullDirPath = dirPath ? path.join(DIR, dirPath) : DIR;
  for (const name of fs.readdirSync(fullDirPath)) {
    const filePath = path.join(fullDirPath, name);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      const subPath = dirPath ? path.join(dirPath, name) : name;
      scanDir(subPath);
      continue;
    }
    let match = name.match(/^(.+)\.d\.ts$/);
    if (!match) {
      continue;
    }
    const id = dirPath ? path.join(dirPath, match[1]) : match[1];
    const file = {};
    files[id] = file;
    file.path = filePath;
    file.depends = [];
    file.body = [];
    file.id = id;
    const body = fs.readFileSync(filePath, { encoding: 'utf8' });
    const lines = body.split('\n');
    for (const line of lines) {
      match = line.match(/^import .+ from '([^']+)';?$/);
      if (match) {
        const dependency = dirPath ? path.join(dirPath, match[1]) : match[1];
        file.depends.push(dependency);
        continue;
      }
      if (/^export (\*|{})/.test(line)) {
        continue;
      }
      match = line.match(/^export (?:declare )?(.+)$/);
      if (match) {
        file.body.push(match[1]);
      } else {
        file.body.push(line);
      }
    }
  }
}

scanDir('');

const resolvedIds = {};
const resolvedFiles = [];

function resolve(id, prevDeps) {
  if (!prevDeps) {
    prevDeps = [];
  } else {
    if (prevDeps.includes(id)) {
      console.error('cyclic dependency: ', id, prevDeps);
      throw Error('Cyclic dependency');
    }
  }
  prevDeps.push(id);
  const file = files[id];
  if (!file) {
    throw Error(`cannot resolve dependency '${id}'`);
  }
  for (const dependency of file.depends) {
    resolve(dependency, prevDeps);
  }
  prevDeps.pop();
  if (!resolvedIds[id]) {
    resolvedIds[id] = true;
    resolvedFiles.push(file);
  }
}

for (const dependency of DEPENDENCIES) {
  resolve(dependency);
}

const output = [];

output.push(`declare module '${MODULE}' {`);

for (const file of resolvedFiles) {
  for (const line of file.body) {
    if (line.trim()) {
      output.push('    ' + line);
    }
  }
}

output.push('}');

fs.writeFileSync(OUTPUT_FILE, output.join('\n'), { encoding: 'utf8' });
