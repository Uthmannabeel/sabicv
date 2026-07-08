import crypto from "crypto";

/**
 * Bank-transfer payment: the customer transfers to the owner's existing
 * account using a short code in the narration; the owner confirms from the
 * admin screen. No processor, no KYC beyond the owner's own bank.
 */

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export function getBankDetails(): BankDetails {
  const bankName = process.env.BANK_NAME;
  const accountNumber = process.env.BANK_ACCOUNT_NUMBER;
  const accountName = process.env.BANK_ACCOUNT_NAME;
  if (!bankName || !accountNumber || !accountName) {
    throw new Error("BANK_NAME / BANK_ACCOUNT_NUMBER / BANK_ACCOUNT_NAME not set");
  }
  return { bankName, accountNumber, accountName };
}

// No 0/O/1/I — customers copy these into bank apps by hand.
const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateTransferCode(): string {
  const bytes = crypto.randomBytes(4);
  const chars = Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]);
  return `SABI-${chars.join("")}`;
}
