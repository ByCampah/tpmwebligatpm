import os
import re

for root, dirs, files in os.walk('src/app'):
    for file in files:
        if file.endswith('.tsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = re.sub(
                r'const cookieStore = await cookies\(\);\s*const locale = \(cookieStore\.get\("locale"\)\?\.value \|\| "es"\) as "es" \| "en" \| "pt";',
                'const locale = "es";',
                content
            )
            
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'Updated {path}')
