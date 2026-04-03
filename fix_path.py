content = open('src/services/api.js', 'r', encoding='utf-8').read()
content = content.replace('../../utils/storage', '../../utils/storage').replace('../utils/storage', '../../utils/storage')
with open('src/services/api.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('Fixed!')
