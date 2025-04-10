// ----------------------------------------------------------
// 📄 Three Ireland Bill Downloader (Node.js Script)
//
// This script downloads all your Three bills in PDF format,
// even if they're no longer available through the website.
//
// ✅ What you need to do:
// 1. Get your *cookie* and *account number* from the Three website. Instructions below.
// 2. Set the value in *USER CONFIGURATION* section below.
// 3. Run the script using: `node three-ireland.mjs`
//
// The script will try to fetch all bills in your account.
// Any errors encountered will be saved in a file called "Errors found.txt".
//
// 🔑 How to get your cookie:
// The easiest way to copy the cookies value is installing a browser extension like `Cookie-Editor`: https://cookie-editor.com
// Install the extension and after that, login to the Three website.
// After login, click on Cookie-Editor extension icon > Export icon (bottom right) > Header String
// The value will be copied to the clipboard, just paste it in the code where it says 'YOUR_COOKIE_HERE'.
//
//
// Technical information (just out of curiosity): 
// The only important cookie values are `PA.my3Web` and `WIRELESS_SECURITY_TOKEN`. 
// If you want, you can copy just those ones, separating them by semicolon, on the cookie variable:
// PA.my3Web=VALUE_HERE; WIRELESS_SECURITY_TOKEN=VALUE_HERE
//
// 💡 This code was tested with Node.js version 22, but should work in other versions too.
//
// ----------------------------------------------------------

import fs from 'fs';


// ========== USER CONFIGURATION ============= //
const cookie = 'YOUR_COOKIE_HERE';             // <-- update this
const accountNumber = 'YOUR_ACCOUNT_NUMBER';   // <-- update this
// =========================================== //


/***********************************
* No need to edit below this line *
***********************************/

if (cookie == "YOUR_COOKIE_HERE" || cookie == "") {
  console.error("Please set your cookie before running the script.");
  process.exit();
}

const headers = { Cookie: cookie };

// Downloads a single bill. Expects to receive the bill number and date as arguments.
// Example: node three-ireland.mjs 89 2025-04-10
if (process.argv[2] && process.argv[3]) {
  console.log("Downloading a single bill...");
  const billsArray = [{ billNumber: process.argv[2], billCloseDate: process.argv[3] }];
  await downloadBills(billsArray, 1);
  process.exit();
}

// Main structure
const listOfBills = await getListOfBills();
if (!listOfBills) process.exit(0);
console.log(`Found ${listOfBills.length} bills to download.`);
downloadBills(listOfBills);

// Get list of bills to download
async function getListOfBills() {
  const accountNumber = '339444907';
  const url = `https://www.three.ie/my3r/rp-server/ebill/v1/customer/${accountNumber}/billing-arrangement/${accountNumber}/bill?numOfBills=27`;

  const request = await fetch(url, { method: "GET", headers });

  if (!request.ok) {

    if (request.status == 401) {
      console.error("Error 401. Failed to obtain list of bills. Please check if you set the cookie variable correctly");
      return;
    }

    if (request.status == 404) {
      console.error("Error 404. Request URL not found. Check if the request URL is still valid.");
      return;
    }

    console.error(`Error status: ${request.status} - ${request.statusText}`);
    console.error("Unexpected error.");
    return;
  }

  const response = await request.json();

  // Create a new object array with format { billNumber: "50", billCloseDate: "2025-04-10" }
  const data = response.map((item) => { return { billNumber: item.data.billNumber, billCloseDate: item.data.billCloseDate.split('T')[0] } })

  // Here we have a small trick... As the endpoint only returns the last 27 bills in descending order 
  // (even changing the numOfBills value), we get the last element and start decreasing it manually, creating new items
  // until reaching 1, which means the first bill ever for the account
  const oldestBill = data.slice(-1)[0];
  let lastIndex = data.length - 1;

  for (let i = oldestBill.billNumber - 1; i > 0; i--) {
    const utcDate = String(data[lastIndex].billCloseDate) + "T12:00:00Z"; // Add 12h on the date to keep it from day shifting
    const date = new Date(utcDate); // convert it to date format
    date.setMonth(date.getMonth() - 1); // Decrease one month
    const billCloseDate = date.toISOString().split("T")[0]; // Remove the hours part again
    data.push({ billNumber: String(i), billCloseDate: billCloseDate }) // Add it to the array
    lastIndex = data.length - 1; // Get the updated new last index
  }

  return data;
}


// Create queue to download many bills at once
async function downloadBills(data, concurrency = 5) {
  const queue = [...data]; // Clone the array to avoide mutating the original
  const workers = [];

  for (let i = 0; i < concurrency; i++) {
    const worker = (async () => {
      while (queue.length > 0) {
        const bill = queue.shift();
        await downloadSingleBill(bill);
      }
    })();
    workers.push(worker);
  }

  await Promise.all(workers);
  console.log(`✨ All bills processed. Check the "Errors found.txt" file for any errors.`);
}


// Download the bill
async function downloadSingleBill(data) {
  // const { billNumber, billCloseDate } = data;

  const url = `https://www.three.ie/my3r/rp-server/care/v1/customer/${accountNumber}/billing-arrangement/${accountNumber}/bill/${data.billNumber}/pdf?salesChannel=selfService`;
  const filename = `${data.billCloseDate}.pdf`;

  try {
    const request = await fetch(url, { method: 'GET', headers });

    if (!request.ok) {
      console.log(`❌ Failed to download bill ${data.billNumber} (${data.billCloseDate}). ${request.status}`);
      fs.appendFileSync("Errors found.txt", `Three: Bill ${data.billNumber} (${data.billCloseDate}) failed to download. Run the command below to download it manually: \nnode "${process.argv[1]}" ${data.billNumber} ${data.billCloseDate}\n\n`);
      return;
    }

    const buffer = await request.arrayBuffer();
    fs.writeFileSync(filename, Buffer.from(buffer));
    console.log(`✅ Saved ${filename}`);

  } catch (error) {
    console.log(`❌ Error downloading bill ${data.billNumber}: ${error.message}`);
  }
}
