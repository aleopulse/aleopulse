// The PULSE token program - wrapper for token_registry.aleo integration
// PULSE is the native token for the LeoPulse polls and surveys platform
// Note: Actual token operations (mint, transfer) are done via token_registry.aleo
// which is called separately by the frontend. This contract tracks state.

program leopulse_token.aleo {
    // ============================================
    // CONSTANTS
    // ============================================

    // Maximum supply: 1 billion PULSE with 8 decimals
    const MAX_SUPPLY: u128 = 100_000_000_000_000_000u128;

    // Decimals for PULSE token
    const DECIMALS: u8 = 8u8;

    // Faucet amount for testnet (1000 PULSE)
    const FAUCET_AMOUNT: u128 = 100_000_000_000u128;

    // Role constants (matching token_registry.aleo)
    const MINTER_ROLE: u8 = 1u8;
    const BURNER_ROLE: u8 = 2u8;
    const SUPPLY_MANAGER_ROLE: u8 = 3u8;

    // ============================================
    // DATA STRUCTURES
    // ============================================

    // Token metadata stored on-chain
    struct TokenConfig {
        token_id: field,
        treasury: address,
        is_initialized: bool,
        minting_disabled: bool,
        total_minted: u128,
    }

    // ============================================
    // MAPPINGS (Public State)
    // ============================================

    // Single config mapping at key 0u8
    mapping config: u8 => TokenConfig;

    // Track faucet claims per address (testnet only)
    mapping faucet_claims: address => u64;

    // Maximum faucet claims per address
    mapping max_faucet_claims: u8 => u64;

    // ============================================
    // CONSTRUCTOR
    // ============================================

    @noupgrade
    async constructor() {}

    // ============================================
    // ADMIN TRANSITIONS
    // ============================================

    // Initialize the PULSE token - registers with token_registry
    // This should be called once after deployment
    async transition initialize(
        public token_id: field,
        public treasury: address,
        public name_field_1: field,
        public name_field_2: field,
        public name_field_3: field,
        public name_field_4: field,
        public symbol_field: field,
    ) -> Future {
        // Build the name array for token_registry
        // Name: "Pulse Token" encoded as 4 fields

        return finalize_initialize(
            token_id,
            treasury,
            self.caller
        );
    }

    async function finalize_initialize(
        token_id: field,
        treasury: address,
        admin: address
    ) {
        // Ensure not already initialized
        assert(!Mapping::contains(config, 0u8));

        // Create config
        let token_config: TokenConfig = TokenConfig {
            token_id: token_id,
            treasury: treasury,
            is_initialized: true,
            minting_disabled: false,
            total_minted: 0u128,
        };

        // Store config
        Mapping::set(config, 0u8, token_config);

        // Set max faucet claims (10 per address for testnet)
        Mapping::set(max_faucet_claims, 0u8, 10u64);
    }

    // Mint all tokens to treasury (one-time operation)
    // After this, minting is permanently disabled
    async transition mint_all_to_treasury() -> Future {
        return finalize_mint_all_to_treasury(self.caller);
    }

    async function finalize_mint_all_to_treasury(caller: address) {
        // Get config
        let token_config: TokenConfig = Mapping::get(config, 0u8);

        // Ensure initialized
        assert(token_config.is_initialized);

        // Ensure minting not already disabled
        assert(!token_config.minting_disabled);

        // Ensure caller is treasury (admin)
        assert_eq(caller, token_config.treasury);

        // Update config to disable minting and record total
        let updated_config: TokenConfig = TokenConfig {
            token_id: token_config.token_id,
            treasury: token_config.treasury,
            is_initialized: true,
            minting_disabled: true,
            total_minted: MAX_SUPPLY,
        };

        Mapping::set(config, 0u8, updated_config);

        // Note: Actual minting via token_registry.aleo/mint_public
        // must be called separately by the admin
    }

    // Update treasury address
    async transition set_treasury(public new_treasury: address) -> Future {
        return finalize_set_treasury(new_treasury, self.caller);
    }

    async function finalize_set_treasury(new_treasury: address, caller: address) {
        let token_config: TokenConfig = Mapping::get(config, 0u8);

        // Only current treasury can update
        assert_eq(caller, token_config.treasury);

        let updated_config: TokenConfig = TokenConfig {
            token_id: token_config.token_id,
            treasury: new_treasury,
            is_initialized: token_config.is_initialized,
            minting_disabled: token_config.minting_disabled,
            total_minted: token_config.total_minted,
        };

        Mapping::set(config, 0u8, updated_config);
    }

    // ============================================
    // FAUCET TRANSITIONS (Testnet Only)
    // ============================================

    // Claim tokens from faucet (testnet only)
    // Mints FAUCET_AMOUNT to the caller via token_registry
    async transition faucet() -> Future {
        return finalize_faucet(self.caller);
    }

    async function finalize_faucet(claimer: address) {
        let token_config: TokenConfig = Mapping::get(config, 0u8);

        // Ensure initialized
        assert(token_config.is_initialized);

        // Ensure minting is still enabled (testnet mode)
        assert(!token_config.minting_disabled);

        // Get current claims for this address
        let current_claims: u64 = Mapping::get_or_use(faucet_claims, claimer, 0u64);
        let max_claims: u64 = Mapping::get(max_faucet_claims, 0u8);

        // Ensure not exceeded max claims
        assert(current_claims < max_claims);

        // Increment claims
        Mapping::set(faucet_claims, claimer, current_claims + 1u64);

        // Update total minted
        let new_total: u128 = token_config.total_minted + FAUCET_AMOUNT;
        assert(new_total <= MAX_SUPPLY);

        let updated_config: TokenConfig = TokenConfig {
            token_id: token_config.token_id,
            treasury: token_config.treasury,
            is_initialized: token_config.is_initialized,
            minting_disabled: token_config.minting_disabled,
            total_minted: new_total,
        };

        Mapping::set(config, 0u8, updated_config);

        // Note: Actual token minting happens via token_registry.aleo/mint_public
        // This function tracks the state, frontend calls token_registry separately
    }

    // ============================================
    // VIEW FUNCTIONS (Inline helpers)
    // ============================================

    // These are inline functions that can be used by other programs
    // or queried via the mapping API

    inline get_max_supply() -> u128 {
        return MAX_SUPPLY;
    }

    inline get_decimals() -> u8 {
        return DECIMALS;
    }

    inline get_faucet_amount() -> u128 {
        return FAUCET_AMOUNT;
    }
}
