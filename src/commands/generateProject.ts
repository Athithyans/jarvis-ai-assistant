import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { LocalModelService } from '../services/localModelService';

export class GenerateProjectCommand {
  private modelService: LocalModelService;

  constructor(modelService: LocalModelService) {
    this.modelService = modelService;
  }

  public async execute(): Promise<void> {
    // Ask for project type
    const projectType = await vscode.window.showQuickPick(
      [
        { label: 'React Application', value: 'react' },
        { label: 'Node.js API', value: 'node-api' },
        { label: 'Express.js Server', value: 'express' },
        { label: 'React Native App', value: 'react-native' },
        { label: 'Vue.js Application', value: 'vue' },
        { label: 'Angular Application', value: 'angular' },
        { label: 'Python Flask API', value: 'flask' },
        { label: 'Django Application', value: 'django' },
        { label: 'HTML/CSS/JS Static Site', value: 'static' },
      ],
      {
        placeHolder: 'Select the type of project to generate',
      }
    );

    if (!projectType) {
      return; // User cancelled
    }

    // Ask for project name
    const projectName = await vscode.window.showInputBox({
      prompt: 'Enter a name for your project',
      placeHolder: 'my-awesome-project',
      validateInput: value => {
        if (!value) {
          return 'Project name is required';
        }
        if (!/^[a-z0-9-_]+$/i.test(value)) {
          return 'Project name can only contain letters, numbers, hyphens, and underscores';
        }
        return null;
      },
    });

    if (!projectName) {
      return; // User cancelled
    }

    // Ask for project location
    const folderUris = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: 'Select Location',
    });

    if (!folderUris || folderUris.length === 0) {
      return; // User cancelled
    }

    const projectLocation = folderUris[0].fsPath;
    const projectPath = path.join(projectLocation, projectName);

    // Check if directory already exists
    if (fs.existsSync(projectPath)) {
      const overwrite = await vscode.window.showWarningMessage(
        `A directory named "${projectName}" already exists at the selected location. Do you want to overwrite it?`,
        'Yes',
        'No'
      );

      if (overwrite !== 'Yes') {
        return; // User cancelled
      }
    }

    // Show progress indicator
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Jarvis is generating your ${projectType.label} project...`,
        cancellable: false,
      },
      async progress => {
        try {
          // Get project structure from the model service
          const projectStructure = await this.modelService.generateProject(
            projectType.value,
            projectName
          );

          // Create project directory
          if (!fs.existsSync(projectPath)) {
            fs.mkdirSync(projectPath, { recursive: true });
          }

          // For demonstration purposes, we'll create a simple project structure
          // In a real implementation, you would parse the projectStructure response
          // and create the actual files and directories

          // Create basic project structure based on project type
          this.createBasicProjectStructure(projectPath, projectType.value, projectName);

          vscode.window.showInformationMessage(
            `Project "${projectName}" has been generated successfully!`
          );

          // Open the project in a new window
          const openInNewWindow = await vscode.window.showInformationMessage(
            'Would you like to open the project in a new window?',
            'Yes',
            'No'
          );

          if (openInNewWindow === 'Yes') {
            vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectPath), true);
          }
        } catch (error) {
          vscode.window.showErrorMessage(`Jarvis encountered an error: ${error}`);
        }
      }
    );
  }

  private createBasicProjectStructure(
    projectPath: string,
    projectType: string,
    projectName: string
  ): void {
    // Create basic structure based on project type
    switch (projectType) {
      case 'react':
        this.createReactProject(projectPath, projectName);
        break;
      case 'node-api':
        this.createNodeApiProject(projectPath, projectName);
        break;
      case 'express':
        this.createExpressProject(projectPath, projectName);
        break;
      case 'static':
        this.createStaticProject(projectPath, projectName);
        break;
      default:
        // For other project types, create a basic structure
        this.createGenericProject(projectPath, projectName, projectType);
        break;
    }
  }

  private createReactProject(projectPath: string, projectName: string): void {
    // Create directories
    fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'src', 'components'), { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'src', 'hooks'), { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'src', 'context'), { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'public'), { recursive: true });

    // Create package.json
    const packageJson = {
      name: projectName,
      version: '0.1.0',
      private: true,
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        'react-scripts': '5.0.1',
      },
      scripts: {
        start: 'react-scripts start',
        build: 'react-scripts build',
        test: 'react-scripts test',
        eject: 'react-scripts eject',
      },
      eslintConfig: {
        extends: ['react-app', 'react-app/jest'],
      },
      browserslist: {
        production: ['>0.2%', 'not dead', 'not op_mini all'],
        development: ['last 1 chrome version', 'last 1 firefox version', 'last 1 safari version'],
      },
    };

    fs.writeFileSync(path.join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2));

    // Create index.js
    const indexJs = `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

    fs.writeFileSync(path.join(projectPath, 'src', 'index.js'), indexJs);

    // Create App.js
    const appJs = `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>${projectName}</h1>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <p>
          Created with Jarvis AI Assistant
        </p>
      </header>
    </div>
  );
}

export default App;
`;

    fs.writeFileSync(path.join(projectPath, 'src', 'App.js'), appJs);

    // Create App.css
    const appCss = `.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}
`;

    fs.writeFileSync(path.join(projectPath, 'src', 'App.css'), appCss);

    // Create index.css
    const indexCss = `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
`;

    fs.writeFileSync(path.join(projectPath, 'src', 'index.css'), indexCss);

    // Create README.md
    const readmeMd = `# ${projectName}

This project was generated with Jarvis AI Assistant.

## Available Scripts

In the project directory, you can run:

### \`npm start\`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### \`npm test\`

Launches the test runner in the interactive watch mode.

### \`npm run build\`

Builds the app for production to the \`build\` folder.
`;

    fs.writeFileSync(path.join(projectPath, 'README.md'), readmeMd);

    // Create public/index.html
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Web site created using Jarvis AI Assistant"
    />
    <title>${projectName}</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
