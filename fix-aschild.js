const fs = require('fs');
const path = require('path');

const dir = 'c:\\web develoment\\odoo_ERP\\shiv-erp\\src\\app\\(erp)';

function walk(directory) {
  let files = [];
  const list = fs.readdirSync(directory);
  for (const file of list) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      files = files.concat(walk(filePath));
    } else if (file.endsWith('.tsx')) {
      files.push(filePath);
    }
  }
  return files;
}

const files = walk(dir);

let fixedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;

  // Replace Button asChild wrapping a Link with Link styled via buttonVariants
  const btnRegex = /<Button\s+asChild(?:\s+className="(.*?)")?>\s*<Link\s+href={(.*?)}\s*>(.*?)<\/Link>\s*<\/Button>/gs;
  const btnRegex2 = /<Button\s+asChild(?:\s+className="(.*?)")?>\s*<Link\s+href="(.*?)"\s*>(.*?)<\/Link>\s*<\/Button>/gs;
  
  if (btnRegex.test(content) || btnRegex2.test(content)) {
    // Add imports if missing
    if (!content.includes('buttonVariants')) {
      content = content.replace('import { Button } from "@/components/ui/button";', 'import { Button, buttonVariants } from "@/components/ui/button";');
    }
    if (!content.includes('import { cn }')) {
      content = content.replace('import { Button', 'import { cn } from "@/lib/utils";\nimport { Button');
    }
    
    content = content.replace(btnRegex, (match, className, href, inner) => {
      const cls = className ? `cn(buttonVariants(), "${className}")` : `buttonVariants()`;
      return `<Link href={${href}} className={${cls}}>${inner}</Link>`;
    });

    content = content.replace(btnRegex2, (match, className, href, inner) => {
      const cls = className ? `cn(buttonVariants(), "${className}")` : `buttonVariants()`;
      return `<Link href="${href}" className={${cls}}>${inner}</Link>`;
    });
    
    // Some buttons have variant="outline"
    const btnRegex3 = /<Button\s+variant="(.*?)"\s+asChild>\s*<Link\s+href="(.*?)"\s*>(.*?)<\/Link>\s*<\/Button>/gs;
    const btnRegex4 = /<Button\s+variant="(.*?)"\s+asChild>\s*<Link\s+href={(.*?)}\s*>(.*?)<\/Link>\s*<\/Button>/gs;
    
    content = content.replace(btnRegex3, (match, variant, href, inner) => {
      return `<Link href="${href}" className={cn(buttonVariants({ variant: "${variant}" }))}>${inner}</Link>`;
    });
    content = content.replace(btnRegex4, (match, variant, href, inner) => {
      return `<Link href={${href}} className={cn(buttonVariants({ variant: "${variant}" }))}>${inner}</Link>`;
    });

    changed = true;
  }

  // Replace DropdownMenuTrigger asChild
  const dropTrigRegex = /<DropdownMenuTrigger\s+asChild>\s*<Button\s+variant="(.*?)"\s+className="(.*?)"(.*?)>\s*(.*?)\s*<\/Button>\s*<\/DropdownMenuTrigger>/gs;
  if (dropTrigRegex.test(content)) {
    content = content.replace(dropTrigRegex, (match, variant, className, otherProps, inner) => {
      return `<DropdownMenuTrigger render={<Button variant="${variant}" className="${className}" ${otherProps} />}>\n  ${inner}\n</DropdownMenuTrigger>`;
    });
    changed = true;
  }
  
  // Replace DropdownMenuItem asChild
  const dropItemRegex = /<DropdownMenuItem\s+asChild>\s*<Link\s+href="(.*?)"\s*>(.*?)<\/Link>\s*<\/DropdownMenuItem>/gs;
  const dropItemRegex2 = /<DropdownMenuItem\s+asChild>\s*<Link\s+href={(.*?)}\s*>(.*?)<\/Link>\s*<\/DropdownMenuItem>/gs;
  
  if (dropItemRegex.test(content)) {
    content = content.replace(dropItemRegex, (match, href, inner) => {
      return `<DropdownMenuItem render={<Link href="${href}" />}>\n  ${inner}\n</DropdownMenuItem>`;
    });
    changed = true;
  }
  if (dropItemRegex2.test(content)) {
    content = content.replace(dropItemRegex2, (match, href, inner) => {
      return `<DropdownMenuItem render={<Link href={${href}} />}>\n  ${inner}\n</DropdownMenuItem>`;
    });
    changed = true;
  }

  // Fix manufacturing-client.tsx special case
  const specialMfg = /<Button\s+variant="ghost"\s+size="sm"\s+asChild\s+className="(.*?)"\s*>\s*<Link\s+href={(.*?)}>\s*(.*?)\s*<\/Link>\s*<\/Button>/gs;
  if (specialMfg.test(content)) {
    content = content.replace(specialMfg, (match, className, href, inner) => {
      return `<Link href={${href}} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "${className}")}>\n  ${inner}\n</Link>`;
    });
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Fixed ${file}`);
    fixedCount++;
  }
}

console.log(`Total files fixed: ${fixedCount}`);
