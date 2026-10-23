import {spawnSync} from 'node:child_process';
const selected=process.argv.slice(2);
for(const task of selected.length?selected:['lint','typecheck','test','build','test:e2e']){const r=spawnSync(process.platform==='win32'?'npm.cmd':'npm',['run',task],{stdio:'inherit',shell:process.platform==='win32'});if(r.status!==0)process.exit(r.status||1);}
