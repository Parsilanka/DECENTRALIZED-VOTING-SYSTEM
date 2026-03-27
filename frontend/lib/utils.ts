/**
 * Generates and triggers a download for a text-based voter receipt.
 */
export const downloadReceipt = (electionTitle: string, candidateName: string, txHash: string, address: string) => {
    const timestamp = new Date().toLocaleString();
    const content = `
╔══════════════════════════════════════════════════════════╗
║              VOTECHAIN OFFICIAL VOTER RECEIPT            ║
╚══════════════════════════════════════════════════════════╝

ELECTION: ${electionTitle.toUpperCase()}
DATE: ${timestamp}
VOTER ADDRESS: ${address}

------------------------------------------------------------
VOTED FOR: ${candidateName}
------------------------------------------------------------

BLOCKCHAIN VERIFICATION (TX HASH):
${txHash}

This receipt serves as your digital proof of participation in 
the decentralized election. Your vote is immutably recorded 
on the Ethereum blockchain.

Thank you for participating in the future of democracy.
https://votechain.dapp
    `;

    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `VoteChain_Receipt_${electionTitle.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};

/**
 * Exports data to a CSV file.
 */
export const exportToCSV = (filename: string, rows: any[]) => {
    if (!rows || !rows.length) return;
    
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent = [
        keys.join(separator),
        ...rows.map(row => keys.map(k => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell.toString().replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
            return cell;
        }).join(separator))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
