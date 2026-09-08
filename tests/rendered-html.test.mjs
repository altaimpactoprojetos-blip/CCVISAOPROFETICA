import assert from 'node:assert/strict';
import test from 'node:test';
import {createTestWorker} from './worker-fixture.mjs';
test('renders the church home page and administration entry', {timeout:60000}, async t=>{
  const {mf}=await createTestWorker();t.after(()=>mf.dispose());
  const response=await mf.dispatchFetch(new URL('/',await mf.ready));
  assert.equal(response.status,200);
  assert.match(response.headers.get('content-type')??'',/^text\/html\b/i);
  const html=await response.text();
  assert.match(html,/Comunidade Cristã/i);
  assert.match(html,/Visão Profética/i);
  assert.match(html,/href="\/admin"/);
});
