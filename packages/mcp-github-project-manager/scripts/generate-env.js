#!/usr/bin/env node

/**
 * Script to generate a .env file for the GitHub Project Manager
 * This script prompts the user for their GitHub token and creates a .env file
 */

import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

// Get the directory of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env");
const envExamplePath = path.join(rootDir, ".env.example");

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Main function to generate the .env file
 */
async function generateEnvFile() {
  console.log("GitHub Project Manager - Environment Setup");
  console.log("=========================================");

  try {
    // Check if .env file already exists
    if (fs.existsSync(envPath)) {
      const answer = await promptYesNo(
        "An .env file already exists. Do you want to overwrite it? (y/n): "
      );
      if (!answer) {
        console.log("Setup cancelled. Existing .env file was not modified.");
        process.exit(0);
      }
    }

    // Read the example file if it exists
    let templateContent = "";
    if (fs.existsSync(envExamplePath)) {
      templateContent = fs.readFileSync(envExamplePath, "utf8");
    }

    // Prompt for GitHub token
    const token = await promptInput(
      "Enter your GitHub Personal Access Token: "
    );

    // Create or update the .env file
    let envContent = templateContent;
    if (envContent.includes("GITHUB_PERSONAL_TOKEN=")) {
      // Replace the token in the template
      envContent = envContent.replace(
        /GITHUB_PERSONAL_TOKEN=.*/,
        `GITHUB_PERSONAL_TOKEN=${token}`
      );
    } else {
      // Add the token if not in template
      envContent += `\nGITHUB_PERSONAL_TOKEN=${token}\n`;
    }

    // Write the .env file
    fs.writeFileSync(envPath, envContent);
    console.log(`\n.env file created successfully at: ${envPath}`);
    console.log("You can now run the GitHub Project Manager server.");
  } catch (error) {
    console.error("Error generating .env file:", error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

/**
 * Prompt for yes/no input
 * @param {string} question - The question to ask
 * @returns {Promise<boolean>} - True for yes, false for no
 */
function promptYesNo(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

/**
 * Prompt for text input
 * @param {string} question - The question to ask
 * @returns {Promise<string>} - The user's input
 */
function promptInput(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Run the script
generateEnvFile();
