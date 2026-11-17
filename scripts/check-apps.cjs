const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const pages=['index.html','mathe/test-01/index.html','deutsch/test-01/index.html','biologie/klassenarbeit-01/index.html','englisch/test-01/index.html','englisch/klassenarbeit-01/index.html','latein/test-01/index.html','latein/test-02/index.html'];
let failures=0;
function check(code,label){try{new vm.Script(code,{filename:label});console.log('OK',label)}catch(e){console.error('FAIL',label,e.message);failures++}}
function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){if(ent.name==='.git'||ent.name==='node_modules')continue;const p=path.join(dir,ent.name);if(ent.isDirectory())walk(p);else if(p.endsWith('.js'))check(fs.readFileSync(p,'utf8'),p)}}
walk('.');
for(const p of pages){if(!fs.existsSync(p)){console.error('MISSING',p);failures++;continue}const html=fs.readFileSync(p,'utf8');const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];for(let i=0;i<scripts.length;i++){if(!/\bsrc\s*=/.test(scripts[i][1])&&scripts[i][2].trim())check(scripts[i][2],p+' inline '+(i+1))}for(const m of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)){const src=m[1].split('?')[0];if(/^https?:|^\/\//.test(src))continue;const target=path.resolve(path.dirname(p),src);if(!fs.existsSync(target)){console.error('MISSING SCRIPT',p,src);failures++}}}
if(failures){console.error(failures+' validation error(s)');process.exit(1)}console.log('All static checks passed. This does not confirm bug reproduction.');
