;; Developer Profiles Smart Contract
;; This contract manages developer profiles on the StacksBuilder platform

;; Error constants
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-PROFILE-NOT-FOUND (err u101))
(define-constant ERR-PROFILE-ALREADY-EXISTS (err u102))
(define-constant ERR-INVALID-INPUT (err u103))

;; Data maps
(define-map profiles 
  principal 
  {
    display-name: (string-ascii 50),
    bio: (string-ascii 500),
    location: (string-ascii 100),
    website: (string-ascii 200),
    github-username: (string-ascii 50),
    twitter-username: (string-ascii 50),
    linkedin-username: (string-ascii 50),
    skills: (list 20 (string-ascii 30)),
    specialties: (list 10 (string-ascii 50)),
    created-at: uint,
    updated-at: uint,
    is-verified: bool
  }
)

;; Profile statistics
(define-map profile-stats
  principal
  {
    reputation-score: uint,
    endorsements-received: uint,
    projects-count: uint,
    contributions-count: uint
  }
)

;; Data variables
(define-data-var total-profiles uint u0)

;; Read-only functions

;; Get profile by address
(define-read-only (get-profile (user principal))
  (map-get? profiles user)
)

;; Get profile statistics
(define-read-only (get-profile-stats (user principal))
  (map-get? profile-stats user)
)

;; Check if profile exists
(define-read-only (profile-exists (user principal))
  (is-some (map-get? profiles user))
)

;; Get total number of profiles
(define-read-only (get-total-profiles)
  (var-get total-profiles)
)

;; Public functions

;; Create a new developer profile
(define-public (create-profile 
  (display-name (string-ascii 50))
  (bio (string-ascii 500))
  (location (string-ascii 100))
  (website (string-ascii 200))
  (github-username (string-ascii 50))
  (twitter-username (string-ascii 50))
  (linkedin-username (string-ascii 50))
  (skills (list 20 (string-ascii 30)))
  (specialties (list 10 (string-ascii 50)))
)
  (let 
    (
      (caller tx-sender)
      (current-block-height block-height)
    )
    ;; Check if profile already exists
    (asserts! (is-none (map-get? profiles caller)) ERR-PROFILE-ALREADY-EXISTS)
    
    ;; Validate input
    (asserts! (> (len display-name) u0) ERR-INVALID-INPUT)
    (asserts! (> (len bio) u0) ERR-INVALID-INPUT)
    
    ;; Create the profile
    (map-set profiles caller {
      display-name: display-name,
      bio: bio,
      location: location,
      website: website,
      github-username: github-username,
      twitter-username: twitter-username,
      linkedin-username: linkedin-username,
      skills: skills,
      specialties: specialties,
      created-at: current-block-height,
      updated-at: current-block-height,
      is-verified: false
    })
    
    ;; Initialize profile stats
    (map-set profile-stats caller {
      reputation-score: u100,
      endorsements-received: u0,
      projects-count: u0,
      contributions-count: u0
    })
    
    ;; Increment total profiles counter
    (var-set total-profiles (+ (var-get total-profiles) u1))
    
    (ok true)
  )
)

;; Update an existing profile
(define-public (update-profile 
  (display-name (string-ascii 50))
  (bio (string-ascii 500))
  (location (string-ascii 100))
  (website (string-ascii 200))
  (github-username (string-ascii 50))
  (twitter-username (string-ascii 50))
  (linkedin-username (string-ascii 50))
  (skills (list 20 (string-ascii 30)))
  (specialties (list 10 (string-ascii 50)))
)
  (let 
    (
      (caller tx-sender)
      (current-profile (unwrap! (map-get? profiles caller) ERR-PROFILE-NOT-FOUND))
    )
    ;; Validate input
    (asserts! (> (len display-name) u0) ERR-INVALID-INPUT)
    (asserts! (> (len bio) u0) ERR-INVALID-INPUT)
    
    ;; Update the profile
    (map-set profiles caller {
      display-name: display-name,
      bio: bio,
      location: location,
      website: website,
      github-username: github-username,
      twitter-username: twitter-username,
      linkedin-username: linkedin-username,
      skills: skills,
      specialties: specialties,
      created-at: (get created-at current-profile),
      updated-at: block-height,
      is-verified: (get is-verified current-profile)
    })
    
    (ok true)
  )
)

;; Update profile statistics (can be called by authorized contracts)
(define-public (update-profile-stats 
  (user principal)
  (reputation-score uint)
  (endorsements-received uint)
  (projects-count uint)
  (contributions-count uint)
)
  (begin
    ;; Check if profile exists
    (asserts! (is-some (map-get? profiles user)) ERR-PROFILE-NOT-FOUND)
    
    ;; Update stats
    (map-set profile-stats user {
      reputation-score: reputation-score,
      endorsements-received: endorsements-received,
      projects-count: projects-count,
      contributions-count: contributions-count
    })
    
    (ok true)
  )
)

;; Verify a profile (admin function - for now anyone can call it)
(define-public (verify-profile (user principal))
  (let
    (
      (current-profile (unwrap! (map-get? profiles user) ERR-PROFILE-NOT-FOUND))
    )
    ;; Update verification status
    (map-set profiles user (merge current-profile { is-verified: true }))

    (ok true)
  )
)

;; Delete a profile (only the profile owner can delete their own profile)
(define-public (delete-profile)
  (let
    (
      (user tx-sender)
      (current-profile (unwrap! (map-get? profiles user) ERR-PROFILE-NOT-FOUND))
    )
    ;; Only the profile owner can delete their profile
    (asserts! (is-eq tx-sender user) ERR-NOT-AUTHORIZED)

    ;; Delete the profile
    (map-delete profiles user)

    ;; Delete profile stats if they exist
    (map-delete profile-stats user)

    ;; Decrease total profiles count
    (var-set total-profiles (- (var-get total-profiles) u1))

    (ok true)
  )
)
