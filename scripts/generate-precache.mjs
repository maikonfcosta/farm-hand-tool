import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
async function walk(dir){const files=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=`${dir}/${e.name}`;if(e.isDirectory())files.push(...await walk(p));else if(/\.(js|css|woff2|png|svg|txt)$/.test(p)&&!p.endsWith('/sw.js'))files.push(p.replace(/^out/,''));}return files;}
const assets=await walk('out');
await writeFile('out/precache.json',JSON.stringify(assets));
const hash=createHash('sha256');
for(const asset of assets)hash.update(await readFile(`out${asset}`));
const source=await readFile('public/sw.js','utf8');
await writeFile('out/sw.js',source.replace('__BUILD_ID__',hash.digest('hex').slice(0,12)));
