# Server Deployment Instructions

## cPanel Deployment

1. Upload the server files to your cPanel account's `investuptrading.com/public_html/backend` directory

2. Make sure the following files are in the root directory:
   - `server.js` - Main ES Module application
   - `index.cjs` - CommonJS wrapper for LiteSpeed
   - `.htaccess` - LiteSpeed configuration
   - `package.json` - Dependencies and configuration
   - `.env` - Environment variables

3. In cPanel, set up the Node.js application:
   - Go to the Node.js App section in cPanel
   - Create a new application
   - Set the application path to the public_html directory
   - Set the application URL to your domain (investuptrading.com/public/backend)
   - Set the Application startup file to `index.cjs`
   - Set Node.js version to 20.x
   - Enable the application

4. Install dependencies:
   - Connect to your server via SSH
   - Navigate to the application directory
   - Run `npm install`

5. Restart the Node.js application from cPanel.

## Troubleshooting

If you encounter module errors:
- Check that both `server.js` and `index.cjs` are in the root directory
- Verify the .htaccess file is properly uploaded
- Make sure the Node.js version is set to 20.x
- Check LiteSpeed configuration to ensure it's handling Node.js properly 