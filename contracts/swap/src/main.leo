// The Swap program - PULSE/Stablecoin AMM for LeoPulse
// Implements constant product (x * y = k) automated market maker

program leopulse_swap.aleo {
    // ============================================
    // CONSTANTS
    // ============================================

    // Fee settings (basis points)
    const DEFAULT_FEE_BPS: u64 = 30u64;     // 0.3% default fee
    const MAX_FEE_BPS: u64 = 500u64;        // 5% max fee
    const BPS_DENOMINATOR: u64 = 10000u64;

    // Minimum liquidity locked forever to prevent division by zero
    const MINIMUM_LIQUIDITY: u64 = 1000u64;

    // Precision for calculations
    const PRECISION: u128 = 1000000000000u128;  // 1e12

    // ============================================
    // DATA STRUCTURES
    // ============================================

    // Liquidity pool state
    struct PoolState {
        pulse_reserve: u128,
        stable_reserve: u128,
        total_lp_shares: u128,
        pulse_token_id: field,
        stable_token_id: field,
        fee_bps: u64,
        admin: address,
        is_initialized: bool,
    }

    // LP position info
    struct LPPosition {
        provider: address,
        shares: u128,
    }

    // ============================================
    // RECORDS (Private State)
    // ============================================

    // LP token representing liquidity position
    record LPToken {
        owner: address,
        shares: u128,
    }

    // ============================================
    // MAPPINGS (Public State)
    // ============================================

    // Pool state at key 0u8
    mapping pool: u8 => PoolState;

    // LP positions per address
    mapping lp_positions: address => u128;

    // ============================================
    // CONSTRUCTOR
    // ============================================

    @noupgrade
    async constructor() {}

    // ============================================
    // ADMIN TRANSITIONS
    // ============================================

    // Initialize the liquidity pool
    async transition initialize(
        public pulse_token_id: field,
        public stable_token_id: field,
        public fee_bps: u64,
        public admin: address
    ) -> Future {
        assert(fee_bps <= MAX_FEE_BPS);

        return finalize_initialize(pulse_token_id, stable_token_id, fee_bps, admin);
    }

    async function finalize_initialize(
        pulse_token_id: field,
        stable_token_id: field,
        fee_bps: u64,
        admin: address
    ) {
        // Ensure not already initialized
        assert(!Mapping::contains(pool, 0u8));

        let state: PoolState = PoolState {
            pulse_reserve: 0u128,
            stable_reserve: 0u128,
            total_lp_shares: 0u128,
            pulse_token_id: pulse_token_id,
            stable_token_id: stable_token_id,
            fee_bps: fee_bps,
            admin: admin,
            is_initialized: true,
        };

        Mapping::set(pool, 0u8, state);
    }

    // Update swap fee
    async transition set_fee(public new_fee_bps: u64) -> Future {
        assert(new_fee_bps <= MAX_FEE_BPS);
        return finalize_set_fee(new_fee_bps, self.caller);
    }

    async function finalize_set_fee(new_fee_bps: u64, caller: address) {
        let state: PoolState = Mapping::get(pool, 0u8);
        assert_eq(caller, state.admin);

        let updated_state: PoolState = PoolState {
            pulse_reserve: state.pulse_reserve,
            stable_reserve: state.stable_reserve,
            total_lp_shares: state.total_lp_shares,
            pulse_token_id: state.pulse_token_id,
            stable_token_id: state.stable_token_id,
            fee_bps: new_fee_bps,
            admin: state.admin,
            is_initialized: state.is_initialized,
        };

        Mapping::set(pool, 0u8, updated_state);
    }

    // Transfer admin role
    async transition transfer_admin(public new_admin: address) -> Future {
        return finalize_transfer_admin(new_admin, self.caller);
    }

    async function finalize_transfer_admin(new_admin: address, caller: address) {
        let state: PoolState = Mapping::get(pool, 0u8);
        assert_eq(caller, state.admin);

        let updated_state: PoolState = PoolState {
            pulse_reserve: state.pulse_reserve,
            stable_reserve: state.stable_reserve,
            total_lp_shares: state.total_lp_shares,
            pulse_token_id: state.pulse_token_id,
            stable_token_id: state.stable_token_id,
            fee_bps: state.fee_bps,
            admin: new_admin,
            is_initialized: state.is_initialized,
        };

        Mapping::set(pool, 0u8, updated_state);
    }

    // ============================================
    // LIQUIDITY TRANSITIONS
    // ============================================

    // Add liquidity to the pool
    async transition add_liquidity(
        public pulse_amount: u64,
        public stable_amount: u64,
        public min_lp_shares: u64
    ) -> (LPToken, Future) {
        assert(pulse_amount > 0u64);
        assert(stable_amount > 0u64);

        // LP token will have shares calculated in finalize
        let lp_token: LPToken = LPToken {
            owner: self.caller,
            shares: 0u128,  // Placeholder, actual shares calculated on-chain
        };

        return (lp_token, finalize_add_liquidity(
            self.caller,
            pulse_amount as u128,
            stable_amount as u128,
            min_lp_shares as u128
        ));
    }

    async function finalize_add_liquidity(
        provider: address,
        pulse_amount: u128,
        stable_amount: u128,
        min_lp_shares: u128
    ) {
        let state: PoolState = Mapping::get(pool, 0u8);
        assert(state.is_initialized);

        // Calculate LP shares using ternary operators (Leo doesn't support conditional reassignment)
        let product: u128 = pulse_amount * stable_amount;
        let first_liquidity_shares: u128 = sqrt_u128(product) - MINIMUM_LIQUIDITY as u128;

        // For subsequent liquidity, calculate both and take minimum
        // Use safe division with fallback to 0 if reserves are 0
        let shares_from_pulse: u128 = state.pulse_reserve > 0u128 ?
            (pulse_amount * state.total_lp_shares) / state.pulse_reserve : 0u128;
        let shares_from_stable: u128 = state.stable_reserve > 0u128 ?
            (stable_amount * state.total_lp_shares) / state.stable_reserve : 0u128;
        let subsequent_shares: u128 = shares_from_pulse < shares_from_stable ?
            shares_from_pulse : shares_from_stable;

        // Choose based on whether this is first liquidity or subsequent
        let lp_shares: u128 = state.total_lp_shares == 0u128 ?
            first_liquidity_shares : subsequent_shares;

        assert(lp_shares >= min_lp_shares);

        // Update state
        let updated_state: PoolState = PoolState {
            pulse_reserve: state.pulse_reserve + pulse_amount,
            stable_reserve: state.stable_reserve + stable_amount,
            total_lp_shares: state.total_lp_shares + lp_shares,
            pulse_token_id: state.pulse_token_id,
            stable_token_id: state.stable_token_id,
            fee_bps: state.fee_bps,
            admin: state.admin,
            is_initialized: state.is_initialized,
        };

        Mapping::set(pool, 0u8, updated_state);

        // Update LP position
        let current_shares: u128 = Mapping::get_or_use(lp_positions, provider, 0u128);
        Mapping::set(lp_positions, provider, current_shares + lp_shares);

        // Note: Actual token transfers happen via token_registry
        // Frontend coordinates this
    }

    // Remove liquidity from the pool
    async transition remove_liquidity(
        lp_token: LPToken,
        public shares_to_remove: u64,
        public min_pulse_out: u64,
        public min_stable_out: u64
    ) -> Future {
        assert_eq(lp_token.owner, self.caller);
        assert(shares_to_remove as u128 <= lp_token.shares);

        return finalize_remove_liquidity(
            self.caller,
            shares_to_remove as u128,
            min_pulse_out as u128,
            min_stable_out as u128
        );
    }

    async function finalize_remove_liquidity(
        provider: address,
        shares_to_remove: u128,
        min_pulse_out: u128,
        min_stable_out: u128
    ) {
        let state: PoolState = Mapping::get(pool, 0u8);
        assert(state.is_initialized);
        assert(state.total_lp_shares > 0u128);

        // Check provider has enough shares
        let current_shares: u128 = Mapping::get(lp_positions, provider);
        assert(current_shares >= shares_to_remove);

        // Calculate output amounts proportional to shares
        let pulse_out: u128 = (shares_to_remove * state.pulse_reserve) / state.total_lp_shares;
        let stable_out: u128 = (shares_to_remove * state.stable_reserve) / state.total_lp_shares;

        // Check minimums
        assert(pulse_out >= min_pulse_out);
        assert(stable_out >= min_stable_out);

        // Update state
        let updated_state: PoolState = PoolState {
            pulse_reserve: state.pulse_reserve - pulse_out,
            stable_reserve: state.stable_reserve - stable_out,
            total_lp_shares: state.total_lp_shares - shares_to_remove,
            pulse_token_id: state.pulse_token_id,
            stable_token_id: state.stable_token_id,
            fee_bps: state.fee_bps,
            admin: state.admin,
            is_initialized: state.is_initialized,
        };

        Mapping::set(pool, 0u8, updated_state);

        // Update LP position
        Mapping::set(lp_positions, provider, current_shares - shares_to_remove);

        // Note: Actual token transfers back to provider happen via token_registry
        // Frontend coordinates this
    }

    // ============================================
    // SWAP TRANSITIONS
    // ============================================

    // Swap PULSE for stablecoin
    async transition swap_pulse_to_stable(
        public pulse_amount_in: u64,
        public min_stable_out: u64
    ) -> Future {
        assert(pulse_amount_in > 0u64);

        return finalize_swap_pulse_to_stable(
            self.caller,
            pulse_amount_in as u128,
            min_stable_out as u128
        );
    }

    async function finalize_swap_pulse_to_stable(
        trader: address,
        amount_in: u128,
        min_out: u128
    ) {
        let state: PoolState = Mapping::get(pool, 0u8);
        assert(state.is_initialized);
        assert(state.pulse_reserve > 0u128);
        assert(state.stable_reserve > 0u128);

        // Calculate output using constant product formula with fee
        // amount_out = (amount_in * (1 - fee) * reserve_out) / (reserve_in + amount_in * (1 - fee))
        let fee_multiplier: u128 = (BPS_DENOMINATOR - state.fee_bps) as u128;
        let amount_in_with_fee: u128 = amount_in * fee_multiplier;

        let numerator: u128 = amount_in_with_fee * state.stable_reserve;
        let denominator: u128 = (state.pulse_reserve * BPS_DENOMINATOR as u128) + amount_in_with_fee;

        let stable_out: u128 = numerator / denominator;

        // Slippage check
        assert(stable_out >= min_out);

        // K invariant check (with tolerance for rounding)
        let new_pulse_reserve: u128 = state.pulse_reserve + amount_in;
        let new_stable_reserve: u128 = state.stable_reserve - stable_out;
        let old_k: u128 = state.pulse_reserve * state.stable_reserve;
        let new_k: u128 = new_pulse_reserve * new_stable_reserve;
        assert(new_k >= old_k);  // K should never decrease

        // Update reserves
        let updated_state: PoolState = PoolState {
            pulse_reserve: new_pulse_reserve,
            stable_reserve: new_stable_reserve,
            total_lp_shares: state.total_lp_shares,
            pulse_token_id: state.pulse_token_id,
            stable_token_id: state.stable_token_id,
            fee_bps: state.fee_bps,
            admin: state.admin,
            is_initialized: state.is_initialized,
        };

        Mapping::set(pool, 0u8, updated_state);

        // Note: Actual token transfers happen via token_registry
        // Frontend coordinates: transfer pulse_in from trader, transfer stable_out to trader
    }

    // Swap stablecoin for PULSE
    async transition swap_stable_to_pulse(
        public stable_amount_in: u64,
        public min_pulse_out: u64
    ) -> Future {
        assert(stable_amount_in > 0u64);

        return finalize_swap_stable_to_pulse(
            self.caller,
            stable_amount_in as u128,
            min_pulse_out as u128
        );
    }

    async function finalize_swap_stable_to_pulse(
        trader: address,
        amount_in: u128,
        min_out: u128
    ) {
        let state: PoolState = Mapping::get(pool, 0u8);
        assert(state.is_initialized);
        assert(state.pulse_reserve > 0u128);
        assert(state.stable_reserve > 0u128);

        // Calculate output using constant product formula with fee
        let fee_multiplier: u128 = (BPS_DENOMINATOR - state.fee_bps) as u128;
        let amount_in_with_fee: u128 = amount_in * fee_multiplier;

        let numerator: u128 = amount_in_with_fee * state.pulse_reserve;
        let denominator: u128 = (state.stable_reserve * BPS_DENOMINATOR as u128) + amount_in_with_fee;

        let pulse_out: u128 = numerator / denominator;

        // Slippage check
        assert(pulse_out >= min_out);

        // K invariant check
        let new_stable_reserve: u128 = state.stable_reserve + amount_in;
        let new_pulse_reserve: u128 = state.pulse_reserve - pulse_out;
        let old_k: u128 = state.pulse_reserve * state.stable_reserve;
        let new_k: u128 = new_pulse_reserve * new_stable_reserve;
        assert(new_k >= old_k);

        // Update reserves
        let updated_state: PoolState = PoolState {
            pulse_reserve: new_pulse_reserve,
            stable_reserve: new_stable_reserve,
            total_lp_shares: state.total_lp_shares,
            pulse_token_id: state.pulse_token_id,
            stable_token_id: state.stable_token_id,
            fee_bps: state.fee_bps,
            admin: state.admin,
            is_initialized: state.is_initialized,
        };

        Mapping::set(pool, 0u8, updated_state);
    }

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    // Integer square root using Babylonian method (Newton-Raphson)
    // Unrolled iterations since Leo doesn't support mutable variables
    inline sqrt_u128(x: u128) -> u128 {
        // Handle edge case
        if x == 0u128 {
            return 0u128;
        }
        if x == 1u128 {
            return 1u128;
        }

        // Initial guess
        let g0: u128 = x;
        let g1: u128 = (g0 + x / g0) / 2u128;
        let g2: u128 = (g1 + x / g1) / 2u128;
        let g3: u128 = (g2 + x / g2) / 2u128;
        let g4: u128 = (g3 + x / g3) / 2u128;
        let g5: u128 = (g4 + x / g4) / 2u128;
        let g6: u128 = (g5 + x / g5) / 2u128;
        let g7: u128 = (g6 + x / g6) / 2u128;
        let g8: u128 = (g7 + x / g7) / 2u128;
        let g9: u128 = (g8 + x / g8) / 2u128;
        let g10: u128 = (g9 + x / g9) / 2u128;
        let g11: u128 = (g10 + x / g10) / 2u128;
        let g12: u128 = (g11 + x / g11) / 2u128;
        let g13: u128 = (g12 + x / g12) / 2u128;
        let g14: u128 = (g13 + x / g13) / 2u128;
        let g15: u128 = (g14 + x / g14) / 2u128;

        // Return the last iteration (converged result)
        return g15;
    }

    // ============================================
    // VIEW HELPERS (Inline)
    // ============================================

    inline get_default_fee_bps() -> u64 {
        return DEFAULT_FEE_BPS;
    }

    inline get_max_fee_bps() -> u64 {
        return MAX_FEE_BPS;
    }

    inline get_minimum_liquidity() -> u64 {
        return MINIMUM_LIQUIDITY;
    }
}
