content = open('context/AuthContext.tsx', 'r', encoding='utf-8').read()
content = content.replace(
    "import * as SecureStore from 'expo-secure-store';",
    "import storage from '@/utils/storage';"
).replace(
    "await SecureStore.getItemAsync(",
    "await storage.getItem("
).replace(
    "await SecureStore.setItemAsync(",
    "await storage.setItem("
).replace(
    "await SecureStore.deleteItemAsync(",
    "await storage.removeItem("
)
with open('context/AuthContext.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('AuthContext.tsx updated')
