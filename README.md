# Carbon Credit Trading Smart Contract

A decentralized carbon credit trading platform built on Stacks blockchain using Clarity smart contracts. This contract enables the creation, verification, trading, and retirement of carbon credits in a transparent and secure manner.

## Overview

This smart contract facilitates the following key operations:
- Creation of verified carbon credits
- Trading of carbon credits between parties
- Retirement of carbon credits
- Management of credit listings in a marketplace
- Verification authority updates

## Features

- **Verified Carbon Credits**: Each credit is created with a designated verifier
- **Flexible Trading**: Support for partial and full credit transfers
- **Market Mechanisms**: Built-in marketplace for listing and trading credits
- **Credit Retirement**: Permanent retirement mechanism for offset verification
- **Balance Management**: Secure tracking of credit ownership and balances
- **Administrative Controls**: Verifier management system

## Contract States

### Carbon Credits
```clarity
{
  owner: principal,
  verifier: principal,
  amount: uint,
  origin: (string-ascii 50),
  vintage-year: uint,
  is-retired: bool
}
```

### Listings
```clarity
{
  seller: principal,
  credit-id: uint,
  amount: uint,
  price-per-credit: uint
}
```

## Public Functions

### create-carbon-credit
Creates new carbon credits with specified verifier and details
```clarity
(create-carbon-credit verifier: principal amount: uint origin: string-ascii vintage-year: uint)
```

### transfer-credit
Transfers carbon credits between parties
```clarity
(transfer-credit recipient: principal credit-id: uint amount: uint)
```

### retire-credit
Permanently retires carbon credits
```clarity
(retire-credit credit-id: uint amount: uint)
```

### list-credit-for-sale
Creates a marketplace listing for credits
```clarity
(list-credit-for-sale credit-id: uint amount: uint price-per-credit: uint)
```

### cancel-listing
Removes a marketplace listing
```clarity
(cancel-listing listing-id: uint)
```

## Read-Only Functions

### get-credit
Retrieves carbon credit details
```clarity
(get-credit credit-id: uint)
```

### get-balance
Checks credit balance for an address
```clarity
(get-balance owner: principal credit-id: uint)
```

### get-listing
Retrieves marketplace listing details
```clarity
(get-listing listing-id: uint)
```

## Error Codes

- `err-owner-only (u100)`: Unauthorized contract owner operation
- `err-not-found (u101)`: Resource not found
- `err-unauthorized (u102)`: Unauthorized operation
- `err-already-listed (u103)`: Credit already listed
- `err-insufficient-balance (u104)`: Insufficient credit balance
- `err-invalid-price (u105)`: Invalid price specified
- `err-invalid-state (u106)`: Invalid credit state
- `err-overflow (u107)`: Arithmetic overflow
- `err-invalid-recipient (u108)`: Invalid recipient
- `err-insufficient-funds (u109)`: Insufficient STX balance

## Security Features

1. **Balance Protection**
    - Balance checks before transfers
    - Overflow protection
    - No self-transfers allowed

2. **Access Control**
    - Owner-only administrative functions
    - Seller-only listing management
    - Verifier designation system

3. **State Management**
    - Retired credits cannot be reused
    - Atomic transactions
    - Safe mathematical operations

## Usage Examples

1. Creating Carbon Credits:
```clarity
(contract-call? .carbon-credit-trading create-carbon-credit 
  'VERIFIER_ADDRESS 
  u1000 
  "Amazon Rainforest" 
  u2024)
```

2. Listing Credits for Sale:
```clarity
(contract-call? .carbon-credit-trading list-credit-for-sale 
  u1 
  u500 
  u100)
```

3. Buying Credits:
```clarity
(contract-call? .carbon-credit-trading buy-credit 
  u1 
  u100)
```

4. Retiring Credits:
```clarity
(contract-call? .carbon-credit-trading retire-credit 
  u1 
  u50)
```

## Testing

1. Install Clarinet:
```bash
curl -L https://install.clarinet.sh | sh
```

2. Run Tests:
```bash
clarinet test
```

## Deployment

1. Build Contract:
```bash
clarinet build
```

2. Deploy Contract:
```bash
clarinet deploy --network testnet
```

## Best Practices

1. Always verify credit details before trading
2. Check balances before initiating transfers
3. Verify listing details before purchase
4. Keep track of retired credits
5. Monitor transaction status

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Create pull request

## License

[Add your chosen license]

## Support

For questions or support:
1. Create an issue in the repository
2. Join our community channel
3. Contact the development team

## Acknowledgments

- Stacks Blockchain
- Clarity Language
- Carbon Credit Standards
