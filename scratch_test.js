const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const modalRegex = /<div class="modal-overlay"[^>]*id="([^"]+)"[\s\S]*?<\/div>\s*<\/div>/g;
let match;
console.log("=== CHECKING MODALS AND CLOSE BUTTONS ===");
const ids = ['productModal', 'purchaseModal', 'saleModal', 'drumModal', 'drumOrderModal', 'storeModal', 'paymentModal', 'statementModal', 'resetModal', 'staffModal', 'staffLedgerModal'];

ids.forEach(id => {
    const hasModal = html.includes(`id="${id}"`);
    const hasCloseBtn = html.includes(`closeModal('${id}')`);
    console.log(`Modal: ${id} | Exists: ${hasModal} | Close Button Present: ${hasCloseBtn}`);
});
