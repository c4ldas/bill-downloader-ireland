// ----------------------------------------------------------
// 📄 Virgin Media Ireland Bill Downloader (Node.js Script)
//
// This script downloads all your Virgin Media bills in PDF format,
// even if they're no longer available through the website.
//
// ✅ What you need to do:
// 1. Get your *token* and *account number* from the Virgin Media website.
// 2. Set those values (along with the desired start year) in the config section below.
// 3. Run the script using: `node script.js`
//
// The script will fetch bills from your chosen start year up to the current year.
// Any errors encountered will be saved in a file called "Errors found.txt".
//
// 🔑 How to get your token:
// - Log in to the Virgin Media website.
// - Open your browser's DevTools (press F12), then go to the Console tab.
// - Run the following command:
//     localStorage["lgi-oidc-uxp-idToken"] + ',Atmosphere atmosphere_app_id="AEM_IE"'
// - The token will be valid for about 20 minutes. If it expires, repeat the step above.
//
// 💡 This code was tested with Node.js version 22, but should work in other versions too
//
// ----------------------------------------------------------

import fs from 'fs';
import { setTimeout as wait } from 'timers/promises';


// ========== USER CONFIGURATION ============= //
const token = 'YOUR_TOKEN_HERE';               // <-- update this
const accountNumber = 'YOUR_ACCOUNT_NUMBER';   // <-- update this
const startYear = 2013;                        // <-- set desired start year
// =========================================== //


/***********************************
* No need to edit below this line *
***********************************/

const endYear = new Date().getFullYear();
const billsArray = []; // Array to store the bills history
const headers = { 'Authorization': `Bearer ${token}`, 'mwmd-activityname': 0, 'mwmd-conversationid': 0, 'mwmd-requestid': 0, 'mwmd-requesttimestamp': 0 };

try { fs.unlinkSync('Errors found.txt'); } catch { } // Delete the file if it exists

// Downloads a single bill. Expects to receive the bill number and date as arguments.
// Example: node virgin-media-ireland.mjs 12345678 2023-01-01
if (process.argv[2] && process.argv[3]) {
  console.log("Downloading a single bill...");
  billsArray.push({ billNo: process.argv[2], billDate: process.argv[3] });
  await downloadBills(billsArray, 1);
  process.exit();
}

await getBillsHistory();
console.log(`Found ${billsArray.length} bills to download.`);
downloadBills(billsArray);

// Get the bills history from Virgin Media API
// Duration between start date and end date cannot be greater than 2 years.
// It will start based on the January of "startYear" variable until December of the next year.
async function getBillsHistory() {
  for (let start = startYear; start <= endYear; start += 2) {

    const url = `https://geo1.api.libertyglobal.com/IE/msa/biz/BillInquiryBusiness/v1.0/customer-bill?` +
      new URLSearchParams({
        customerId: accountNumber,
        chl: 'MYUPC3',
        customerSystemType: 'FIXED',
        startDate: `${start}-01-01T00:00:00Z`,
        endDate: `${start + 1}-12-31T23:59:59Z`,
        sortBy: 'billDate',
        sortOrder: 'ASCENDING'
      });

    try {
      const request = await fetch(url, { method: "GET", headers });

      if (!request.ok) {
        if (request.status == 401) {
          console.log("Token expired. Please refresh the token.");
          return;
        }
        continue;
      }
      const response = await request.json();

      if (response.statusDescription != "SUCCESS") {
        console.log(`Year ${start} - ${start + 1}: No bills found.`)
        fs.appendFileSync("Errors found.txt", `No bills found for ${start} - ${start + 1}.\n\n`);
        continue;
      }

      console.log(`Year ${start} - ${start + 1}: ${response.customerBills.length} bills found.`);
      const data = response.customerBills.map((item) => ({ billNo: item.billNo, billDate: item.billDate.split("T")[0] }));
      billsArray.push(...data);

    } catch (error) {
      console.error(`🚨 Error getting bills history: ${error.message}`);
      return [];
    }
  }
}

// Download the bills in batches of 3. More than that might cause the server to block the requests.
async function downloadBills(billsArray, concurrency = 3) {
  for (let i = 0; i < billsArray.length; i += concurrency) {
    const batch = billsArray.slice(i, i + concurrency);

    // Map each bill in the batch to a download promise
    const tasks = batch.map(async ({ billNo, billDate }) => {
      const filename = `${billDate}.pdf`;
      const date = new Date().toISOString();

      const url = 'https://geo1.api.libertyglobal.com/IE/msa/biz/BillInquiryBusiness/v1.0/pdfbill?' +
        new URLSearchParams({
          customerId: accountNumber,
          chl: 'MYUPC3',
          customerSystemType: "FIXED",
          billNo: billNo
        });

      try {
        const res = await fetch(url, { method: 'GET', headers });

        if (!res.ok) {
          if (res.status == 401) {
            console.log("Token expired. Please refresh the token.");
            return;
          }

          if (res.status == 404) {
            console.log(`⚠️  Bill ${billNo} (${billDate}) not found. Skipping...`);
            fs.appendFileSync("Errors found.txt", `Bill ${billNo} (${billDate}) not found. Not possible to download.\n\n`);
            return;
          }

          if (res.status == 403) {
            console.error(`❌ Failed to download bill ${billNo} (${billDate}). ${res.status}`);
            fs.appendFileSync("Errors found.txt", `${date} - Failed to download bill ${billNo} (${billDate}). Run the command below to download it manually: \nnode "${process.argv[1]}" ${billNo} ${billDate}\n\n`);
            return;
          }

          return;
        }

        const buffer = await res.arrayBuffer();
        fs.writeFileSync(filename, Buffer.from(buffer));
        console.log(`✅ Saved ${filename}`);

      } catch (err) {
        console.error(`🚨 Error downloading bill ${billNo}: ${err.message}`);
        fs.appendFileSync("Errors found.txt", `Error downloading bill ${billNo}: ${err.message}\n`);
      }
    });

    // Wait for all 3 downloads in this batch
    await Promise.all(tasks);

    // Delay between batches
    await wait(500);
  }

  console.log(`✨ All bills processed. Check the "Errors found.txt" file for any errors.`);
}
