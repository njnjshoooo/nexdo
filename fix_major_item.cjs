const fs = require('fs');

let c = fs.readFileSync('src/pages/admin/editors/MajorItemEditor.tsx', 'utf8');

c = c.replace(/import { Plus, Trash2, Hash } from 'lucide-react';/, "import { Plus, Trash2, Hash, ChevronLeft, ChevronRight, CheckCircle2, Briefcase } from 'lucide-react';\nimport { PageMainTitle, BlockContainer, InnerBlockContainer, FieldLabel, InputClass, PrimaryBtnClass, SecondaryBtnClass } from '../../../components/admin/ui/AdminEditorUI';");

// replace the useFieldArray for services and cases to include move
c = c.replace(/remove: removeService, update: updateService } =/, "remove: removeService, update: updateService, move: moveService } =");
c = c.replace(/remove: removeCase } =/, "remove: removeCase, move: moveCase } =");

// Remove local variables to avoid unused vars
c = c.replace(/const labelClass = "[^"]+";\n/g, "");
c = c.replace(/const inputClass = "[^"]+";\n/g, "");
c = c.replace(/const cardClass = "[^"]+";\n/g, "");
c = c.replace(/const innerCardClass = "[^"]+";\n/g, "");
c = c.replace(/const primaryBtn = "[^"]+";\n/g, "");
c = c.replace(/const secondaryBtn = "[^"]+";\n/g, "");

// Hero section
c = c.replace(/<div className="mb-4">\s*<h2 className="text-xl font-bold text-stone-900">Hero 區塊編輯<\/h2>\s*<\/div>\s*<div className=\{cardClass\}>/g, '<div className="mb-6 flex justify-between items-center border-b border-stone-200 pb-4"><PageMainTitle>Hero 區塊編輯</PageMainTitle></div>\n        <BlockContainer>');
c = c.replace(/<label className=\{labelClass\}>/g, '<FieldLabel>');
c = c.replace(/<\/label>/g, '</FieldLabel>');
c = c.replace(/<textarea \{\.\.\.register\('content\.hero\.title'\)\} rows=\{2\} className="[^"]+" \/>/, "<textarea {...register('content.hero.title')} rows={2} className={InputClass} />");

c = c.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/>/i, '</div>\n        </BlockContainer>\n      </>');

// Match and replace entire Services block (lines roughly 75 to 112)
const servicesBlockRegex = /<div className="mb-4 flex justify-between items-center">\s*<h2 className="text-xl font-bold text-stone-900">服務清單列表<\/h2>\s*<button type="button"[^>]+>\s*<Plus size=\{18\} \/> 新增服務\s*<\/button>\s*<\/div>\s*<div className="space-y-4">\s*\{serviceFields\.map[^]+?<\/div>\s*<\/div>\s*<\/div>\s*\)\)\}\s*<\/div>/m;

let servicesReplacement = `<div className="mb-6 flex justify-between items-center border-b border-stone-200 pb-4">
          <PageMainTitle>服務清單列表</PageMainTitle>
        </div>
        <div className="space-y-6">
          {serviceFields.length === 0 && (
            <div className="p-8 text-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
              <CheckCircle2 className="mx-auto h-8 w-8 text-stone-300 mb-3" />
              <h3 className="text-sm font-bold text-stone-900 mb-1">尚未建立服務清單</h3>
              <p className="text-xs text-stone-500 mb-4">點擊下方按鈕新增服務清單。</p>
            </div>
          )}
          {serviceFields.map((field, index) => (
            <InnerBlockContainer key={field.id}>
              <div className="absolute top-4 right-4 flex items-center gap-1 z-10">
                <button type="button" onClick={() => moveService(index, index - 1)} disabled={index === 0} className="p-1.5 text-stone-400 hover:text-primary disabled:opacity-30 transition-colors bg-white/50 backdrop-blur rounded-lg"><ChevronLeft className="rotate-90" size={16}/></button>
                <button type="button" onClick={() => moveService(index, index + 1)} disabled={index === serviceFields.length - 1} className="p-1.5 text-stone-400 hover:text-primary disabled:opacity-30 transition-colors bg-white/50 backdrop-blur rounded-lg"><ChevronRight className="rotate-90" size={16}/></button>
                <div className="w-px h-4 bg-stone-300 mx-1"></div>
                <button type="button" onClick={() => removeService(index)} className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors bg-white/50 backdrop-blur rounded-lg"><Trash2 size={16}/></button>
              </div>
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-6 h-6 bg-stone-200 rounded text-[10px] font-bold text-stone-500 flex items-center justify-center">{index + 1}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <FieldLabel>連結子項目</FieldLabel>
                    <select 
                      {...register(\`content.services.\${index}.targetPageId\`, {
                        onChange: (e) => handleServiceSelect(index, e.target.value)
                      })} 
                      className={InputClass}
                    >
                      <option value="">-- 請選取子項目 --</option>
                      {subItemPages.map((p: any) => (<option key={p.id} value={p.id}>{p.title}</option>))}
                    </select>
                  </div>
                  <div><FieldLabel>服務名稱</FieldLabel><input {...register(\`content.services.\${index}.title\`)} className={InputClass} /></div>
                  <div><FieldLabel>描述</FieldLabel><textarea {...register(\`content.services.\${index}.description\`)} rows={3} className={InputClass} /></div>
                </div>
                <div><FieldLabel>示意圖片</FieldLabel><Controller control={control} name={\`content.services.\${index}.image\`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} /></div>
              </div>
            </InnerBlockContainer>
          ))}
          <div className="flex justify-center mt-6 pt-4 border-t border-stone-200">
            <button type="button" onClick={() => appendService({ title: '', description: '', image: '', targetPageId: '' })} className={SecondaryBtnClass}>
              <Plus size={18} /> 新增服務
            </button>
          </div>
        </div>`;
