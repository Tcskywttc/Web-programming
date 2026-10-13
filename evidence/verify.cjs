const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const {chromium} = require('playwright');
const root=path.resolve(__dirname,'..');const checks=[];const check=(name,value)=>{assert.ok(value,name);checks.push(name);};
(async()=>{
 const server=http.createServer((req,res)=>{const n=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(n==='/favicon.ico'){res.writeHead(204);return res.end();}try{res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.pdf':'application/pdf'})[path.extname(n)]||'text/html');res.end(fs.readFileSync(path.join(root,n==='/'?'index.html':n)));}catch{res.writeHead(404);res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1000,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url=`http://127.0.0.1:${server.address().port}/`;await page.goto(url);
 const items=page.locator('#todo-list li');const input=page.locator('#todo-input');const button=page.locator('#todo-add-btn');
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('web-week7-todos')||'[]'));
 check('初始空数组与空列表',await items.count()===0);
 for(const t of ['', '   ', '\t\u3000']){await input.fill(t);await button.click();}check('空白输入不添加',await items.count()===0);
 for(const t of ['  学习 JS  ','重复任务','重复任务','<b>纯文本</b>']){await input.fill(t);await button.click();}
 check('trim、顺序、重复文本',JSON.stringify((await state()).map(t=>t.text))===JSON.stringify(['学习 JS','重复任务','重复任务','<b>纯文本</b>']));
 check('HTML 文本不被解析',await page.locator('#todo-list b').count()===0);
 check('输入清空且返回焦点',await input.inputValue()===''&&await input.evaluate(e=>e===document.activeElement));
 await page.reload();check('添加后刷新恢复',await items.count()===4);
 await page.locator('.todo-toggle').first().focus();await page.keyboard.press('Enter');check('键盘切换完成且恢复焦点',await page.evaluate(()=>todos[0].completed&&document.activeElement.classList.contains('todo-toggle')));
 await page.reload();check('切换后刷新保留 done 样式',await page.locator('.todo-item.done').count()===1);
 await page.locator('.todo-delete').nth(1).click();check('删除只移除目标并不切换其他项',await page.evaluate(()=>todos.length===3&&todos[0].completed&&todos[1].completed===false));
 await page.reload();check('删除后刷新仍有效',await items.count()===3);
 for(const [f,n] of [['done',1],['active',2],['all',3]]){const prior=await page.evaluate(()=>localStorage.getItem(KEY));await page.locator(`[data-filter="${f}"]`).click();check(`${f} 筛选正确且不改持久数据`,await items.count()===n&&prior===await page.evaluate(()=>localStorage.getItem(KEY)));}
 await page.locator('[data-filter="done"]').click();await page.reload();check('刷新筛选回 all',await items.count()===3&&await page.locator('[data-filter="all"]').getAttribute('aria-pressed')==='true');
 const immutable=await page.evaluate(()=>{
  const a=todos;const json=JSON.stringify(a);Object.freeze(a);a.forEach(Object.freeze);addTodo('不可变检查');const add=todos!==a&&JSON.stringify(a)===json;
  const b=todos;const old=b[0];Object.freeze(b);toggleTodo(old.id);const toggle=todos!==b&&todos[0]!==old&&todos[0].completed!==old.completed&&todos[1]===b[1];
  const c=todos;const before=JSON.stringify(c);Object.freeze(c);removeTodo(c[0].id);const remove=todos!==c&&JSON.stringify(c)===before;
  return {add,toggle,remove};
 });for(const [k,v] of Object.entries(immutable))check(`${k} 不可变更新及旧引用保持`,v);
 await page.evaluate(()=>{todos=[];save();render();for(let i=0;i<30;i++)addTodo('快速添加');});check('快速连续添加 ID 唯一',await page.evaluate(()=>new Set(todos.map(t=>t.id)).size===30));
 await page.evaluate(()=>{todos=[];save();render();addTodo('保留的未完成任务');addTodo('已完成一');addTodo('已完成二');toggleTodo(todos[1].id);toggleTodo(todos[2].id);});
 await page.locator('#todo').screenshot({path:path.join(__dirname,'clear-before.png')});
 const clear=await page.evaluate(()=>{const old=todos;const before=JSON.stringify(old);Object.freeze(old);clearCompleted();return {oldIntact:JSON.stringify(old)===before,newArray:old!==todos,count:todos.length,text:todos[0].text};});
 check('clearCompleted 新数组仅保留未完成且旧数组不变',clear.oldIntact&&clear.newArray&&clear.count===1&&clear.text==='保留的未完成任务');
 await page.reload();check('clearCompleted 保存且刷新不恢复已完成',await items.count()===1);
 await page.locator('#todo').screenshot({path:path.join(__dirname,'clear-after.png')});
 await page.evaluate(()=>{clearCompleted();toggleTodo(todos[0].id);clearCompleted();clearCompleted();});check('空数组和全部完成时清除可重复调用',await items.count()===0);
 const malformed=['{broken','null','{}','[null]','[{"id":"a","text":"x","completed":"false"}]','[{"id":"a","text":"x","completed":false},{"id":"a","text":"y","completed":true}]'];
 for(const raw of malformed){await page.evaluate(raw=>localStorage.setItem(KEY,raw),raw);await page.reload();check(`异常存储安全恢复：${raw.slice(0,28)}`,await items.count()===0&&await page.locator('#todo-storage-status').textContent()!==''&&await page.evaluate(()=>localStorage.getItem(KEY))===raw);}
 await input.fill('修复后添加');await button.click();check('坏存储恢复后可以保存新增任务',await items.count()===1&&(await state())[0].text==='修复后添加');
 const blocked=await browser.newPage();const blockedErrors=[];blocked.on('pageerror',e=>blockedErrors.push(e.message));await blocked.addInitScript(()=>{Storage.prototype.getItem=function(){throw new DOMException('Blocked','SecurityError');};Storage.prototype.setItem=function(){throw new DOMException('Blocked','QuotaExceededError');};});await blocked.goto(url);await blocked.locator('#todo-input').fill('仅内存');await blocked.locator('#todo-add-btn').click();check('存储不可用仍可操作并明确提示',await blocked.locator('#todo-list li').count()===1&&(await blocked.locator('#todo-storage-status').textContent()).includes('无法保存')&&blockedErrors.length===0);await blocked.close();
 await page.evaluate(()=>{todos=[];save();render();addTodo('完成 Week7 数据驱动重构');addTodo('核对筛选与刷新后的保存结果');addTodo('长文本压力测试 '+ 'x'.repeat(150));toggleTodo(todos[0].id);});
 const layouts=[];for(const width of [320,375,800,1440]){await page.setViewportSize({width,height:900});const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));check(`${width}px 无横向溢出`,layout.scroll===width);layouts.push(layout);await page.locator('#todo').screenshot({path:path.join(__dirname,`todo-${width}.png`)});}
 await page.locator('[data-filter="active"]').click();await page.locator('.todo-toggle').first().focus();await page.keyboard.press('Enter');check('筛选内切换后消失且焦点回输入框',await page.evaluate(()=>document.activeElement===input&&todos.filter(t=>!t.completed).length===1));
 await page.locator('[data-filter="done"]').click();await page.locator('.todo-delete').first().click();check('筛选内删除不误改其他任务',await page.evaluate(()=>todos.length===2&&todos.filter(t=>t.completed).length===1));
 await input.fill('Enter 添加');await input.press('Enter');check('Enter 可添加且当前 done 筛选不显示新任务',await page.evaluate(()=>todos.length===3&&list.children.length===1));
 check('所有实际浏览器操作无未捕获异常',errors.length===0);
 if(fs.existsSync(path.join(root,'../week6/index.html'))) {
 for(const [n,hash]of Object.entries(JSON.parse(fs.readFileSync(path.join(__dirname,'week6-baseline-hashes.json'))))){check(`W6 未改变：${n}`,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'../week6',n))).digest('hex')===hash);}
 const before=fs.readFileSync(path.join(root,'../week6/index.html'),'utf8').replace(/<section id="todo"[\s\S]*?<\/section>/,'');const after=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<section id="todo"[\s\S]*?<\/section>/,'');check('Todo 外原页面 HTML 完全保持',before===after);
 }
 const report={passed:checks.length,browser:browser.version(),checks,layouts,immutable,clear,errors};fs.writeFileSync(path.join(__dirname,'results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 } finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
