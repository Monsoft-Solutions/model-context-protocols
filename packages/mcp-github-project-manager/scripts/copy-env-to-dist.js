#!/usr/bin/env node

/**
 * Script to copy the .env file to the dist folder during build
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env");
const envExamplePath = path.join(rootDir, ".env.example");
const distDir = path.join(rootDir, "dist");

/**
 * Copy the .env file to the dist folder
 */
function copyEnvToDist() {
  console.log("Copying environment files to dist folder...");

  // Create dist directory if it doesn't exist
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Copy .env file if it exists
  if (fs.existsSync(envPath)) {
    fs.copyFileSync(envPath, path.join(distDir, ".env"));
    console.log("✅ Copied .env file to dist folder");
  } else {
    console.log("⚠️ No .env file found in project root");

    // If .env doesn't exist but .env.example does, copy that instead
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, path.join(distDir, ".env.example"));
      console.log("✅ Copied .env.example file to dist folder");
    }
  }
}

// Run the script
copyEnvToDist();
