import {readFile, readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {Miniflare} from 'miniflare';

export async function createTestWorker(bindings={}) {
  const root=resolve('dist/server');
  async function collect(directory) {
    const entries=await readdir(directory,{withFileTypes:true});
    return (await Promise.all(entries.map(entry=>entry.isDirectory()?collect(resolve(directory,entry.name)):entry.name.endsWith('.js')?[{path:resolve(directory,entry.name),type:'ESModule'}]:[]))).flat();
  }
  const modules=await collect(root);
  modules.sort((a,b)=>a.path===resolve(root,'index.js')?-1:b.path===resolve(root,'index.js')?1:a.path.localeCompare(b.path));
  const mf=new Miniflare({modules,modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],bindings,d1Databases:['DB'],r2Buckets:['BUCKET']});
  try {
    const db=await mf.getD1Database('DB');
    for(const file of (await readdir('drizzle')).filter(name=>name.endsWith('.sql')).sort()) {
      const source=await readFile(`drizzle/${file}`,'utf8');
      for(const sql of source.split('--> statement-breakpoint').map(value=>value.trim()).filter(Boolean)) await db.prepare(sql).run();
    }
    return {mf,db};
  }catch(error){await mf.dispose();throw error;}
}