`;

    fs.writeFileSync(path.join(projectPath, 'public', 'index.html'), indexHtml);
  }

  private createNodeApiProject(projectPath: string, projectName: string): void {
    // Create directories
    fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'src', 'controllers'), { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'src', 'models'), { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'src', 'routes'), { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'src', 'middleware'), { recursive: true });

    // Create package.json
    const packageJson = {
      name: projectName,
      version: '1.0.0',
      description: 'Node.js API generated by Jarvis AI Assistant',
      main: 'src/index.js',
      scripts: {
        start: 'node src/index.js',
        dev: 'nodemon src/index.js',
      },
      dependencies: {
        express: '^4.18.2',
        cors: '^2.8.5',
        dotenv: '^16.0.3',
        helmet: '^6.0.1',
      },
      devDependencies: {
        nodemon: '^2.0.20',
      },
    };

    fs.writeFileSync(path.join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2));

    // Create index.js
    const indexJs = `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', require('./routes/api'));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ${projectName} API' });
});

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;

    fs.writeFileSync(path.join(projectPath, 'src', 'index.js'), indexJs);

    // Create routes/api.js
    const apiRoutes = `const express = require('express');
const router = express.Router();

// Example route
router.get('/hello', (req, res) => {
  res.json({ message: 'Hello from Jarvis AI Assistant!' });
});

module.exports = router;
`;

    fs.writeFileSync(path.join(projectPath, 'src', 'routes', 'api.js'), apiRoutes);

    // Create .env file
    const envFile = `PORT=3000
NODE_ENV=development
`;

    fs.writeFileSync(path.join(projectPath, '.env'), envFile);

    // Create README.md
    const readmeMd = `# ${projectName}

This Node.js API was generated with Jarvis AI Assistant.

## Getting Started

1. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`
   npm run dev
   \`\`\`

3. The API will be available at http://localhost:3000

## API Endpoints

- GET / - Welcome message
- GET /api/hello - Example endpoint
`;

    fs.writeFileSync(path.join(projectPath, 'README.md'), readmeMd);
  }

  private createExpressProject(projectPath: string, projectName: string): void {
    // Create directories
    fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'src', 'controllers'), { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'src', 'routes'), { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'src', 'middleware'), { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'public'), { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'views'), { recursive: true });

    // Create package.json
    const packageJson = {
      name: projectName,
      version: '1.0.0',
      description: 'Express.js server generated by Jarvis AI Assistant',
      main: 'src/app.js',
      scripts: {
        start: 'node src/app.js',
        dev: 'nodemon src/app.js',
      },
      dependencies: {
        express: '^4.18.2',
        ejs: '^3.1.8',
        cors: '^2.8.5',
        dotenv: '^16.0.3',
        helmet: '^6.0.1',
        morgan: '^1.10.0',
      },
      devDependencies: {
        nodemon: '^2.0.20',
      },
    };

    fs.writeFileSync(path.join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2));

    // Create app.js
    const appJs = `const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// View engine
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// Routes
app.use('/', require('./routes/index'));

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;

    fs.writeFileSync(path.join(projectPath, 'src', 'app.js'), appJs);

    // Create routes/index.js
    const indexRoutes = `const express = require('express');
