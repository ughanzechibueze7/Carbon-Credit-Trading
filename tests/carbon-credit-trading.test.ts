import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let carbonCredits: Map<number, {
  owner: string,
  verifier: string,
  amount: number,
  origin: string,
  vintageYear: number,
  isRetired: boolean
}>;
let creditBalances: Map<string, number>;
let listings: Map<number, {
  seller: string,
  creditId: number,
  amount: number,
  pricePerCredit: number
}>;
let nextCreditId: number;
let nextListingId: number;

// Simulated contract functions
function createCarbonCredit(caller: string, verifier: string, amount: number, origin: string, vintageYear: number): number {
  const creditId = nextCreditId;
  carbonCredits.set(creditId, {
    owner: caller,
    verifier,
    amount,
    origin,
    vintageYear,
    isRetired: false
  });
  creditBalances.set(`${caller}-${creditId}`, amount);
  nextCreditId++;
  return creditId;
}

function transferCredit(sender: string, recipient: string, creditId: number, amount: number): boolean {
  const senderBalance = creditBalances.get(`${sender}-${creditId}`) || 0;
  if (senderBalance < amount) throw new Error('ERR_INSUFFICIENT_BALANCE');
  
  creditBalances.set(`${sender}-${creditId}`, senderBalance - amount);
  const recipientBalance = creditBalances.get(`${recipient}-${creditId}`) || 0;
  creditBalances.set(`${recipient}-${creditId}`, recipientBalance + amount);
  return true;
}

function retireCredit(caller: string, creditId: number, amount: number): boolean {
  const balance = creditBalances.get(`${caller}-${creditId}`) || 0;
  if (balance < amount) throw new Error('ERR_INSUFFICIENT_BALANCE');
  
  creditBalances.set(`${caller}-${creditId}`, balance - amount);
  const credit = carbonCredits.get(creditId);
  if (!credit) throw new Error('ERR_NOT_FOUND');
  credit.isRetired = true;
  carbonCredits.set(creditId, credit);
  return true;
}

function listCreditForSale(caller: string, creditId: number, amount: number, pricePerCredit: number): number {
  const balance = creditBalances.get(`${caller}-${creditId}`) || 0;
  if (balance < amount) throw new Error('ERR_INSUFFICIENT_BALANCE');
  if (pricePerCredit <= 0) throw new Error('ERR_INVALID_PRICE');
  
  const listingId = nextListingId;
  listings.set(listingId, {
    seller: caller,
    creditId,
    amount,
    pricePerCredit
  });
  nextListingId++;
  return listingId;
}

function cancelListing(caller: string, listingId: number): boolean {
  const listing = listings.get(listingId);
  if (!listing) throw new Error('ERR_NOT_FOUND');
  if (listing.seller !== caller) throw new Error('ERR_UNAUTHORIZED');
  
  listings.delete(listingId);
  return true;
}

function buyCredit(buyer: string, listingId: number, amount: number): boolean {
  const listing = listings.get(listingId);
  if (!listing) throw new Error('ERR_NOT_FOUND');
  if (listing.amount < amount) throw new Error('ERR_INSUFFICIENT_BALANCE');
  
  const totalPrice = amount * listing.pricePerCredit;
  // Simulated STX transfer
  transferCredit(listing.seller, buyer, listing.creditId, amount);
  
  if (amount < listing.amount) {
    listings.set(listingId, { ...listing, amount: listing.amount - amount });
  } else {
    listings.delete(listingId);
  }
  return true;
}

