// ----------------------------------------------------------
// 📄 SSE Airtricity Ireland Bill Downloader (Node.js Script)
//
// This script downloads all your SSE Airtricity bills in PDF format,
// even if they're no longer available through the website.
//
// ✅ What you need to do:
// 1. Get your *token* and *account number* from the SSE Airtricity website.
// 2. Set those values in the USER CONFIGURATION section below.
// 3. Run the script using: `node sse-airtricity-ireland.js`
//
// The script will fetch bills from your chosen start year up to the current year.
// Any errors encountered will be saved in a file called "Errors found.txt".
//
// 🔑 How to get your token:
// - Log in to the SSE Airtricity website.
// - Open your browser's DevTools (press F12), then go to the Console tab.
// - Run the following command:
//     JSON.parse(localStorage.authorizationResult).access_token
// - The token will be valid for about 60 minutes. If it expires, repeat the step above.
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

const headers = { "Authorization": `Bearer ${token}`, "ocp-apim-subscription-key": "e0d373fb482c4d85b53616bc6c0ec6f5" };
const history = await getBillsHistory();
if (!history) process.exit(0);
console.log(`Found ${history.length} bills to download.`);

await downloadBill(history);


async function getBillsHistory() {
  const url = `https://ossapi.sseairtricity.com/billing-details/v1/customers/${accountNumber}/transaction-history`;

  try {
    const request = await fetch(url, { method: 'GET', headers });

    if (!request.ok) {
      if (request.status == 401) {
        console.log("Token expired or invalid. Please refresh the token.");
        return;
      }
      if (request.status == 404) {
        console.log("Account not found. Please check your account number.");
        return;
      }
      console.log(request);
    }

    const response = await request.json();

    if (response.detail === "Failed to verify token") {
      console.error("Token expired or invalid. Please refresh the token.");
      return false;
    }

    const data = response.billingTransactionCollection.filter(item => item.statementNumber !== null)
    return data;

  } catch (error) {
    console.error(`🚨 Error getting bills history: ${error.message}`);
    return [];
  }
}

async function downloadBill(data) {
  for (let i = 0; i < data.length; i++) {
    const { statementNumber, transactionDate } = data[i];
    const downloadName = transactionDate.replaceAll("-", "");
    const filename = `${transactionDate}.pdf`;

    const url = `https://ossapi.sseairtricity.com/billing-details/v1/customers/${accountNumber}/statement/${statementNumber}/bill-pdf/${downloadName}`;

    try {
      const request = await fetch(url, { method: 'GET', headers });

      if (!request.ok) {
        if (request.status == 401) {
          console.log("Token expired or invalid. Please refresh the token.");
          return;
        }

        if (request.status == 404) {
          console.log(`⚠️  Bill ${statementNumber} (${transactionDate}) not found. Skipping...`);
          fs.appendFileSync("Errors found.txt", `SSE Airtricity: Bill ${statementNumber} (${transactionDate}) not found. Not possible to download.\n\n`);
          continue;
        }

        console.error(`❌ Unexpected error: ${statementNumber} (${transactionDate}). ${request.status} ${request.statusText}`);
        return;
      }

      // Save the PDF file
      const response = await request.arrayBuffer();
      fs.writeFileSync(filename, Buffer.from(response));
      console.log(`✅ Saved ${filename}`);

    } catch (error) {
      console.error(`🚨 Error downloading bill ${statementNumber} (${transactionDate}`, error.message);
      fs.appendFileSync("Errors found.txt", `Error downloading bill ${statementNumber}: ${err.message}\n\n`);
      return false;
    }
  }

  console.log(`✨ All bills processed. Check the "Errors found.txt" file for any errors.`);
}