const router = express.Router();

// Home page
router.get('/', (req, res) => {
  res.render('index', { title: '${projectName}', message: 'Welcome to ${projectName}!' });
});

// About page
router.get('/about', (req, res) => {
  res.render('about', { title: 'About | ${projectName}' });
});

module.exports = router;
`;

    fs.writeFileSync(path.join(projectPath, 'src', 'routes', 'index.js'), indexRoutes);

    // Create views/index.ejs
    const indexEjs = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= title %></title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <header>
    <h1><%= message %></h1>
    <nav>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  </header>
  
  <main>
    <p>This is a server-side rendered Express.js application generated by Jarvis AI Assistant.</p>
  </main>
  
  <footer>
    <p>&copy; <%= new Date().getFullYear() %> ${projectName}</p>
  </footer>
  
  <script src="/js/main.js"></script>
</body>
</html>
`;

    fs.writeFileSync(path.join(projectPath, 'views', 'index.ejs'), indexEjs);

    // Create views/about.ejs
    const aboutEjs = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= title %></title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <header>
    <h1>About ${projectName}</h1>
    <nav>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  </header>
  
  <main>
    <p>This is the about page of our Express.js application.</p>
    <p>Created with Jarvis AI Assistant.</p>
  </main>
  
  <footer>
    <p>&copy; <%= new Date().getFullYear() %> ${projectName}</p>
  </footer>
  
  <script src="/js/main.js"></script>
</body>
</html>
`;

    fs.writeFileSync(path.join(projectPath, 'views', 'about.ejs'), aboutEjs);

    // Create public/css/style.css
    fs.mkdirSync(path.join(projectPath, 'public', 'css'), { recursive: true });
    const styleCss = `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  background-color: #f4f4f4;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 5px;
}

nav ul {
  display: flex;
  list-style: none;
}

nav ul li {
  margin-right: 15px;
}

nav ul li a {
  text-decoration: none;
  color: #333;
}

nav ul li a:hover {
  color: #0066cc;
}

