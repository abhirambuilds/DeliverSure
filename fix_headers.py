import os
import glob

files = glob.glob('c:/Projects/WeatherShieldApp/backend/app/routers/*.py')

for f in files:
    with open(f, 'r') as file:
        content = file.read()
    
    # Replace Header(...) with Header(None)
    new_content = content.replace('Header(...)', 'Header(None)')
    
    if new_content != content:
        with open(f, 'w') as file:
            file.write(new_content)
        print(f"Updated {f}")
