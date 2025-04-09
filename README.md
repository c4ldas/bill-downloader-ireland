# bills-downloader-ireland
Selection of scripts you can use to download utility bills from some companies in Ireland

Here you will find scripts for:
- Virgin Media Ireland
- Three Ireland - Soon...
- SSE Aitricity Ireland - Soon...

Initially, they are for Node.js, but I have plans to have Bash or PowerShell versions of them, if anyone needs that (let me know).

## Virgin Media Ireland Bill Downloader (Node.js Script)

Company: _Virgin Media Ireland_

File name: `virgin-media-ireland.mjs`

This script downloads all your Virgin Media bills in PDF format, even if they're no longer available through the website.

✅ What you need to do:
1. Get your *token* and *account number* from the Virgin Media website.
2. Set those values (along with the desired start year) in the config section of the script.
3. Run the script using: `node virgin-media-ireland.mjs`

The script will fetch bills from your chosen start year up to the current year. Any errors encountered will be saved in the file `Errors found.txt`.

🔑 How to get your token:
- Log in to the Virgin Media website.
- Open your browser's DevTools (press F12), then go to the Console tab.
- Run the following command and copy the result:
  
    `localStorage["lgi-oidc-uxp-idToken"] + ',Atmosphere atmosphere_app_id="AEM_IE"'`
- The token will be valid for about 20 minutes. If it expires, repeat the step above.

💡 This code was tested with Node.js version 22, but should work in other versions too

## Three Ireland Bill Downloader
Company: _Three Ireland_

File name: `three-ireland.mjs`

Coming soon...

## SSE Airtricity Ireland Bill Downloader
Company: _SSE Aitricity_

File name: `sseairtricity-ireland.mjs`

Coming soon...
