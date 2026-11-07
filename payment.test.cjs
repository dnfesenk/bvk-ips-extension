const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const p = require('./payment.js');
// Synthetic fixtures with valid checksums; never use these details for payments.
for (const s of ['1,234.56','1.234,56','1234.56','1234,56']) assert.equal(p.amount(s),'1234,56');
for (const s of ['1,234','-5,00','0,00','abc']) assert.throws(()=>p.amount(s));
assert.equal(p.account('999-12345-73'),'999000000001234573');
assert.throws(()=>p.account('999-12345-74'));
assert.equal(p.account('999-67890-84'),'999000000006789084');
const d={account:'999-12345-73',amount:'1,234.56',recipient:'SYNTHETIC TEST RECIPIENT',purpose:'Synthetic test invoice',code:'189',model:'97',reference:'95-000-00000001'};
const payload=p.payload(d);
assert.equal(payload,'K:PR|V:01|C:1|R:999000000001234573|N:SYNTHETIC TEST RECIPIENT|I:RSD1234,56|SF:289|S:Synthetic test invoice|RO:979500000000001');
assert.throws(()=>p.payload({...d,reference:'96-000-00000001'}));
assert.throws(()=>p.payload({...d,recipient:'Test|R:123'}));
const ctx=vm.createContext({});
for(const file of ['vendor/qrcode.js','vendor/qrcode_UTF8.js']) vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),ctx);
ctx.payload=payload;
vm.runInContext("var qr=qrcode(0,'M');qr.addData(payload,'Byte');qr.make();",ctx);
assert.ok(ctx.qr.getModuleCount()>21);
assert.match(ctx.qr.createSvgTag({cellSize:5,margin:20,scalable:true}),/<svg/);

assert.equal(p.payload({...d,code:'289'}),payload);
assert.ok(p.payload({...d,code:'222'}).includes('|SF:222|'));

console.log('OK: amount formats, account/reference checksums, exact payload, QR generation.');
