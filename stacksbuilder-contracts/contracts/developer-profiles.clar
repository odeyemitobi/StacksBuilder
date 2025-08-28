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

;; Helper function to validate string input
(define-private (is-valid-string (input (string-ascii 500)) (min-len uint) (max-len uint))
  (and 
    (>= (len input) min-len)
    (<= (len input) max-len)
  )
)

;; Helper function to validate optional string input
(define-private (is-valid-optional-string (input (string-ascii 500)) (max-len uint))
  (<= (len input) max-len)
)

;; Helper function to validate skills list
(define-private (is-valid-skills-list (skills (list 20 (string-ascii 30))))
  (<= (len skills) u20)
)

;; Helper function to validate specialties list
(define-private (is-valid-specialties-list (specialties (list 10 (string-ascii 50))))
  (<= (len specialties) u10)
)

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
    
    ;; Validate required input
    (asserts! (is-valid-string display-name u1 u50) ERR-INVALID-INPUT)
    (asserts! (is-valid-string bio u1 u500) ERR-INVALID-INPUT)
    
    ;; Validate optional input
    (asserts! (is-valid-optional-string location u100) ERR-INVALID-INPUT)
    (asserts! (is-valid-optional-string website u200) ERR-INVALID-INPUT)
    (asserts! (is-valid-optional-string github-username u50) ERR-INVALID-INPUT)
    (asserts! (is-valid-optional-string twitter-username u50) ERR-INVALID-INPUT)
    (asserts! (is-valid-optional-string linkedin-username u50) ERR-INVALID-INPUT)
    
    ;; Validate lists
    (asserts! (is-valid-skills-list skills) ERR-INVALID-INPUT)
    (asserts! (is-valid-specialties-list specialties) ERR-INVALID-INPUT)
    
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
    ;; Validate required input
    (asserts! (is-valid-string display-name u1 u50) ERR-INVALID-INPUT)
    (asserts! (is-valid-string bio u1 u500) ERR-INVALID-INPUT)
    
    ;; Validate optional input
    (asserts! (is-valid-optional-string location u100) ERR-INVALID-INPUT)
    (asserts! (is-valid-optional-string website u200) ERR-INVALID-INPUT)
    (asserts! (is-valid-optional-string github-username u50) ERR-INVALID-INPUT)
    (asserts! (is-valid-optional-string twitter-username u50) ERR-INVALID-INPUT)
    (asserts! (is-valid-optional-string linkedin-username u50) ERR-INVALID-INPUT)
    
    ;; Validate lists
    (asserts! (is-valid-skills-list skills) ERR-INVALID-INPUT)
    (asserts! (is-valid-specialties-list specialties) ERR-INVALID-INPUT)
    
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
    
    ;; Validate reputation score (should be between 0 and 1000)
    (asserts! (<= reputation-score u1000) ERR-INVALID-INPUT)
    
    ;; Validate other stats (reasonable upper bounds)
    (asserts! (<= endorsements-received u10000) ERR-INVALID-INPUT)
    (asserts! (<= projects-count u1000) ERR-INVALID-INPUT)
    (asserts! (<= contributions-count u100000) ERR-INVALID-INPUT)
    
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

;; Data variable for admin (for now, deployer is admin)
(define-data-var admin principal tx-sender)

;; Verify a profile (admin function)
(define-public (verify-profile (user principal))
  (let
    (
      (current-profile (unwrap! (map-get? profiles user) ERR-PROFILE-NOT-FOUND))
    )
    ;; Only admin can verify profiles
    (asserts! (is-eq tx-sender (var-get admin)) ERR-NOT-AUTHORIZED)
    
    ;; Validate user principal
    (asserts! (is-standard user) ERR-INVALID-INPUT)
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
