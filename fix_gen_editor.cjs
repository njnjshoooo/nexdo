const fs = require('fs');

function processFile() {
  const path = 'src/pages/admin/editors/GeneralEditor.tsx';
  let content = fs.readFileSync(path, 'utf8');

  // Replace <Label> -> <FieldLabel>
  content = content.replace(/<Label>/g, '<FieldLabel>');
  content = content.replace(/<\/Label>/g, '</FieldLabel>');

  // Replace <Input ... /> -> <input className={InputClass} ... />
  // Careful not to match <input if already lowercased? Actually we can map replacing <Input to <input
  content = content.replace(/<Input\b([^>]*)\/?>/g, (match, props) => {
    // some inputs might have className. Overriding className for admin specs.
    // just strip existing className and inject the unified one
    let newProps = props.replace(/className="[^"]*"/, '');
    return `<input className={InputClass} ${newProps.trim()} />`;
  });

  // Replace <Textarea ... /> -> <textarea className={InputClass} ... />
  content = content.replace(/<Textarea\b([^>]*)>/g, (match, props) => {
    let newProps = props.replace(/className="[^"]*"/, '');
    return `<textarea className={InputClass} ${newProps.trim()}>`;
  });
  content = content.replace(/<\/Textarea>/g, '</textarea>');

  // Ensure <Select hasn't broken. If used, replace with native select
  content = content.replace(/<Select\b([^>]*)>/g, (match, props) => {
    let newProps = props.replace(/className="[^"]*"/, '');
    return `<select className={InputClass} ${newProps.trim()}>`;
  });
  content = content.replace(/<\/Select>/g, '</select>');

  // Buttons were <Button ...>
  content = content.replace(/<Button([^>]*)>/g, (match, props) => {
    // we convert them to generic admin buttons. 
    // Wait, the primary button in other files is: className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm"
    // secondary is inline styles often.
    // Check if it's variant="outline"
    let isOutline = props.includes('variant="outline"');
    let btnClass = isOutline ? "bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap" : "bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm";
    
    let newProps = props.replace(/className="[^"]*"/, '')
                        .replace(/variant="[^"]*"/, '')
                        .replace(/size="[^"]*"/, '');

    return `<button type="button" className="${btnClass}" ${newProps.trim()}>`;
  });
  content = content.replace(/<\/Button>/g, '</button>');


  fs.writeFileSync(path, content);
}

processFile();
