from pathlib import Path
from zipfile import ZipFile
from copy import deepcopy
from lxml import etree as E
import hashlib,json,subprocess
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'第7周AI协作记录.docx'
OUTPUT=ROOT/'廖子豪2024142009AI协作日志W7.docx'
W='http://schemas.openxmlformats.org/wordprocessingml/2006/main'
NS={'w':W}
with ZipFile(SOURCE) as z:
    original=z.read('word/document.xml'); doc=E.fromstring(original)
paras=doc.findall('w:body/w:p',NS)
original_paras=[deepcopy(p) for p in paras]
inserted=[]
# 只往既有空白处填入文字；不新增/删除段落，不改 pPr、样式、分节或教师说明。
body_style=E.fromstring(f'<w:rPr xmlns:w="{W}"><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="宋体"/><w:sz w:val="21"/></w:rPr>')
def put(i,text,append=False):
    p=paras[i]
    if not append:
        assert not ''.join(p.xpath('.//w:t/text()',namespaces=NS)),f'not blank: {i}'
    r=E.SubElement(p,f'{{{W}}}r');r.append(deepcopy(body_style))
    if append: E.SubElement(r,f'{{{W}}}br')
    for k,line in enumerate(text.split('\n')):
        if k:E.SubElement(r,f'{{{W}}}br')
        t=E.SubElement(r,f'{{{W}}}t');t.set('{http://www.w3.org/XML/1998/namespace}space','preserve');t.text=line
    inserted.append(r)
# 用户明确要求内容填入空处，填写本次基本信息。仅替换空白横线。
fields={2:'廖子豪',3:'2024142009',4:'Codex（生成、代码审查、浏览器自动验证及报告整理）',5:'https://github.com/Tcskywttc/Web-programming',6:'feature/v2-data-driven'}
replaced=[]
for i,value in fields.items():
    target=next(t for t in paras[i].iter(f'{{{W}}}t') if '＿＿' in (t.text or ''))
    replaced.append((target,target.text));target.text=target.text.replace('＿＿＿＿＿＿＿＿',value)
