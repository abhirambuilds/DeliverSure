const fs = require('fs');
const glob = require('glob');

const themeContextPath = 'context/ThemeContext.tsx';
let themeContext = fs.readFileSync(themeContextPath, 'utf8');
if(!themeContext.includes('export const ThemeContext')) {
  themeContext = themeContext.replace('const ThemeContext = createContext', 'export const ThemeContext = createContext');
}
fs.writeFileSync(themeContextPath, themeContext);

const targetFiles = [
  'app/admin/dashboard.tsx',
  'app/admin/risk.tsx',
  'app/admin/fraud.tsx',
  'app/admin/lossratio.tsx',
  'app/admin/claims.tsx'
];

targetFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add import if not exists
    if (!content.includes('ThemeContext')) {
      content = content.replace(
        "import { StyleSheet", 
        "import { useContext } from 'react';\nimport { ThemeContext } from '../../context/ThemeContext';\nimport { StyleSheet"
      );
    }

    // Inside component body, destruction
    const compMatch = content.match(/export default function \w+\([^)]*\)\s*\{/);
    if (compMatch && !content.includes('const { isDark')) {
      content = content.replace(
        compMatch[0],
        compMatch[0] + '\n  const { isDark, toggleTheme } = useContext(ThemeContext) as any;'
      );
    }

    // Change styles dynamically. We need to convert `const styles = StyleSheet.create({`
    // to `const getStyles = (isDark: boolean) => StyleSheet.create({`
    if (content.includes('const styles = StyleSheet.create({')) {
      content = content.replace(
        'const styles = StyleSheet.create({',
        'const getStyles = (isDark: boolean) => StyleSheet.create({'
      );
      
      // Inject getStyles invocation inside component
      if (!content.includes('const styles = getStyles(isDark)')) {
        content = content.replace(
          'const { isDark, toggleTheme } = useContext(ThemeContext)',
          'const { isDark, toggleTheme } = useContext(ThemeContext);\n  const styles = getStyles(isDark);'
        );
      }

      // Replace hardcoded values inside getStyles structure
      content = content.replace(/'#121212'/g, "isDark ? '#0f0f0f' : '#f5f5f5'");
      content = content.replace(/'#1e1e1e'/g, "isDark ? '#1c1c1c' : '#ffffff'");
      
      // We must be careful replacing #ffffff because icon colors or button texts might be explicitly white. 
      // But user requested text: isDark ? "#ffffff" : "#000000"
      content = content.replace(/color: '#ffffff'/g, "color: isDark ? '#ffffff' : '#000000'");
      content = content.replace(/color: '#a0a0a0'/g, "color: isDark ? '#aaa' : '#555'");
      content = content.replace(/color: '#888888'/g, "color: isDark ? '#aaa' : '#555'");
      
      // Let's replace border colors safely
      content = content.replace(/borderColor: '#333333'/g, "borderColor: isDark ? '#333333' : '#e0e0e0'");
      content = content.replace(/borderBottomColor: '#333333'/g, "borderBottomColor: isDark ? '#333333' : '#e0e0e0'");
      content = content.replace(/borderBottomColor: '#2a2a2a'/g, "borderBottomColor: isDark ? '#2a2a2a' : '#e0e0e0'");
    }

    // Switch for the dashboard toggle
    if (file === 'app/admin/dashboard.tsx') {
      content = content.replace('const [isDarkMode, setIsDarkMode] = useState(true);', '');
      content = content.replace(/isDarkMode/g, 'isDark');
      content = content.replace(/setIsDarkMode\(prev => !prev\)/g, 'toggleTheme()');
    }

    fs.writeFileSync(file, content);
  }
});

console.log('Codemods done!');
