const fs = require('fs');
const path = require('path');

const DIR = './build/types/api';
const DEPENDENCIES = ['Main', 'Decorators'];
const MODULE = 'littlepy';
const OUTPUT_FILE = './lib/littlepy.d.ts';

const files = {};

for (const name of fs.readdirSync(DIR)) {
  let match = name.match(/^(.+)\.d\.ts$/);
  if (!match) {
    continue;
  }
  const id = match[1];
  const filePath = path.join(DIR, name);
  const file = {};
  files[id] = file;
  file.path = filePath;
  file.depends = [];
  file.body = [];
  file.id = id;
  const body = fs.readFileSync(filePath, { encoding: 'utf8' });
  const lines = body.split('\n');
  for (const line of lines) {
    match = line.match(/^import .+ from '\.\/([^']+)';?$/);
    if (match) {
      file.depends.push(match[1]);
      continue;
    }
    if (/^export \*/.test(line)) {
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

const resolvedIds = {};
const resolvedFiles = [];

function resolve(id) {
  const file = files[id];
  if (!file) {
    throw Error(`cannot resolve dependency '${id}'`);
  }
  for (const dependency of file.depends) {
    resolve(dependency);
  }
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
