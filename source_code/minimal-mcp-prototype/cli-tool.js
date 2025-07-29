#!/usr/bin/env node
// CLI tool for user and project management

const fs = require('fs').promises;
const path = require('path');

const USERS_DIR = path.join(__dirname, 'users');
const MODULES_DIR = path.join(__dirname, 'modules');

// Create a new user
async function createUser(username) {
  try {
    const userDir = path.join(USERS_DIR, username);
    
    // Create user directory structure
    await fs.mkdir(path.join(userDir, 'projects'), { recursive: true });
    await fs.mkdir(path.join(userDir, 'profile'), { recursive: true });
    
    // Create user profile
    const profile = {
      username: username,
      created: new Date().toISOString(),
      projects: []
    };
    
    await fs.writeFile(
      path.join(userDir, 'profile', 'user.json'), 
      JSON.stringify(profile, null, 2)
    );
    
    console.log(`✅ User '${username}' created successfully`);
    console.log(`📁 Directory: ${userDir}`);
    
  } catch (error) {
    console.error(`❌ Error creating user '${username}':`, error.message);
  }
}

// List all users
async function listUsers() {
  try {
    const users = await fs.readdir(USERS_DIR);
    console.log('📋 Users:');
    for (const user of users) {
      const profilePath = path.join(USERS_DIR, user, 'profile', 'user.json');
      try {
        const profile = JSON.parse(await fs.readFile(profilePath, 'utf8'));
        console.log(`  - ${user} (created: ${profile.created})`);
      } catch {
        console.log(`  - ${user} (no profile)`);
      }
    }
  } catch (error) {
    console.error('❌ Error listing users:', error.message);
  }
}

// Create project from module
async function createProject(username, projectName, moduleId) {
  try {
    const modulePath = path.join(MODULES_DIR, moduleId);
    const userProjectPath = path.join(USERS_DIR, username, 'projects', projectName);
    
    // Check if module exists
    try {
      await fs.access(modulePath);
    } catch {
      throw new Error(`Module '${moduleId}' not found`);
    }
    
    // Check if user exists
    const userPath = path.join(USERS_DIR, username);
    try {
      await fs.access(userPath);
    } catch {
      throw new Error(`User '${username}' not found`);
    }
    
    // Copy module to user project
    await copyDirectoryRecursive(modulePath, userProjectPath);
    
    console.log(`✅ Project '${projectName}' created for user '${username}' from module '${moduleId}'`);
    console.log(`📁 Project directory: ${userProjectPath}`);
    
  } catch (error) {
    console.error(`❌ Error creating project:`, error.message);
  }
}

// List projects for a user
async function listProjects(username) {
  try {
    const userProjectsDir = path.join(USERS_DIR, username, 'projects');
    const projects = await fs.readdir(userProjectsDir);
    
    console.log(`📋 Projects for user '${username}':`);
    for (const project of projects) {
      console.log(`  - ${project}`);
    }
    
  } catch (error) {
    console.error(`❌ Error listing projects for '${username}':`, error.message);
  }
}

// Recursive directory copy
async function copyDirectoryRecursive(source, destination) {
  await fs.mkdir(destination, { recursive: true });
  const items = await fs.readdir(source, { withFileTypes: true });
  
  for (const item of items) {
    const sourcePath = path.join(source, item.name);
    const destPath = path.join(destination, item.name);
    
    if (item.isDirectory()) {
      await copyDirectoryRecursive(sourcePath, destPath);
    } else {
      await fs.copyFile(sourcePath, destPath);
    }
  }
}

// Validate directory structure
async function validateStructure(username) {
  try {
    const userDir = path.join(USERS_DIR, username);
    const profilePath = path.join(userDir, 'profile', 'user.json');
    const projectsDir = path.join(userDir, 'projects');
    
    console.log(`🔍 Validating structure for user '${username}':`);
    
    // Check user directory
    await fs.access(userDir);
    console.log(`  ✅ User directory exists`);
    
    // Check profile
    await fs.access(profilePath);
    console.log(`  ✅ User profile exists`);
    
    // Check projects directory
    await fs.access(projectsDir);
    console.log(`  ✅ Projects directory exists`);
    
    // List projects
    const projects = await fs.readdir(projectsDir);
    console.log(`  📁 Projects: ${projects.length} found`);
    for (const project of projects) {
      console.log(`    - ${project}`);
    }
    
    console.log(`✅ Structure validation complete for '${username}'`);
    
  } catch (error) {
    console.error(`❌ Structure validation failed for '${username}':`, error.message);
  }
}

// Command line argument parsing
async function main() {
  const command = process.argv[2];
  const arg1 = process.argv[3];
  const arg2 = process.argv[4];
  const arg3 = process.argv[5];

  switch(command) {
    case 'create-user':
      if (!arg1) {
        console.error('❌ Usage: node cli-tool.js create-user <username>');
        process.exit(1);
      }
      await createUser(arg1);
      break;
      
    case 'list-users':
      await listUsers();
      break;
      
    case 'create-project':
      if (!arg1 || !arg2 || !arg3) {
        console.error('❌ Usage: node cli-tool.js create-project <username> <project-name> <module-id>');
        process.exit(1);
      }
      await createProject(arg1, arg2, arg3);
      break;
      
    case 'list-projects':
      if (!arg1) {
        console.error('❌ Usage: node cli-tool.js list-projects <username>');
        process.exit(1);
      }
      await listProjects(arg1);
      break;
      
    case 'validate-structure':
      if (!arg1) {
        console.error('❌ Usage: node cli-tool.js validate-structure <username>');
        process.exit(1);
      }
      await validateStructure(arg1);
      break;
      
    default:
      console.log('🛠️  AI Context Service - CLI Management Tool');
      console.log('');
      console.log('Commands:');
      console.log('  create-user <username>                           Create a new user');
      console.log('  list-users                                       List all users');
      console.log('  create-project <username> <project-name> <module-id>  Create project from module');
      console.log('  list-projects <username>                         List user projects');
      console.log('  validate-structure <username>                    Validate user structure');
      console.log('');
      console.log('Examples:');
      console.log('  node cli-tool.js create-user alice');
      console.log('  node cli-tool.js create-project alice my-effectiveness personal-effectiveness-v1');
      console.log('  node cli-tool.js list-projects alice');
  }
}

// Run CLI
if (require.main === module) {
  main().catch(error => {
    console.error('❌ CLI Error:', error.message);
    process.exit(1);
  });
}

module.exports = {
  createUser,
  listUsers,
  createProject,
  listProjects,
  validateStructure,
  copyDirectoryRecursive
};