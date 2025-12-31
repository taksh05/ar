# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Deploying to Vercel (quick)

You can deploy this Create React App to Vercel as a static site. Vercel will run `npm run build` and serve the contents of the `build/` folder.

Two common ways:

- Git integration (recommended for continuous deploys):
  1. Push your repository to GitHub/GitLab/Bitbucket.
 2. Sign in to https://vercel.com and import the repository.
 3. Vercel detects Create React App and uses `npm run build`. Deploy.

- CLI (quick one-off deploy):
  1. Install the Vercel CLI (optional):
	  ```powershell
	  npm i -g vercel
	  # or use npx
	  npx vercel login
	  ```
  2. From the project root run:
	  ```powershell
	  npm run build
	  npx vercel --prod
	  ```

Notes specific to AR models in `/public/models`:
- Some clients (Quick Look / Scene Viewer) depend on Content-Type headers for .usdz and .glb. To ensure Vercel serves correct MIME types we've added a `vercel.json` that sets headers for these assets. If you use a different host, please ensure `.usdz` is served with a suitable Content-Type (for example `model/vnd.usdz+zip`) and `.glb` as `model/gltf-binary`.

Troubleshooting:
- If a phone shows "site can't be reached" after scanning a QR, ensure the QR points to the deployed HTTPS URL (not `localhost`).
- For iOS Quick Look prefer an HTTPS URL.

Automatic / CI deploy (recommended)

If you want a hands-off deploy triggered on every push to `main`, add a Vercel token to the repository secrets and the included GitHub Actions workflow will deploy automatically.

1. Create a Vercel token: https://vercel.com/account/tokens
2. In your GitHub repository settings, add a secret named `VERCEL_TOKEN` with that token.
3. Push your code to `main` — the workflow in `.github/workflows/deploy-vercel.yml` will run and deploy to Vercel.

Local non-interactive deploy script

If you prefer to deploy from your machine non-interactively, set `VERCEL_TOKEN` in your PowerShell environment and run the helper script:

```powershell
$env:VERCEL_TOKEN='PASTE_YOUR_TOKEN_HERE'
.\scripts\deploy-vercel.ps1
```

Interactive one-off deploy

Alternatively run with npx (interactive login):

```powershell
npx vercel --prod
```

Verification (after deploy)

Replace `example.com` below with your deployed domain and run these PowerShell commands to verify the AR page and asset headers:

```powershell
# save AR page HTML
Invoke-WebRequest -UseBasicParsing 'https://example.com/#/ar' -OutFile page.html

# check GLB headers
Invoke-WebRequest -Method Head -UseBasicParsing 'https://example.com/models/porsche.glb'

# check USDZ headers
Invoke-WebRequest -Method Head -UseBasicParsing 'https://example.com/models/porsche.usdz'
```

If anything returns 404 or the Content-Type is incorrect, paste the results here and I'll provide the exact fix for the hosting configuration or update `vercel.json` accordingly.

If you'd like, I can also prepare a CI workflow that deploys only when you add a `VERCEL_PROJECT_ID` and `VERCEL_ORG_ID` so the deploy is linked to an existing Vercel project (optional).
