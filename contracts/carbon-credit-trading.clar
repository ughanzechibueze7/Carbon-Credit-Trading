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

;; Public functions
(define-public (create-carbon-credit (verifier principal) (amount uint) (origin (string-ascii 50)) (vintage-year uint))
  (let
    (
      (credit-id (var-get next-credit-id))
      (owner tx-sender)
    )
    (map-set carbon-credits
      { credit-id: credit-id }
      {
        owner: owner,
        verifier: verifier,
        amount: amount,
        origin: origin,
        vintage-year: vintage-year,
        is-retired: false
      }
    )
    (map-set credit-balances
      { owner: owner, credit-id: credit-id }
      { balance: amount }
    )
    (var-set next-credit-id (+ credit-id u1))
    (ok credit-id)
  )
)

(define-public (transfer-credit (recipient principal) (credit-id uint) (amount uint))
  (let
    (
      (sender tx-sender)
    )
    (asserts! (not (is-eq sender recipient)) (err err-invalid-recipient))
    (try! (decrease-credit-balance sender credit-id amount))
    (try! (increase-credit-balance recipient credit-id amount))
    (ok true)
  )
)

(define-private (decrease-credit-balance (owner principal) (credit-id uint) (amount uint))
  (let
    (
      (current-balance (get-balance owner credit-id))
    )
    (asserts! (>= current-balance amount) (err err-insufficient-balance))
    (map-set credit-balances
      { owner: owner, credit-id: credit-id }
      { balance: (- current-balance amount) }
    )
    (ok true)
  )
)

(define-private (increase-credit-balance (owner principal) (credit-id uint) (amount uint))
  (let
    (
      (current-balance (get-balance owner credit-id))
      (new-balance (+ current-balance amount))
    )
    (asserts! (<= new-balance u340282366920938463463374607431768211455) (err err-overflow))
    (map-set credit-balances
      { owner: owner, credit-id: credit-id }
      { balance: new-balance }
    )
    (ok true)
  )
)

(define-public (retire-credit (credit-id uint) (amount uint))
  (let
    (
      (owner tx-sender)
      (balance (get-balance owner credit-id))
      (credit (unwrap! (get-credit credit-id) (err err-not-found)))
    )
    (asserts! (>= balance amount) (err err-insufficient-balance))
    (asserts! (not (get is-retired credit)) (err err-invalid-state))
    (try! (decrease-credit-balance owner credit-id amount))
    (map-set carbon-credits
      { credit-id: credit-id }
      (merge credit { is-retired: true })
    )
    (ok true)
  )
)

