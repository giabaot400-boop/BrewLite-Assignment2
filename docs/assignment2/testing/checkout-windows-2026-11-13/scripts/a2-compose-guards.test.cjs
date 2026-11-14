'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { assertDatabaseTarget, assertComposeConfig, assertRuntime, PROJECT, BASE } = require('./a2-compose-guards.cjs');
function config() {
  return {name:PROJECT,services:{
    db:{image:'postgres:17-bookworm',environment:{POSTGRES_DB:'brewlite_a2',POSTGRES_USER:'brewlite'},
      volumes:[{type:'volume',source:'postgres_data',target:'/var/lib/postgresql/data'}]},
    backend:{image:'brewlite-a2-api:local',environment:{DATABASE_URL:'postgresql://brewlite:test-only@db:5432/brewlite_a2?schema=public',
      MOCK_PAYMENT_OUTCOME:'SUCCEEDED',DEMO_WORKFLOW_ENABLED:'false',FRONTEND_ORIGIN:BASE}},
    frontend:{image:'brewlite-a2-web:local',environment:{CHECKOUT_V2_ENABLED:'1',APP_ORIGIN:BASE,
      BACKEND_INTERNAL_URL:'http://backend:3001',AUTH_COOKIE_NAME:'brewlite_a2_session'},
      ports:[{host_ip:'127.0.0.1',published:'3100',target:3000}]}
  },volumes:{postgres_data:{name:PROJECT+'_postgres_data'}}};
}
test('permits the explicit local A2 Compose profile',()=>assertComposeConfig(config()));
const invalid = [
  ['A1 project',c=>c.name='brewlite-sprint3'],
  ['host application database',c=>c.services.backend.environment.DATABASE_URL='postgresql://brewlite:x@localhost:5432/brewlite_a2'],
  ['host test database',c=>c.services.backend.environment.DATABASE_URL='postgresql://brewlite:x@db:5432/brewlite_a2_test'],
  ['A1 database',c=>c.services.backend.environment.DATABASE_URL='postgresql://brewlite:x@db:5432/brewlite_s3_demo'],
  ['host redirection parameter',c=>c.services.backend.environment.DATABASE_URL+='&host=other'],
  ['duplicate schema',c=>c.services.backend.environment.DATABASE_URL+='&schema=public'],
  ['published database',c=>c.services.db.ports=[{published:'5432',target:5432}]],
  ['published backend',c=>c.services.backend.ports=[{published:'3001',target:3001}]],
  ['public frontend',c=>c.services.frontend.ports[0].host_ip='0.0.0.0'],
  ['A1 web port',c=>c.services.frontend.ports[0].published='3000'],
  ['unexpected extra service',c=>c.services.other={}],
  ['globally enabled CLI',c=>c.services.backend.environment.DEMO_WORKFLOW_ENABLED='true'],
  ['wrong mock outcome',c=>c.services.backend.environment.MOCK_PAYMENT_OUTCOME='FAILED'],
  ['wrong cookie',c=>c.services.frontend.environment.AUTH_COOKIE_NAME='brewlite_session'],
  ['A1 persistent volume',c=>c.volumes.postgres_data.name='brewlite-sprint3_postgres_data'],
  ['source bind mount',c=>c.services.frontend.volumes=[{type:'bind',source:'.',target:'/app'}]],
  ['external image',c=>c.services.backend.image='other:latest'],
];
for(const [name,mutate] of invalid) test('blocks '+name,()=>{const c=config();mutate(c);assert.throws(()=>assertComposeConfig(c));});
test('database errors do not expose the connection password',()=>{
  const secret='do-not-log-this-value';
  try{assertDatabaseTarget('postgresql://brewlite:'+secret+'@localhost:5432/brewlite_a2');assert.fail();}
  catch(e){assert(!e.message.includes(secret));}
});
function runtime() {
  return ['backend','db','frontend'].map(service=>({Config:{Labels:{'com.docker.compose.project':PROJECT,
    'com.docker.compose.service':service,'com.docker.compose.project.working_dir':path.resolve('.')},
    Env:service==='backend'?['DATABASE_URL='+config().services.backend.environment.DATABASE_URL,
      'MOCK_PAYMENT_OUTCOME=SUCCEEDED','DEMO_WORKFLOW_ENABLED=false']:[]},
    NetworkSettings:{Networks:{[PROJECT+'_default']:{}},Ports:service==='frontend'?{'3000/tcp':[{HostIp:'127.0.0.1',HostPort:'3100'}]}:{}},
    Mounts:service==='db'?[{Type:'volume',Name:PROJECT+'_postgres_data',Destination:'/var/lib/postgresql/data'}]:[]}));
}
test('permits matching running containers and named data volume',()=>assertRuntime(runtime(),'.'));
for(const [name,mutate] of [
  ['foreign container project',r=>r[0].Config.Labels['com.docker.compose.project']='brewlite-sprint3'],
  ['another checkout directory',r=>r[0].Config.Labels['com.docker.compose.project.working_dir']=path.resolve('other')],
  ['unrelated runtime volume',r=>r[1].Mounts[0].Name='brewlite-sprint3_postgres_data'],
  ['published runtime backend',r=>r[0].NetworkSettings.Ports={'3001/tcp':[{HostIp:'0.0.0.0',HostPort:'3001'}]}],
  ['runtime host database',r=>r[0].Config.Env[0]='DATABASE_URL=postgresql://brewlite:x@localhost:5432/brewlite_a2'],
  ['extra runtime network',r=>r[2].NetworkSettings.Networks.other={}],
]) test('blocks '+name,()=>{const r=runtime();mutate(r);assert.throws(()=>assertRuntime(r,'.'));});
