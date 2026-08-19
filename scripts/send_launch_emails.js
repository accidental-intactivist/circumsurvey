import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const LIST_PATH = path.resolve('C:/work/circumsurvey/circumsurvey_invite_list.txt');
const HTML_PATH = path.resolve(__dirname, '../src/assets/emails/launch_email.html');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('ERROR: Missing GMAIL_USER or GMAIL_APP_PASSWORD in .env');
    process.exit(1);
  }

  if (!fs.existsSync(LIST_PATH)) {
    console.error(`ERROR: Could not find ${LIST_PATH}.`);
    process.exit(1);
  }

  // Load HTML template
  const htmlTemplate = fs.readFileSync(HTML_PATH, 'utf-8');

  // Configure Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });

  // Test connection
  try {
    await transporter.verify();
    console.log('Successfully connected to Gmail SMTP server.');
  } catch (error) {
    console.error('Failed to connect to Gmail:', error);
    process.exit(1);
  }

  const isTest = process.argv.includes('--test');
  let contacts = [];

  if (isTest) {
    console.log('--- TEST MODE: Only sending to Anthonio@gmail.com ---');
    contacts = ['Anthonio@gmail.com'];
  } else {
    // Read TXT list
    const fileContent = fs.readFileSync(LIST_PATH, 'utf-8');
    contacts = fileContent
      .split('\n')
      .map(email => email.trim())
      .filter(email => email.length > 0 && email.includes('@'));
  }
  
  console.log(`Loaded ${contacts.length} emails. Beginning batch send...`);

  for (let i = 0; i < contacts.length; i++) {
    const email = contacts[i];

    const mailOptions = {
      from: '"Tone (The Accidental Intactivist)" <tone@circumsurvey.online>',
      to: email,
      subject: 'The Phase 1 Data is Ready.',
      html: htmlTemplate
    };

    try {
      console.log(`Sending (${i + 1}/${contacts.length}) to ${email}...`);
      await transporter.sendMail(mailOptions);
      console.log(`  -> Sent successfully.`);
    } catch (err) {
      console.error(`  -> Failed to send to ${email}:`, err.message);
    }

    // Stagger sends by 2.5 seconds to avoid Gmail rate limits
    if (i < contacts.length - 1) {
      await sleep(2500);
    }
  }
  
  console.log('Batch sending complete!');
}

run();
