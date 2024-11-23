;; carbon-credit-trading.clar

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-already-listed (err u103))
(define-constant err-insufficient-balance (err u104))
(define-constant err-invalid-price (err u105))
(define-constant err-invalid-state (err u106))
(define-constant err-overflow (err u107))
(define-constant err-invalid-recipient (err u108))
(define-constant err-insufficient-funds (err u109))

;; Data variables
(define-data-var next-credit-id uint u0)
(define-data-var next-listing-id uint u0)

;; Data maps
(define-map carbon-credits
  { credit-id: uint }
  {
    owner: principal,
    verifier: principal,
    amount: uint,
    origin: (string-ascii 50),
    vintage-year: uint,
    is-retired: bool
  }
)

(define-map credit-balances
  { owner: principal, credit-id: uint }
  { balance: uint }
)

(define-map listings
  { listing-id: uint }
  {
    seller: principal,
    credit-id: uint,
    amount: uint,
    price-per-credit: uint
  }
)

;; Read-only functions
(define-read-only (get-credit (credit-id uint))
  (map-get? carbon-credits { credit-id: credit-id })
)

(define-read-only (get-balance (owner principal) (credit-id uint))
  (default-to u0
    (get balance (map-get? credit-balances { owner: owner, credit-id: credit-id }))
  )
)

(define-read-only (get-listing (listing-id uint))
  (map-get? listings { listing-id: listing-id })
)

