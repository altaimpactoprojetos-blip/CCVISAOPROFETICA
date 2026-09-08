import assert from 'node:assert/strict';
import test from 'node:test';
import {createTestWorker} from './worker-fixture.mjs';
import {createHash} from 'node:crypto';

// Runs the compiled Worker against isolated D1/R2, never the live church database.
test('administration, publication, registration and gallery privacy', {timeout: 120000}, async t => {
  const {mf,db}=await createTestWorker({ADMIN_SETUP_TOKEN_HASH:createHash('sha256').update('a'.repeat(64)).digest('hex'),ADMIN_SETUP_EXPIRES_AT:String(Date.now()+3600000)});
  t.after(()=>mf.dispose());
  const origin=(await mf.ready).origin;
  let session='';
  const password='Uma frase de senha somente para testes!';
  async function call(path, {method='GET',data,email,originHeader=origin,form,cookie}={}) {
    const headers={host:new URL(origin).host};
    if(email)headers['oai-authenticated-user-email']=email;
    if(cookie)headers.cookie=cookie;
    if(method!=='GET')headers.origin=originHeader;
    if(data)headers['Content-Type']='application/json';
    let payload=data?JSON.stringify(data):undefined;
    if(form){const serialized=new Request(origin+path,{method,body:form});headers['Content-Type']=serialized.headers.get('Content-Type');payload=await serialized.arrayBuffer();}
    return mf.dispatchFetch(origin+path,{method,headers,body:payload});
  }
  const admin=(path,opts={})=>call(path,{...opts,cookie:session});
  const eventData={name:'Culto de teste',description:'Descrição oficial',event_date:'2026-11-09',time:'19:00',location:'Auditório',capacity:1,registration_status:'open',published:false};
  let eventId, galleryId, imageUrl;
  await t.test('private activation is one-time and creates a hashed password',async()=>{
    const setup={token:'a'.repeat(64),email:'owner@example.test',password};
    assert.equal((await call('/api/admin/auth/setup',{method:'POST',data:{...setup,token:'b'.repeat(64)}})).status,403);
    assert.equal((await call('/api/admin/auth/setup',{method:'POST',data:setup,originHeader:'https://evil.test'})).status,403);
    const created=await call('/api/admin/auth/setup',{method:'POST',data:setup});assert.equal(created.status,201,await created.clone().text());
    assert.equal((await call('/api/admin/auth/setup',{method:'POST',data:setup})).status,409);
    const row=await db.prepare('SELECT password_hash FROM admin_credentials').first();assert.notEqual(row.password_hash,password);assert.match(row.password_hash,/^scrypt\$/);
    assert.equal((await call('/api/admin/auth/login',{method:'POST',data:{email:'owner@example.test',password:'senha errada'}})).status,401);
    const login=await call('/api/admin/auth/login',{method:'POST',data:{email:'owner@example.test',password}});assert.equal(login.status,200,await login.clone().text());
    const cookie=login.headers.get('set-cookie');assert.match(cookie,/HttpOnly/);assert.match(cookie,/Secure/);assert.match(cookie,/SameSite=Strict/);session=cookie.split(';')[0];
    assert.equal((await call('/api/admin/data',{email:'owner@example.test'})).status,403,'ChatGPT headers do not grant password admin access');
  });
  await t.test('anonymous and ordinary accounts cannot access admin endpoints',async()=>{
    for(const path of ['/api/admin/data','/api/admin/submissions','/api/admin/photos?gallery=1']){
      assert.equal((await call(path)).status,403,path);
      assert.equal((await call(path,{email:'visitor@example.test'})).status,403,path);
    }
    for(const path of ['/api/admin/events','/api/admin/galleries','/api/admin/settings','/api/admin/photos']) assert.equal((await call(path,{method:'POST',data:eventData})).status,403,path);
    assert.equal((await call('/api/admin/submissions',{method:'PATCH',data:{id:1,status:'confirmado'}})).status,403);
    assert.equal((await admin('/api/admin/events',{method:'POST',data:eventData,originHeader:'https://other.test'})).status,403);
    assert.equal((await admin('/api/admin/data')).status,200);
  });
  await t.test('draft event is saved privately and appears after publication',async()=>{
    const created=await admin('/api/admin/events',{method:'POST',data:eventData});assert.equal(created.status,201,await created.clone().text());eventId=(await created.json()).id;
    const draft=await call(`/eventos/${eventId}`);assert.equal(draft.status,404);
    const page=await call('/eventos');assert.doesNotMatch(await page.text(),/Culto de teste/);
    const invalid=await admin('/api/admin/events',{method:'POST',data:{...eventData,id:eventId,event_date:'2026-02-31'}});assert.equal(invalid.status,400);
    const published=await admin('/api/admin/events',{method:'POST',data:{...eventData,id:eventId,published:true}});assert.equal(published.status,200,await published.clone().text());
    const detail=await call(`/eventos/${eventId}`);assert.equal(detail.status,200);assert.match(await detail.text(),/Culto de teste/);
  });
  const registration=email=>({kind:'evento',eventId,payload:{nome:'Pessoa de teste',email,whatsapp:'85999999999'}});
  await t.test('one last place cannot be oversold by concurrent requests',async()=>{
    const responses=await Promise.all(['one@example.test','two@example.test'].map(email=>call('/api/submissions',{method:'POST',data:registration(email)})));
    assert.deepEqual(responses.map(r=>r.status).sort(),[201,409]);
    const counts=await (await admin('/api/admin/data')).json();assert.equal(counts.events[0].registrations,1);
    const list=await (await admin(`/api/admin/submissions?event=${eventId}`)).json();assert.equal(list.total,1);assert.equal(list.rows.length,1);
    const row=list.rows[0];
    assert.equal((await admin('/api/admin/submissions',{method:'PATCH',data:{id:row.id,status:'cancelado'}})).status,200);
    assert.equal((await call('/api/submissions',{method:'POST',data:registration('third@example.test')})).status,201);
    assert.equal((await admin('/api/admin/submissions',{method:'PATCH',data:{id:row.id,status:'confirmado'}})).status,409);
  });
  await t.test('duplicate event emails are rejected and closed events reject new registrations',async()=>{
    assert.equal((await admin('/api/admin/events',{method:'POST',data:{...eventData,id:eventId,published:true,capacity:5}})).status,200);
    assert.equal((await call('/api/submissions',{method:'POST',data:registration('THIRD@example.test')})).status,409);
    assert.equal((await admin('/api/admin/events',{method:'POST',data:{...eventData,id:eventId,published:true,capacity:5,registration_status:'closed'}})).status,200);
    assert.equal((await call('/api/submissions',{method:'POST',data:registration('fourth@example.test')})).status,409);
    assert.equal((await call('/api/submissions',{method:'POST',data:{kind:'batismo',payload:{nome:'Interesse batismo',whatsapp:'85999999999'}}})).status,201);
    const result=await (await admin('/api/admin/submissions?kind=batismo&search=Interesse')).json();assert.equal(result.total,1);
  });
  await t.test('gallery images are stored in R2 and drafts cannot leak',async()=>{
    const created=await admin('/api/admin/galleries',{method:'POST',data:{name:'Culto de domingo',category:'Cultos',event_date:'2026-09-06',published:false}});assert.equal(created.status,201);galleryId=(await created.json()).id;
    const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aV1sAAAAASUVORK5CYII=','base64');
    const form=new FormData();form.set('file',new File([png],'culto.png',{type:'image/png'}));form.set('gallery_id',String(galleryId));form.set('alt_text','Foto oficial do culto');
    const upload=await admin('/api/admin/photos',{method:'POST',form});assert.equal(upload.status,201,await upload.clone().text());imageUrl=(await upload.json()).url;
    assert.equal((await call(imageUrl)).status,404);
    assert.equal((await admin(imageUrl)).status,200);
    const publicDraft=await call('/galeria');assert.doesNotMatch(await publicDraft.text(),/Foto oficial do culto/);
    const unsafe=new FormData();unsafe.set('file',new File(['<svg onload="alert(1)"></svg>'],'foto.png',{type:'image/png'}));assert.equal((await admin('/api/admin/photos',{method:'POST',form:unsafe})).status,400);
    assert.equal((await admin('/api/admin/galleries',{method:'POST',data:{id:galleryId,name:'Culto de domingo',category:'Cultos',event_date:'2026-09-06',published:true}})).status,200);
    const image=await call(imageUrl);assert.equal(image.status,200);assert.equal(image.headers.get('Content-Type'),'image/png');assert.equal(image.headers.get('Cache-Control'),'private, no-store');
    const page=await call('/galeria');assert.match(await page.text(),/Foto oficial do culto/);
    assert.equal((await admin('/api/admin/galleries',{method:'POST',data:{id:galleryId,name:'Culto de domingo',category:'Cultos',event_date:'2026-09-06',published:false}})).status,200);
    assert.equal((await call(imageUrl)).status,404);
    const photos=await (await admin(`/api/admin/photos?gallery=${galleryId}`)).json();assert.equal(photos.photos.length,1);
    assert.equal((await admin('/api/admin/photos',{method:'DELETE',data:{id:photos.photos[0].id}})).status,200);
    assert.equal((await (await admin(`/api/admin/photos?gallery=${galleryId}`)).json()).photos.length,0);
  });
  await t.test('program and contact editing changes public information',async()=>{
    assert.equal((await admin('/api/admin/settings',{method:'POST',data:{key:'schedule',value:[{name:'Culto da família',day:'Domingo',time:'18:30'}]}})).status,200);
    assert.match(await (await call('/programacao')).text(),/Culto da família/);
    assert.equal((await admin('/api/admin/settings',{method:'POST',data:{key:'contact',value:{address:'Rua de teste, 10',whatsapp:'85999999999',email:'contato@example.test',instagram:'',youtube:''}}})).status,200);
    assert.match(await (await call('/contato')).text(),/Rua de teste, 10/);
    assert.equal((await admin('/api/admin/settings',{method:'POST',data:{key:'contact',value:{instagram:'javascript:alert(1)'}}})).status,400);
    assert.equal((await call('/admin')).status,200);
    assert.match(await (await call('/admin')).text(),/Entrar no painel/);
    const privateResponse=await admin('/api/admin/data');assert.equal(privateResponse.headers.get('Cache-Control'),'private, no-store');
  });
  await t.test('changing password revokes sessions, expired cookies fail and logout revokes the new session',async()=>{
    const oldSession=session;
    const changed=await admin('/api/admin/auth/password',{method:'POST',data:{current_password:password,password:'Uma nova senha de teste muito segura!'}});assert.equal(changed.status,200,await changed.clone().text());
    assert.equal((await call('/api/admin/data',{cookie:oldSession})).status,403);
    const login=await call('/api/admin/auth/login',{method:'POST',data:{email:'owner@example.test',password:'Uma nova senha de teste muito segura!'}});assert.equal(login.status,200,await login.clone().text());session=login.headers.get('set-cookie').split(';')[0];
    assert.equal((await admin('/api/admin/data')).status,200);
    await db.prepare('UPDATE admin_sessions SET expires_at = 1').run();assert.equal((await admin('/api/admin/data')).status,403);
    await db.prepare('DELETE FROM admin_login_attempts').run();
    const nextLogin=await call('/api/admin/auth/login',{method:'POST',data:{email:'owner@example.test',password:'Uma nova senha de teste muito segura!'}});session=nextLogin.headers.get('set-cookie').split(';')[0];
    assert.equal((await admin('/api/admin/auth/logout',{method:'POST'})).status,200);assert.equal((await admin('/api/admin/data')).status,403);
  });
  await t.test('failed login attempts are throttled at the server',async()=>{
    await db.prepare('DELETE FROM admin_login_attempts').run();
    for(let i=0;i<8;i++) assert.equal((await call('/api/admin/auth/login',{method:'POST',data:{email:'unknown@example.test',password:'senha incorreta'}})).status,401);
    assert.equal((await call('/api/admin/auth/login',{method:'POST',data:{email:'unknown@example.test',password:'senha incorreta'}})).status,429);
  });

});
