# bills-downloader-ireland
Selection of Node.js scripts you can use to download utility bills from some companies in Ireland.

Here you will find scripts for:
- [Virgin Media Ireland](README.md#virgin-media-ireland-bill-downloader-nodejs-script)
- [SSE Aitricity Ireland](README.md#sse-airtricity-ireland-bill-downloader-nodejs-script)
- [Vodafone Ireland](README.md#vodafone-ireland-bill-downloader-nodejs-script)
- [Three Ireland](README.md#three-ireland-bill-downloader-nodejs-script)
- [Bord Gais Energy Ireland](README.md#bord-gais-energy-ireland-bill-downloader-nodejs-script)

Initially, they are for Node.js, but I have plans to have Bash or PowerShell versions of them, if anyone needs that (let me know).


## Installation and usage

- In order to use the scripts provided, you need to have Node.js installed in your computer. You can download it at https://nodejs.org/
- Click on `Download Node.js (LTS)` and install it on your computer.
- After installed, download the script you want to download the bills.
- You need to edit the script to add your `token`, `cookie` or `account number`
  - Open the script on Notepad or any other text editor
  - Look for the line called `USER CONFIGURATION`. It is somewhere around lines 30 and 35.
  - Replace the values `YOUR_COOKIE_HERE`, `YOUR_TOKEN_HERE`, `YOUR_ACCOUNT_NUMBER`, depending on the script.
  - Save the file.
- Go to the folder you downloaded the script and open a terminal.
  - Click on the folder address bar and type `cmd` to open a terminal.
  - Type `node script-name.mjs` to run the script.
- You can see more instructions on the specific section for each script.


## Virgin Media Ireland Bill Downloader (Node.js Script)

Company: _Virgin Media Ireland_

File name: `virgin-media-ireland.mjs`

This script downloads all your Virgin Media bills in PDF format, even if they're no longer available through the website.

✅ What you need to do:
1. Get your *token* and *account number* from the Virgin Media website.
2. Set those values (along with the desired start year) in the **USER CONFIGURATION** section of the script.
3. Run the script using: `node virgin-media-ireland.mjs`

The script will fetch bills from your chosen start year up to the current year. Any errors encountered will be saved in the file `Errors found.txt`.

🔑 How to get your token:
- Log in to the Virgin Media website.
- Open your browser's DevTools (press F12), then go to the Console tab.
- Run the following command and copy the result:
  
    `localStorage["lgi-oidc-uxp-idToken"] + ',Atmosphere atmosphere_app_id="AEM_IE"'`
- The token will be valid for about 20 minutes. If it expires, repeat the step above.

💡 This code was tested with Node.js version 22, but should work in other versions too

## SSE Airtricity Ireland Bill Downloader (Node.js script)
Company: _SSE Aitricity_

File name: `sse-airtricity-ireland.mjs`

This script downloads all your SSE Airtricity bills in PDF format, even if they're no longer available through the website.

✅ What you need to do:
1. Get your *token* and *account number* from the SSE Airtricity website.
2. Set those values in the **USER CONFIGURATION** section of the script.
3. Run the script using: `node sse-airtricity-ireland.js`

The script will fetch bills from all period. Any errors encountered will be saved in a file called `Errors found.txt`.

🔑 How to get your token:
- Log in to the SSE Airtricity website.
- Open your browser's DevTools (press F12), then go to the Console tab.
- Run the following command:
  
    `JSON.parse(localStorage.authorizationResult).access_token`
- The token will be valid for about 60 minutes. If it expires, repeat the step above.

💡 This code was tested with Node.js version 22, but should work in other versions too.


## Vodafone Ireland Bill Downloader (Node.js script)
Company: _Vodafone Ireland_

File name: `vodafone-ireland.mjs`

This script downloads all your Vodafone bills in PDF format, even if they're no longer available through the website.

✅ What you need to do:
1. Get your *cookie* from the Vodafone website. Instructions below.
2. Set the value in *USER CONFIGURATION* section.
3. Run the script using: `node vodafone-ireland.mjs`

The script will try to fetch all bills in your account. Any errors encountered will be saved in a file called `Errors found.txt`.

🔑 How to get your cookie:
- The easiest way to copy the cookies value is installing a browser extension like `Cookie-Editor`: https://cookie-editor.com
- Install the extension and after that, login to the Vodafone website.
- After login, click on Cookie-Editor extension icon > Export icon (bottom right) > Header String
- The value will be copied to the clipboard, just paste it in the code where it says 'YOUR_COOKIE_HERE'.

**Technical information (just out of curiosity):**

The only important cookie values are `OAMAuthnCookie_n.vodafone.ie:443` and `SHIROCOOKIE`. 

If you want, you can copy just those ones, separating them by semicolon, on the cookie variable: `OAMAuthnCookie_n.vodafone.ie:443=VALUE_HERE; SHIROCOOKIE=VALUE_HERE`

💡 This code was tested with Node.js version 22, but should work in other versions too.



## Three Ireland Bill Downloader (Node.js script)
Company: _Three Ireland_

File name: `three-ireland.mjs`

This script downloads all your Three bills in PDF format, even if they're no longer available through the website.

✅ What you need to do:
1. Get your *cookie* and *account number* from the Three website. Instructions below.
2. Set the value in *USER CONFIGURATION* section.
3. Run the script using: `node three-ireland.mjs`

The script will try to fetch all bills in your account. Any errors encountered will be saved in a file called `Errors found.txt`.

🔑 How to get your cookie:
- The easiest way to copy the cookies value is installing a browser extension like `Cookie-Editor`: https://cookie-editor.com
- Install the extension and after that, login to the Three website.
- After login, click on Cookie-Editor extension icon > Export icon (bottom right) > Header String
- The value will be copied to the clipboard, just paste it in the code where it says 'YOUR_COOKIE_HERE'.

**Technical information (just out of curiosity):**

The only important cookie values are `PA.my3Web` and `WIRELESS_SECURITY_TOKEN`. 

If you want, you can copy just those ones, separating them by semicolon, on the cookie variable: `PA.my3Web=VALUE_HERE; WIRELESS_SECURITY_TOKEN=VALUE_HERE`

## Bord Gais Energy Ireland Bill Downloader (Node.js Script)
Company: _Bord Gais Energy Ireland_

File name: `bord-gais-energy-ireland.mjs`

This script downloads all your Bord Gais Energy bills in PDF format, even if they're no longer available through the website.

✅ What you need to do:
1. Get your *token* and *account number* from the Bord Gais Energy website.
2. Set those values in the **USER CONFIGURATION** section of the script.
3. Run the script using: `node bord-gais-energy-ireland.js`

The script will fetch bills from all period. Any errors encountered will be saved in a file called `Errors found.txt`.

🔑 How to get your token:
- Log in to the Bord Gais Energy website.
- Open your browser's DevTools (press F12), then go to the Console tab.
- Run the following command:
  
    `JSON.parse(localStorage.accessToken).bgeAccessToken`
- The token will be valid for about 5 minutes. If it expires, repeat the step above.

💡 This code was tested with Node.js version 22, but should work in other versions too.