put(15,'本次类型：AI 生成、AI 调试。',True)
put(16,'本次对应函数：addTodo / removeTodo / toggleTodo / render。',True)
put(19,'执行需求（依据本次总体要求与 Plan 整理）：请在 W6 页面上把 Todo 改成由 todos 数组驱动，完成添加、删除和完成切换。使用原生 JS，保留原页面；添加用展开、删除用 filter、切换用 map 加对象展开，不能 push/splice 或直接改旧对象。三个操作都按更新数据→save()→render() 执行；列表仅由 render 创建，任务文字用 textContent；删除不能顺带切换完成状态，并验证键盘操作。')
put(22,'''// 初版核心片段，完整留档：evidence/script.phase1.js
function addTodo(text) {
  const cleaned = text.trim();
  if (!cleaned) return;
  todos = [...todos, { id: crypto.randomUUID(),
    text: cleaned, completed: false }];
  save(); render();
}
function removeTodo(id) {
  todos = todos.filter(t => t.id !== id);
  save(); render();
}
function toggleTodo(id) {
  todos = todos.map(t => t.id === id
    ? { ...t, completed: !t.completed } : t);
  save(); render();
}
// render 初版节选：每次重建列表，没有保存和恢复焦点。
list.replaceChildren();
todos.forEach(({ id, text, completed }) => {
  const li = document.createElement("li");
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.textContent = text;
  li.addEventListener("click", () => toggleTodo(id));
  // 删除按钮的处理器先 stopPropagation，再 removeTodo(id)。
  li.append(toggle, delBtn);
  list.appendChild(li);
});''')
put(25,'AI 辅助审查结论：三个函数已生成新数组，toggle 也没有修改旧对象；但 render 整表重建会销毁正在聚焦的按钮。实际按 Enter 切换任务后，completed 变成 true，document.activeElement 却变成 BODY，连续键盘操作失去原位置。问题在 DOM 重建与焦点管理，不在不可变更新本身。上方 render 为相关语句节选，delBtn 创建过程省略，不能单独运行。')
put(31,'判断类型：发现可改进项，修改后接受。修改 render：重画前记录当前焦点所在任务的 id 和按钮类型；挂载后按 id 找到新按钮并 focus。如果删除或筛选导致该任务不再显示，则回到输入框。保留 filter/map/展开更新、删除阻止冒泡和 textContent。没有为了凑审查记录把正确的不可变写法改坏。')
put(33,'本次实际验证：Codex 在本机 Chrome 打开页面，添加一项、聚焦任务按钮并按 Enter；同一流程分别运行初版与修订版，记录 activeElement 和 completed。再用冻结旧数组/对象的方式检查三种更新。',True)
put(34,'初版焦点为 BODY、completed=true；修订版焦点为 BUTTON（todo-toggle）、completed=true。最终回归中 add/remove/toggle 的旧数组均保持，toggle 只创建目标的新对象；筛选内任务消失时焦点回输入框。结果见 review-before.json、review-after.json、results.json。',True)
put(35,'是。对照复现证明焦点丢失来自替换旧节点；恢复焦点后任务状态与键盘位置同时正确。',True)
put(36,'列表状态正确不代表交互完整；重建 DOM 时还应考虑焦点等浏览器交互状态。',True)
put(37,'本报告按实际工具日志整理；审查和测试由 Codex 辅助完成，不冒充学生已亲自执行。Prompt 为本次执行约束的整理，不是另一段未发生对话的逐字引用。',True)
put(41,'本次类型：AI 调试、AI 生成。',True)
put(42,'本次对应函数：load / save / setFilter / render。',True)
put(45,'执行需求（依据本次总体要求与 Plan 整理）：为 Todo 完善本地存储和 all/done/active 筛选。用 JSON.stringify 保存、JSON.parse 读取，初始化先 load 再 render；坏 JSON、错误结构和存储不可用不能中断页面。筛选只影响显示，不能改 todos 或保存 filter，刷新回 all。检查删除和切换后的刷新结果，并验证存储失败时的提示。')
put(48,'''// 第一阶段生成代码：正常 JSON 可用，异常路径尚未处理。
function save() {
  localStorage.setItem(KEY, JSON.stringify(todos));
}
function load() {
  const raw = localStorage.getItem(KEY);
  return raw === null ? [] : JSON.parse(raw);
}
// 后续新增的筛选核心：视图状态不写入存储。
function setFilter(value) {
  if (!["all", "done", "active"].includes(value)) return;
  filter = value;
  render();
}
const shown = todos.filter(t => filter === "all"
  ? true : filter === "done" ? t.completed : !t.completed);''')
