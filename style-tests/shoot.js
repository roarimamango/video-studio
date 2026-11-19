const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+__dirname+'/style.html');
for(const [n,q] of [['lab',1],['lab',0],['wait',1],['heart',1]]){await p.evaluate(([n,q])=>window.render(n,q),[n,q]);
 await p.locator('#c').screenshot({path:`${__dirname}/${n}_${q?'quality':'base'}.png`});}
await b.close();})();
