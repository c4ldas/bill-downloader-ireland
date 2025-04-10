// ----------------------------------------------------------
// 📄 Vodafone Ireland Bill Downloader (Node.js Script)
//
// This script downloads all your Vodafone bills in PDF format,
// even if they're no longer available through the website.
//
// ✅ What you need to do:
// 1. Get your *cookie* from the Vodafone website. Instructions in the next section
// 2. Set the value in *USER CONFIGURATION* section below.
// 3. Run the script using: `node vodafone-ireland.mjs`
//
// The script will try to fetch all bills in your account.
// Any errors encountered will be saved in a file called "Errors found.txt".
//
// 🔑 How to get your cookie:
// The easiest way to copy the cookies value is installing a browser extension like `Cookie-Editor`: https://cookie-editor.com
// Install the extension and after that, login to the Vodafone website.
// After login, click on Cookie-Editor extension icon > Export icon (bottom right) > Header String
// The value will be copied to the clipboard, just paste it in the code where it says 'YOUR_COOKIE_HERE'.
//
//
// Technical information (just out of curiosity): 
// The only important cookie values are `OAMAuthnCookie_n.vodafone.ie:443` and `SHIROCOOKIE`. 
// If you want, you can copy just those ones, separating them by semicolon, on the cookie variable:
// OAMAuthnCookie_n.vodafone.ie:443=VALUE_HERE; SHIROCOOKIE=VALUE_HERE
//
// 💡 This code was tested with Node.js version 22, but should work in other versions too.
//
// ----------------------------------------------------------

import fs from 'fs';

// ========== USER CONFIGURATION ============= //
const cookie = 'YOUR_COOKIE_HERE';             // <-- update this 
// =========================================== //


/***********************************
* No need to edit below this line *
***********************************/

if (cookie == "YOUR_COOKIE_HERE" || cookie == "") {
  console.error("Please set your cookie before running the script.");
  process.exit();
}

const headers = { Cookie: cookie }

// Downloads a single bill. Expects to receive the bill number and date as arguments.
// Example: node vodafone-ireland.mjs 12345678 2025-04-10
if (process.argv[2] && process.argv[3]) {
  console.log("Downloading a single bill...");
  const billsArray = [{ invoiceNumber: process.argv[2], dueDate: process.argv[3] }];
  await downloadBills(billsArray, 1);
  process.exit();
}

// Main structure
const effectiveDate = await getJoiningDate();
if (!effectiveDate) process.exit(0);
const maxRecords = getMonths(effectiveDate);
console.log(`Found ${maxRecords - 2} bills to download.`);
const listOfBills = await getListOfBills(maxRecords);
downloadBills(listOfBills);


// Get date when the user joined 
async function getJoiningDate() {
  const url = "https://n.vodafone.ie/bin/mvc.do/accounts/account/subscriptions";

  try {
    const request = await fetch(url, { method: "GET", headers })

    if (!request.ok) {
      if (request.status == 500) {
        console.error("Error 500. Failed to obtain joining date. Please check if you set the cookie variable correctly");
        return false;
      }

      if (request.status == 404) {
        console.error("Error 404. Request URL not found. Check if the request URL is still valid.");
        return false;
      }

      console.error(`Error status: ${request.status} - ${request.statusText}`);
      console.error("Unexpected error.");
      return false;
    }

    const response = await request.json();
    const effectiveDate = response[0].effectiveDate;
    // console.log(effectiveDate);
    return effectiveDate;

  } catch (error) {
    console.error(error.message);
    console.error("Failed to obtain joining date. Please refresh your cookie");
    return false;
  }
}

// Get list of bills to download
async function getListOfBills(data) {
  const billsArray = [];
  const url = `https://n.vodafone.ie/bin/mvc.do/accounts/account/bills?firstRecord=1&maxRecords=${data}&type=BILL_RECEIVER`;

  try {
    const request = await fetch(url, { method: "GET", headers })

    if (!request.ok) {
      if (request.status == 500) {
        console.error("Error 500. Failed to obtain list of bills. Please check if you set the cookie variable correctly");
        return false;
      }

      if (request.status == 404) {
        console.error("Error 404. Request URL not found. Check if the request URL is still valid.");
        return false;
      }

      console.error(`Error status: ${request.status} - ${request.statusText}`);
      console.error("Unexpected error.");
      return false;
    }

    const response = await request.json();
    response.forEach((item) => { billsArray.push({ invoiceNumber: item.invoiceNumber, dueDate: parseDate(item.dueDate) }); })

    // console.log(billsArray);
    return billsArray;

  } catch (error) {
    console.error(error.message);
    console.error("Failed to obtain list of bills. Please refresh your cookie");
    return false;
  }
}


// Create queue to download 5 bills at once
async function downloadBills(data, concurrency = 20) {
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

  const url = (invoiceNumber) => `https://n.vodafone.ie/bin/mvc.do/documents/invoices/Invoice/${invoiceNumber}`;
  const filename = `${data.dueDate}.pdf`;

  try {
    const request = await fetch(url(data.invoiceNumber), { method: 'GET', headers });

    if (!request.ok) {
      console.log(`❌ Failed to download bill ${data.invoiceNumber} (${data.dueDate}). ${request.status}`);
      fs.appendFileSync("Errors found.txt", `Vodafone: Bill ${data.invoiceNumber} (${data.dueDate}) failed to download. Run the command below to download it manually: \nnode "${process.argv[1]}" ${data.invoiceNumber} ${data.dueDate}\n\n`);
      return;
    }

    const buffer = await request.arrayBuffer();
    fs.writeFileSync(filename, Buffer.from(buffer));
    console.log(`✅ Saved ${filename}`);

  } catch (error) {
    console.log(`❌ Error downloading bill ${data.invoiceNumber}: ${error.message}`);
  }
}


// Get number of months to obtain the bills
function getMonths(data) {
  const today = new Date();
  const effectiveDate = new Date(data);
  const yearsAmount = today.getFullYear() - effectiveDate.getFullYear();
  const monthsAmount = today.getMonth() - effectiveDate.getMonth();
  const totalMonths = yearsAmount * 12 + monthsAmount;
  // console.log("Total months:", totalMonths + 2);
  return (totalMonths + 2);
}


// Parse date from  "10 April 2025" format to "2025-04-10"
function parseDate(data) {
  const year = new Date(data).getFullYear();
  const month = String(new Date(data).getMonth() + 1).padStart(2, '0');
  const day = String(new Date(data).getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