main {
  min-height: 300px;
  padding: 20px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

footer {
  text-align: center;
  margin-top: 20px;
  padding: 20px;
  background-color: #f4f4f4;
  border-radius: 5px;
}
`;

    fs.writeFileSync(path.join(projectPath, 'public', 'css', 'style.css'), styleCss);

    // Create public/js/main.js
    fs.mkdirSync(path.join(projectPath, 'public', 'js'), { recursive: true });
    const mainJs = `// Main JavaScript file
console.log('${projectName} - Created with Jarvis AI Assistant');

// Add your JavaScript code here
`;

    fs.writeFileSync(path.join(projectPath, 'public', 'js', 'main.js'), mainJs);

    // Create .env file
    const envFile = `PORT=3000
NODE_ENV=development
`;

    fs.writeFileSync(path.join(projectPath, '.env'), envFile);

    // Create README.md
    const readmeMd = `# ${projectName}

This Express.js application was generated with Jarvis AI Assistant.

## Getting Started

1. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`
   npm run dev
   \`\`\`

3. The application will be available at http://localhost:3000

## Pages

- Home: http://localhost:3000/
- About: http://localhost:3000/about
`;

    fs.writeFileSync(path.join(projectPath, 'README.md'), readmeMd);
  }

  private createStaticProject(projectPath: string, projectName: string): void {
    // Create directories
    fs.mkdirSync(path.join(projectPath, 'css'), { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'js'), { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'images'), { recursive: true });

    // Create index.html
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <header>
        <nav>
            <div class="logo">${projectName}</div>
            <ul class="nav-links">
                <li><a href="index.html">Home</a></li>
                <li><a href="about.html">About</a></li>
                <li><a href="contact.html">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section class="hero">
            <div class="hero-content">
                <h1>Welcome to ${projectName}</h1>
                <p>A static website generated by Jarvis AI Assistant</p>
                <button class="cta-button">Learn More</button>
            </div>
        </section>

        <section class="features">
            <h2>Features</h2>
            <div class="feature-cards">
                <div class="card">
                    <h3>Responsive Design</h3>
                    <p>Looks great on all devices, from mobile to desktop.</p>
                </div>
                <div class="card">
                    <h3>Modern Layout</h3>
                    <p>Clean and modern design principles for better user experience.</p>
                </div>
                <div class="card">
                    <h3>Fast Loading</h3>
                    <p>Optimized for performance and quick loading times.</p>
                </div>
            </div>
        </section>
    </main>

    <footer>
        <p>&copy; ${new Date().getFullYear()} ${projectName}. All rights reserved.</p>
        <p>Created with Jarvis AI Assistant</p>
    </footer>

    <script src="js/main.js"></script>
</body>
</html>`;

    fs.writeFileSync(path.join(projectPath, 'index.html'), indexHtml);

    // Create about.html
    const aboutHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About - ${projectName}</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <header>
        <nav>
            <div class="logo">${projectName}</div>
            <ul class="nav-links">
                <li><a href="index.html">Home</a></li>
                <li><a href="about.html">About</a></li>
                <li><a href="contact.html">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section class="about-section">
            <h1>About Us</h1>
            <p>This is a static website generated by Jarvis AI Assistant.</p>
            <p>Replace this content with information about your project or organization.</p>
        </section>
    </main>

    <footer>
        <p>&copy; ${new Date().getFullYear()} ${projectName}. All rights reserved.</p>
        <p>Created with Jarvis AI Assistant</p>
    </footer>

    <script src="js/main.js"></script>
</body>
</html>`;

    fs.writeFileSync(path.join(projectPath, 'about.html'), aboutHtml);

    // Create contact.html
    const contactHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact - ${projectName}</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <header>
        <nav>
            <div class="logo">${projectName}</div>
            <ul class="nav-links">
                <li><a href="index.html">Home</a></li>
                <li><a href="about.html">About</a></li>
                <li><a href="contact.html">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section class="contact-section">
            <h1>Contact Us</h1>
            <form class="contact-form">
                <div class="form-group">
                    <label for="name">Name</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="message">Message</label>
                    <textarea id="message" name="message" rows="5" required></textarea>
                </div>
                <button type="submit" class="submit-button">Send Message</button>
            </form>
        </section>
    </main>

    <footer>
        <p>&copy; ${new Date().getFullYear()} ${projectName}. All rights reserved.</p>
        <p>Created with Jarvis AI Assistant</p>
    </footer>

    <script src="js/main.js"></script>
</body>
</html>`;

    fs.writeFileSync(path.join(projectPath, 'contact.html'), contactHtml);

    // Create CSS
    const stylesCss = `/* Reset and base styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #333;
}

a {
    text-decoration: none;
    color: #333;
}

ul {
    list-style: none;
}

/* Header and Navigation */
header {
    background-color: #fff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
}

nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 5%;
    max-width: 1200px;
    margin: 0 auto;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #4a6cf7;
}

.nav-links {
    display: flex;
}

.nav-links li {
    margin-left: 2rem;
}

.nav-links a {
    transition: color 0.3s;
}

.nav-links a:hover {
    color: #4a6cf7;
}

/* Main content */
main {
    min-height: calc(100vh - 140px);
}

/* Hero section */
.hero {
    background: linear-gradient(135deg, #4a6cf7, #6a3ef7);
    color: white;
    padding: 5rem 1rem;
    text-align: center;
}

.hero-content {
    max-width: 800px;
    margin: 0 auto;
}

.hero h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

.hero p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
}

.cta-button {
    background-color: white;
    color: #4a6cf7;
    border: none;
    padding: 0.8rem 2rem;
    font-size: 1rem;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.3s;
}