put(51,'AI 辅助审查发现风险并实际复现：load 直接 JSON.parse，存储为“{broken”时抛出语法异常，初始化中止，点击添加也没有任务出现。解析成功也不代表类型正确，null、对象、错误 completed 类型或重复 id 都不应作为任务状态；save 的存储异常也需捕获。筛选则应产生 shown 数组，不能把筛选结果赋回 todos，否则会丢失隐藏任务。')
put(57,'判断类型：发现风险，复现后修正。load 增加 try/catch，检查数组、每项 id/text/completed 的类型和 id 唯一性；失败返回空数组并显示提示，初始化时不覆盖坏存储。save 捕获失败后显示“更改仅保留在此页面”的提示，并继续 render。setFilter 只更新 filter；render 用 shown 绘制并更新筛选按钮和计数。')
put(59,'Codex 在隔离浏览器上下文写入坏 JSON、null、对象、空元素、错误字段及重复 id，刷新观察；另模拟 getItem/setItem 抛错。正常流程分别添加、删除、切换后刷新，逐一点击三种筛选并比较存储字符串。',True)
put(60,'初版坏 JSON 出现 1 次未捕获解析异常、列表 0 项且无法添加；修订版无未捕获异常，随后成功添加 1 项。最终 6 类坏数据均安全回退且保留原存储；模拟存储禁用仍可操作并显示未保存提示。添加/删除/切换刷新有效，筛选不改持久数据，刷新回 all。',True)
put(61,'是。初版错误已复现，修订后异常路径及正常路径都通过；当前只覆盖本机 Chrome 的这些测试场景。',True)
put(62,'JSON 可解析、数据结构有效、保存成功是三个不同条件；筛选状态和任务状态也要分开处理。',True)
put(63,'最终自动检查 43 项通过，浏览器 Chrome 155.0.8059.39；320/375/800/1440px 无横向溢出。证据在仓库 evidence/，没有把预期结果写成实测。',True)
put(73,'''本项由 AI 辅助编写，未作为“禁用 AI、5 分钟内独立完成”的证明。
function clearCompleted() {
  todos = todos.filter(t => !t.completed);
  save();
  render();
}''')
put(75,'Codex 在浏览器页面执行环境调用：准备 1 项未完成、2 项已完成；冻结并记录旧数组，执行 clearCompleted()。结果只剩“保留的未完成任务”，产生新数组、旧数组内容不变，刷新后仍为 1 项。另检查全完成和空数组，连续清除不报错；真实前后截图为 evidence/clear-before.png 与 clear-after.png。函数在经典脚本顶层，可在该页面控制台直接调用。')
put(77,'本次未开展禁用 AI 的独立尝试，因此不填写虚构的独立困难。需要理解的是：filter 保留 completed 为 false 的任务，随后 save 保证刷新一致，render 保证当前页面一致；只删除页面元素不能同步持久数据。')
put(83,'在准备 Git 提交和整理报告时，需要验证开发过程可追溯，以及新增内容是否改变旧页面和教师模板。')
merge=subprocess.check_output(['git','log','--merges','-1','--format=%h'],cwd=ROOT,text=True).strip()
put(85,f'在 feature/v2-data-driven 上实际形成 3 次提交：647abca（数据驱动重构）、535eed4（存储容错与焦点修复）、7d3a73a（筛选、计数及清除功能）；以 {merge} 合并 main。W6 五个文件哈希未变，Todo 外 HTML 相同；报告仅填既有空处，保留原说明和格式。')
put(91,'todos 在 addTodo、removeTodo、toggleTodo 中重新赋值；新增的 clearCompleted 也会更新它。分别使用展开、filter、map 加对象展开、filter，更新后都调用 save 和 render。')
put(92,'说明：以下 5 问为基于当前源码的 AI 辅助解释，供本人核对理解；不作为脱离 AI 的回答记录。')
put(95,'render 先依据 filter 从 todos 筛出 shown，再创建 li 和按钮，设置 textContent、完成样式与事件，最后挂到列表。操作函数先改数据并保存，再调用 render；筛选只重画，不修改 todos。')
put(99,'filter 返回一个不含目标 id 的新数组，旧数组不会被挖掉元素；splice 会直接改变原数组。重新赋值给 todos 后，再保存和渲染，可以统一数据与页面。')
put(102,'依赖 load()：读取 localStorage 中 KEY 对应的 JSON，解析并校验为任务数组，交给 let todos = load()。随后首次 render 恢复页面；filter 则重新初始化为 all。')
put(105,'本次验证并修正了 render() 的焦点处理：初版 replaceChildren 后焦点落到 BODY，最终版在重建前记住任务 id，重建后聚焦新按钮。这样按 Enter 切换完成状态后，键盘操作不会失去当前位置。')
put(111,'本次 AI 初版在正常数据下可运行，却遗漏了坏存储与整表重绘后的焦点问题；验收要同时检查状态数据、持久化失败路径和真实交互。')
xml=E.tostring(doc,xml_declaration=True,encoding='UTF-8',standalone=True)
with ZipFile(SOURCE) as z, ZipFile(OUTPUT,'w') as out:
    for info in z.infolist():out.writestr(info,xml if info.filename=='word/document.xml' else z.read(info.filename))
# 撤回本脚本的新增 run 和空白替换，核对原有所有段落 XML 原封不动。
for r in inserted:r.getparent().remove(r)
for t,old in replaced:t.text=old
assert all(E.tostring(a, method="c14n", exclusive=True)==E.tostring(b, method="c14n", exclusive=True) for a,b in zip(paras,original_paras))
with ZipFile(SOURCE) as a,ZipFile(OUTPUT) as b:
    unchanged=[n for n in a.namelist() if n!='word/document.xml' and a.read(n)==b.read(n)]
    assert len(unchanged)==len(a.namelist())-1
qa={'source_sha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'output_sha256':hashlib.sha256(OUTPUT.read_bytes()).hexdigest(),'original_paragraphs':len(paras),'all_original_paragraph_xml_preserved_after_removing_fills':True,'unchanged_parts':unchanged,'added_runs':len(inserted),'filled_basic_fields':len(fields),'output':str(OUTPUT)}
(ROOT/'evidence/report-fidelity.json').write_text(json.dumps(qa,ensure_ascii=False,indent=2))
print(OUTPUT)