c = c.replace(servicesBlockRegex, servicesReplacement);

// Match and replace entire Cases block (lines roughly 114 to end cases)
const casesBlockRegex = /<div className="mb-4 flex justify-between items-center px-2">\s*<h2 className="text-xl font-bold text-stone-900">成功案例管理<\/h2>\s*<button type="button"[^>]+>\s*<Plus size=\{18\} \/> 新增案例\s*<\/button>\s*<\/div>\s*<div className="space-y-4">\s*\{caseFields\.map[^]+?<\/div>\s*<\/div>\s*<\/div>\s*\)\)\}\s*<\/div>/m;

let casesReplacement = `<div className="mb-6 flex justify-between items-center border-b border-stone-200 pb-4">
          <PageMainTitle>成功案例</PageMainTitle>
        </div>
        <div className="space-y-6">
          {caseFields.length === 0 && (
            <div className="p-8 text-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
              <Briefcase className="mx-auto h-8 w-8 text-stone-300 mb-3" />
              <h3 className="text-sm font-bold text-stone-900 mb-1">尚未建立成功案例</h3>
              <p className="text-xs text-stone-500 mb-4">點擊下方按鈕新增成功案例。</p>
            </div>
          )}
          {caseFields.map((field, index) => (
            <InnerBlockContainer key={field.id}>
              <div className="absolute top-4 right-4 flex items-center gap-1 z-10">
                <button type="button" onClick={() => moveCase(index, index - 1)} disabled={index === 0} className="p-1.5 text-stone-400 hover:text-primary disabled:opacity-30 transition-colors bg-white/50 backdrop-blur rounded-lg"><ChevronLeft className="rotate-90" size={16}/></button>
                <button type="button" onClick={() => moveCase(index, index + 1)} disabled={index === caseFields.length - 1} className="p-1.5 text-stone-400 hover:text-primary disabled:opacity-30 transition-colors bg-white/50 backdrop-blur rounded-lg"><ChevronRight className="rotate-90" size={16}/></button>
                <div className="w-px h-4 bg-stone-300 mx-1"></div>
                <button type="button" onClick={() => removeCase(index)} className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors bg-white/50 backdrop-blur rounded-lg"><Trash2 size={16}/></button>
              </div>
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-6 h-6 bg-stone-200 rounded text-[10px] font-bold text-stone-500 flex items-center justify-center">{index + 1}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <div className="space-y-4">
                  <div><FieldLabel>案例名稱</FieldLabel><input {...register(\`content.cases.\${index}.title\`)} className={InputClass} /></div>
                  <div><FieldLabel>分類標籤</FieldLabel><input {...register(\`content.cases.\${index}.tag\`)} className={InputClass} /></div>
                  <div><FieldLabel>案例描述</FieldLabel><textarea {...register(\`content.cases.\${index}.description\`)} rows={3} className={InputClass} /></div>
                </div>
                <div><FieldLabel>成果照</FieldLabel><Controller control={control} name={\`content.cases.\${index}.image\`} render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />} /></div>
              </div>
            </InnerBlockContainer>
          ))}
          <div className="flex justify-center mt-6 pt-4 border-t border-stone-200">
            <button type="button" onClick={() => appendCase({ title: '', description: '', image: '', tag: '' })} className={SecondaryBtnClass}>
              <Plus size={18} /> 新增案例
            </button>
          </div>
        </div>`;

c = c.replace(casesBlockRegex, casesReplacement);

// form section
c = c.replace(/<div className="mb-4">\s*<h2 className="text-xl font-bold text-stone-900">頁尾表單設定<\/h2>\s*<\/div>\s*<div className=\{cardClass\}>/g, '<div className="mb-6 flex justify-between items-center border-b border-stone-200 pb-4"><PageMainTitle>頁尾表單設定</PageMainTitle></div><BlockContainer>');
// ending for BlockContainer in form section
c = c.replace(/ className=\{inputClass\}/g, ' className={InputClass}');
c = c.replace(/<\/div>\s*<\/>\s*\);\s*\}\s*return null;/m, '</div></BlockContainer></>);\n  }\n\n  return null;');

fs.writeFileSync('src/pages/admin/editors/MajorItemEditor.tsx', c);