.cta-button:hover {
    background-color: #f0f0f0;
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

/* Features section */
.features {
    padding: 5rem 1rem;
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
}

.features h2 {
    font-size: 2rem;
    margin-bottom: 3rem;
    position: relative;
}

.features h2::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 3px;
    background-color: #4a6cf7;
}

.feature-cards {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2rem;
}

.card {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    flex: 1 1 300px;
    max-width: 350px;
    transition: transform 0.3s;
}

.card:hover {
    transform: translateY(-10px);
}

.card h3 {
    color: #4a6cf7;
    margin-bottom: 1rem;
}

/* About section */
.about-section {
    max-width: 800px;
    margin: 0 auto;
    padding: 5rem 1rem;
}

.about-section h1 {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: #4a6cf7;
}

.about-section p {
    margin-bottom: 1rem;
}

/* Contact section */
.contact-section {
    max-width: 600px;
    margin: 0 auto;
    padding: 5rem 1rem;
}

.contact-section h1 {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: #4a6cf7;
}

.contact-form {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    padding: 2rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-family: inherit;
}

.submit-button {
    background-color: #4a6cf7;
    color: white;
    border: none;
    padding: 0.8rem 2rem;
    font-size: 1rem;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.3s;
    display: block;
    width: 100%;
}

.submit-button:hover {
    background-color: #3a5ce5;
}

/* Footer */
footer {
    background-color: #f9f9f9;
    text-align: center;
    padding: 2rem 1rem;
    border-top: 1px solid #eee;
}

/* Responsive design */
@media (max-width: 768px) {
    .nav-links {
        display: none;
    }
    
    .hero h1 {
        font-size: 2rem;
    }
    
    .hero p {
        font-size: 1rem;
    }
    
    .feature-cards {
        flex-direction: column;
        align-items: center;
    }
    
    .card {
        max-width: 100%;
    }
}`;

    fs.writeFileSync(path.join(projectPath, 'css', 'styles.css'), stylesCss);

    // Create JavaScript
    const mainJs = `// Main JavaScript file
document.addEventListener('DOMContentLoaded', function() {
    console.log('${projectName} - Created with Jarvis AI Assistant');
    
    // Get the CTA button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            window.location.href = 'about.html';
        });
    }
    
    // Form submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // In a real application, you would send this data to a server
            console.log('Form submitted:', { name, email, message });
            
            // Show success message
            alert('Thank you for your message! We will get back to you soon.');
            
            // Reset form
            contactForm.reset();
        });
    }
});`;

    fs.writeFileSync(path.join(projectPath, 'js', 'main.js'), mainJs);

    // Create README.md
    const readmeMd = `# ${projectName}

This static website was generated with Jarvis AI Assistant.

## Getting Started

Simply open the \`index.html\` file in your browser to view the website.

## Pages

- Home: index.html
- About: about.html
- Contact: contact.html

## Structure

- \`css/\` - Contains the stylesheet
- \`js/\` - Contains JavaScript files
- \`images/\` - Directory for images (empty by default)

## Customization

Feel free to modify the HTML, CSS, and JavaScript files to customize the website to your needs.
`;

    fs.writeFileSync(path.join(projectPath, 'README.md'), readmeMd);
  }

  private createGenericProject(
    projectPath: string,
    projectName: string,
    projectType: string
  ): void {
    // Create a basic README.md file
    const readmeMd = `# ${projectName}

This ${projectType} project was generated with Jarvis AI Assistant.

## Getting Started

This is a placeholder project structure. You'll need to add the appropriate files and configurations for a ${projectType} project.

## Project Structure

- \`src/\` - Source code directory
- \`README.md\` - This file

## Next Steps

1. Add the necessary dependencies for a ${projectType} project
2. Configure your build system
3. Start coding!
`;

    fs.writeFileSync(path.join(projectPath, 'README.md'), readmeMd);

    // Create src directory
    fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });

    // Create a placeholder file
    fs.writeFileSync(
      path.join(projectPath, 'src', 'index.js'),
      `// Placeholder file for ${projectName}\n// Generated by Jarvis AI Assistant\n`
    );
  }
}