describe('carbon-credit-trading contract test suite', () => {
  beforeEach(() => {
    carbonCredits = new Map();
    creditBalances = new Map();
    listings = new Map();
    nextCreditId = 0;
    nextListingId = 0;
  });
  
  it('should create a carbon credit successfully', () => {
    const creditId = createCarbonCredit('owner1', 'verifier1', 1000, 'Forest Project A', 2023);
    expect(creditId).toBe(0);
    expect(carbonCredits.size).toBe(1);
    const credit = carbonCredits.get(creditId);
    expect(credit).toBeDefined();
    expect(credit?.isRetired).toBe(false);
    expect(creditBalances.get('owner1-0')).toBe(1000);
  });
  
  it('should transfer credits between users', () => {
    const creditId = createCarbonCredit('owner1', 'verifier1', 1000, 'Forest Project A', 2023);
    expect(transferCredit('owner1', 'owner2', creditId, 500)).toBe(true);
    expect(creditBalances.get('owner1-0')).toBe(500);
    expect(creditBalances.get('owner2-0')).toBe(500);
  });
  
  it('should retire credits', () => {
    const creditId = createCarbonCredit('owner1', 'verifier1', 1000, 'Forest Project A', 2023);
    expect(retireCredit('owner1', creditId, 500)).toBe(true);
    expect(creditBalances.get('owner1-0')).toBe(500);
    const credit = carbonCredits.get(creditId);
    expect(credit?.isRetired).toBe(true);
  });
  
  it('should list credits for sale', () => {
    const creditId = createCarbonCredit('owner1', 'verifier1', 1000, 'Forest Project A', 2023);
    const listingId = listCreditForSale('owner1', creditId, 500, 10);
    expect(listingId).toBe(0);
    expect(listings.size).toBe(1);
    const listing = listings.get(listingId);
    expect(listing).toBeDefined();
    expect(listing?.amount).toBe(500);
    expect(listing?.pricePerCredit).toBe(10);
  });
  
  it('should cancel a listing', () => {
    const creditId = createCarbonCredit('owner1', 'verifier1', 1000, 'Forest Project A', 2023);
    const listingId = listCreditForSale('owner1', creditId, 500, 10);
    expect(cancelListing('owner1', listingId)).toBe(true);
    expect(listings.size).toBe(0);
  });
  
  it('should buy credits from a listing', () => {
    const creditId = createCarbonCredit('owner1', 'verifier1', 1000, 'Forest Project A', 2023);
    const listingId = listCreditForSale('owner1', creditId, 500, 10);
    expect(buyCredit('buyer1', listingId, 300)).toBe(true);
    expect(creditBalances.get('owner1-0')).toBe(700);
    expect(creditBalances.get('buyer1-0')).toBe(300);
    const updatedListing = listings.get(listingId);
    expect(updatedListing?.amount).toBe(200);
  });
  
  it('should fail to transfer more credits than available', () => {
    const creditId = createCarbonCredit('owner1', 'verifier1', 1000, 'Forest Project A', 2023);
    expect(() => transferCredit('owner1', 'owner2', creditId, 1500)).toThrow('ERR_INSUFFICIENT_BALANCE');
  });
  
  it('should fail to retire more credits than available', () => {
    const creditId = createCarbonCredit('owner1', 'verifier1', 1000, 'Forest Project A', 2023);
    expect(() => retireCredit('owner1', creditId, 1500)).toThrow('ERR_INSUFFICIENT_BALANCE');
  });
  
  it('should fail to list more credits than owned', () => {
    const creditId = createCarbonCredit('owner1',
        'verifier1', 1000, 'Forest Project A', 2023);
    expect(() => listCreditForSale('owner1', creditId, 1500, 10)).toThrow('ERR_INSUFFICIENT_BALANCE');
  });
  
  it('should fail to cancel a listing by non-owner', () => {
    const creditId = createCarbonCredit('owner1', 'verifier1', 1000, 'Forest Project A', 2023);
    const listingId = listCreditForSale('owner1', creditId, 500, 10);
    expect(() => cancelListing('owner2', listingId)).toThrow('ERR_UNAUTHORIZED');
  });
  
  it('should fail to buy more credits than listed', () => {
    const creditId = createCarbonCredit('owner1', 'verifier1', 1000, 'Forest Project A', 2023);
    const listingId = listCreditForSale('owner1', creditId, 500, 10);
    expect(() => buyCredit('buyer1', listingId, 600)).toThrow('ERR_INSUFFICIENT_BALANCE');
  });
});
