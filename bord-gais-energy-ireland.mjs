// ----------------------------------------------------------
// 📄 Bord Gáis Energy Ireland Bill Downloader (Node.js Script)
//
// This script downloads all your Bord Gáis Energy bills in PDF format,
// even if they're no longer available through the website.
//
// ✅ What you need to do:
// 1. Get your *token* and *account number* from the Bord Gáis Energy website.
// 2. Set those values in the USER CONFIGURATION section on line 30.
// 3. Run the script using: `node bord-gais-energy-ireland.js`
//
// The script will try to fetch all bills in your account.
// Any errors encountered will be saved in a file called "Errors found.txt".
//
// 🔑 How to get your token:
// - Log in to the Bord Gáis Energy website.
// - Open your browser's DevTools (press F12), then go to the Console tab.
// - Run the following command:
//     JSON.parse(localStorage.accessToken).bgeAccessToken
// - The token will be valid for about 5 minutes. If it expires, repeat the step above.
//
// 💡 This code was tested with Node.js version 22, but should work in other versions too
//
// ----------------------------------------------------------

import fs from 'fs';


// ========== USER CONFIGURATION ============= //
const token = 'YOUR_TOKEN_HERE';               // <-- update this
const accountNumber = 'YOUR_ACCOUNT_NUMBER';   // <-- update this
// =========================================== //


/***********************************
* No need to edit below this line *
***********************************/

if (token == "YOUR_TOKEN_HERE" || accountNumber == "YOUR_ACCOUNT_NUMBER") {
  console.error("Please set your token and account number before running the script.");
  process.exit(1);
}

const headers = { "Authorization": `Bearer ${token}` };

// Main structure
const history = await getBillsHistory();
if (!history) process.exit(0);
console.log(`Found ${history.length} bills to download.`);

await downloadBill(history);

// Get list of bills to download
async function getBillsHistory() {
  const url = `https://www.bordgaisenergy.ie/api/accounts/${accountNumber}/transactions`;

  try {
    const request = await fetch(url, { method: 'GET', headers });

    if (!request.ok) {

      if (request.status == 404) {
        console.log("Not found. Please check your account number and refresh the token.");
        return;
      }
      console.log(request);
    }

    const response = await request.json();
    const data = response.filter(item => item.billUrl != "")
    return data;

  } catch (error) {
    console.error(`🚨 Error getting bills history: ${error.message}`);
    return [];
  }
}

// Get the download link and save the bills
async function downloadBill(data) {
  for (let i = 0; i < data.length; i++) {
    const { billId, date } = data[i];
    const filename = `${date}.pdf`;

    const url = `https://www.bordgaisenergy.ie/api/documents/bills/${billId}?accountId=${accountNumber}`;

    try {
      const request = await fetch(url, { method: 'GET', headers });

      if (!request.ok) {
        if (request.status == 404) {
          console.log(`⚠️  Token expired or invalid. Please refresh the token.`);
          return;
        }

        console.error(`❌ Unexpected error: ${billId} (${date}). ${request.status} ${request.statusText}`);
        return;
      }

      const response = await request.json();

      const downloadRequest = await fetch(response.url);
      const downloadResponse = await downloadRequest.arrayBuffer();
      fs.writeFileSync(filename, Buffer.from(downloadResponse));
      console.log(`✅ Saved ${filename}`);

    } catch (error) {
      console.error(`🚨 Error downloading bill ${billId} (${date})`, error.message);
      fs.appendFileSync("Errors found.txt", `Error downloading bill ${billId}: ${error.message}\n\n`);
      return false;
    }
  }

  console.log(`✨ All bills processed. Check the "Errors found.txt" file for any errors.`);
}
