import {readdir,writeFile} from 'node:fs/promises';
async function walk(dir){const files=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=`${dir}/${e.name}`;if(e.isDirectory())files.push(...await walk(p));else if(/\.(js|css|woff2|png|svg)$/.test(p))files.push(p.replace(/^out/,''));}return files;}
await writeFile('out/precache.json',JSON.stringify(await walk('out')));
