const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const stage = process.argv[2] || 'before';
(async () => {
 const server = http.createServer((req,res) => {
  const name = new URL(req.url,'http://localhost').pathname;
  if(name === '/favicon.ico') {res.writeHead(204); return res.end();}
  try {res.setHeader('Content-Type', name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(path.join(root,name==='/'?'index.html':name)));} catch {res.writeHead(404);res.end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1000,height:850}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const url=`http://127.0.0.1:${server.address().port}/`;
  await page.goto(url);
  await page.locator('#todo-input').fill('验证键盘切换后焦点'); await page.locator('#todo-add-btn').click();
  await page.locator('.todo-toggle').focus();await page.keyboard.press('Enter');
  const focus=await page.evaluate(()=>({tag:document.activeElement.tagName,css:document.activeElement.className,completed:JSON.parse(localStorage.getItem('web-week7-todos'))[0].completed}));
  await page.locator('#todo').screenshot({path:path.join(__dirname,`focus-${stage}.png`)});
  await page.evaluate(()=>localStorage.setItem('web-week7-todos','{broken'));
  await page.reload();
  await page.locator('#todo-input').fill('损坏存储后仍可添加'); await page.locator('#todo-add-btn').click();
  const corrupt={errors:[...errors],items:await page.locator('#todo-list li').count(),notice:await page.locator('#todo-storage-status').count()?await page.locator('#todo-storage-status').textContent():null};
  await page.locator('#todo').screenshot({path:path.join(__dirname,`storage-${stage}.png`)});
  const result={stage,browser:browser.version(),focus,corrupt};
  fs.writeFileSync(path.join(__dirname,`review-${stage}.json`),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
