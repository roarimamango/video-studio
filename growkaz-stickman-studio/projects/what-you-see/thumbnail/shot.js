const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(1500);await p.evaluate(()=>document.fonts.ready);
console.log(await p.evaluate(()=>[...document.fonts].map(f=>f.family+':'+f.status).join(',')));
await p.screenshot({path:process.argv[3],type:'jpeg',quality:92});await b.close();})();
