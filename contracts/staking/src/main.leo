// The Staking program - PULSE token staking with lock periods for LeoPulse
// Staking provides tier qualification for platform benefits

program leopulse_staking.aleo {
    // ============================================
    // CONSTANTS - Lock Periods (in blocks)
    // ============================================

    // Assuming ~1 block per second on Aleo (using u32 for block heights)
    const LOCK_7_DAYS: u32 = 604800u32;     // 7 * 24 * 60 * 60
    const LOCK_14_DAYS: u32 = 1209600u32;   // 14 * 24 * 60 * 60
    const LOCK_30_DAYS: u32 = 2592000u32;   // 30 * 24 * 60 * 60
    const LOCK_90_DAYS: u32 = 7776000u32;   // 90 * 24 * 60 * 60
    const LOCK_180_DAYS: u32 = 15552000u32; // 180 * 24 * 60 * 60
    const LOCK_365_DAYS: u32 = 31536000u32; // 365 * 24 * 60 * 60

    // Maximum positions per user
    const MAX_POSITIONS: u8 = 10u8;

    // ============================================
    // DATA STRUCTURES
    // ============================================

    // Staking pool configuration
    struct PoolConfig {
        admin: address,
        token_id: field,            // PULSE token ID in token_registry
        is_initialized: bool,
        total_staked: u128,
        stakers_count: u64,
    }

    // Individual stake position
    struct StakePosition {
        staker: address,
        amount: u64,
        staked_at: u32,             // Block height when staked
        lock_duration: u32,         // Lock duration in blocks
        unlock_at: u32,             // Block height when unlockable
        is_active: bool,
    }

    // ============================================
    // RECORDS (Private State)
    // ============================================

    // Stake receipt - proves ownership of a stake position
    record StakeReceipt {
        owner: address,
        position_id: field,
        amount: u64,
        unlock_at: u32,
    }

    // ============================================
    // MAPPINGS (Public State)
    // ============================================

    // Pool config at key 0u8
    mapping pool_config: u8 => PoolConfig;

    // Stake positions: position_id => StakePosition
    mapping positions: field => StakePosition;

    // User position count
    mapping user_position_count: address => u8;

    // User total staked
    mapping user_total_staked: address => u64;

    // Track position IDs per user: hash(user, index) => position_id
    mapping user_positions: field => field;

    // Position counter for unique IDs
    mapping position_counter: u8 => u64;

    // ============================================
    // CONSTRUCTOR
    // ============================================

    @noupgrade
    async constructor() {}

    // ============================================
    // ADMIN TRANSITIONS
    // ============================================

    // Initialize the staking pool
    async transition initialize(
        public admin: address,
        public token_id: field
    ) -> Future {
        return finalize_initialize(admin, token_id);
    }

    async function finalize_initialize(admin: address, token_id: field) {
        // Ensure not already initialized
        assert(!Mapping::contains(pool_config, 0u8));

        let config: PoolConfig = PoolConfig {
            admin: admin,
            token_id: token_id,
            is_initialized: true,
            total_staked: 0u128,
            stakers_count: 0u64,
        };

        Mapping::set(pool_config, 0u8, config);
        Mapping::set(position_counter, 0u8, 0u64);
    }

    // Transfer admin role
    async transition transfer_admin(public new_admin: address) -> Future {
        return finalize_transfer_admin(new_admin, self.caller);
    }

    async function finalize_transfer_admin(new_admin: address, caller: address) {
        let config: PoolConfig = Mapping::get(pool_config, 0u8);
        assert_eq(caller, config.admin);

        let updated_config: PoolConfig = PoolConfig {
            admin: new_admin,
            token_id: config.token_id,
            is_initialized: config.is_initialized,
            total_staked: config.total_staked,
            stakers_count: config.stakers_count,
        };

        Mapping::set(pool_config, 0u8, updated_config);
    }

    // ============================================
    // STAKING TRANSITIONS
    // ============================================

    // Stake PULSE tokens with a lock period
    async transition stake(
        public amount: u64,
        public lock_duration: u32
    ) -> (StakeReceipt, Future) {
        // Validate lock period
        assert(
            lock_duration == LOCK_7_DAYS ||
            lock_duration == LOCK_14_DAYS ||
            lock_duration == LOCK_30_DAYS ||
            lock_duration == LOCK_90_DAYS ||
            lock_duration == LOCK_180_DAYS ||
            lock_duration == LOCK_365_DAYS
        );

        // Validate amount
        assert(amount > 0u64);

        // Generate position ID from caller and amount (finalize will add uniqueness)
        let position_id_seed: field = BHP256::hash_to_field(self.caller);

        // Create stake receipt - unlock_at is placeholder, actual calculated in finalize
        let receipt: StakeReceipt = StakeReceipt {
            owner: self.caller,
            position_id: position_id_seed,
            amount: amount,
            unlock_at: 0u32,  // Placeholder - actual unlock time in mapping
        };

        return (receipt, finalize_stake(
            position_id_seed,
            self.caller,
            amount,
            lock_duration
        ));
    }

    async function finalize_stake(
        position_id_seed: field,
        staker: address,
        amount: u64,
        lock_duration: u32
    ) {
        // Get pool config
        let config: PoolConfig = Mapping::get(pool_config, 0u8);
        assert(config.is_initialized);

        // Get and increment counter for unique position ID
        let counter: u64 = Mapping::get(position_counter, 0u8);
        let position_id: field = BHP256::hash_to_field(position_id_seed + counter as field);
        Mapping::set(position_counter, 0u8, counter + 1u64);

        // Check position doesn't already exist
        assert(!Mapping::contains(positions, position_id));

        // Get user's current position count
        let current_count: u8 = Mapping::get_or_use(user_position_count, staker, 0u8);
        assert(current_count < MAX_POSITIONS);

        // Calculate unlock time
        let unlock_at: u32 = block.height + lock_duration;

        // Create position
        let position: StakePosition = StakePosition {
            staker: staker,
            amount: amount,
            staked_at: block.height,
            lock_duration: lock_duration,
            unlock_at: unlock_at,
            is_active: true,
        };

        // Store position
        Mapping::set(positions, position_id, position);

        // Update user position tracking
        let user_pos_key: field = BHP256::hash_to_field(staker as field + current_count as field);
        Mapping::set(user_positions, user_pos_key, position_id);
        Mapping::set(user_position_count, staker, current_count + 1u8);

        // Update user total staked
        let current_staked: u64 = Mapping::get_or_use(user_total_staked, staker, 0u64);
        Mapping::set(user_total_staked, staker, current_staked + amount);

        // Update pool totals - use ternary instead of conditional reassignment
        let is_new_staker: bool = current_count == 0u8;
        let new_stakers_count: u64 = is_new_staker ? config.stakers_count + 1u64 : config.stakers_count;

        let updated_config: PoolConfig = PoolConfig {
            admin: config.admin,
            token_id: config.token_id,
            is_initialized: config.is_initialized,
            total_staked: config.total_staked + amount as u128,
            stakers_count: new_stakers_count,
        };

        Mapping::set(pool_config, 0u8, updated_config);

        // Note: Actual token transfer happens via token_registry
        // Frontend coordinates this
    }

    // Unstake a specific position
    async transition unstake(
        receipt: StakeReceipt
    ) -> Future {
        // Verify ownership
        assert_eq(receipt.owner, self.caller);

        return finalize_unstake(receipt.position_id, self.caller, receipt.amount);
    }

    async function finalize_unstake(
        position_id: field,
        staker: address,
        amount: u64
    ) {
        // Get position
        let position: StakePosition = Mapping::get(positions, position_id);

        // Verify ownership
        assert_eq(position.staker, staker);

        // Verify position is active
        assert(position.is_active);

        // Check unlock time has passed
        assert(block.height >= position.unlock_at);

        // Mark position as inactive
        let updated_position: StakePosition = StakePosition {
            staker: position.staker,
            amount: position.amount,
            staked_at: position.staked_at,
            lock_duration: position.lock_duration,
            unlock_at: position.unlock_at,
            is_active: false,
        };

        Mapping::set(positions, position_id, updated_position);

        // Update user total staked
        let current_staked: u64 = Mapping::get(user_total_staked, staker);
        Mapping::set(user_total_staked, staker, current_staked - amount);

        // Update pool totals
        let config: PoolConfig = Mapping::get(pool_config, 0u8);

        // Check if user has any remaining active stakes - use ternary
        let remaining_staked: u64 = current_staked - amount;
        let new_stakers_count: u64 = remaining_staked == 0u64 ? config.stakers_count - 1u64 : config.stakers_count;

        let updated_config: PoolConfig = PoolConfig {
            admin: config.admin,
            token_id: config.token_id,
            is_initialized: config.is_initialized,
            total_staked: config.total_staked - amount as u128,
            stakers_count: new_stakers_count,
        };

        Mapping::set(pool_config, 0u8, updated_config);

        // Note: Actual token transfer back to user happens via token_registry
        // Frontend coordinates this
    }

    // Extend lock duration for an existing stake
    async transition extend_lock(
        receipt: StakeReceipt,
        public new_lock_duration: u32
    ) -> (StakeReceipt, Future) {
        // Verify ownership
        assert_eq(receipt.owner, self.caller);

        // Validate new lock period
        assert(
            new_lock_duration == LOCK_7_DAYS ||
            new_lock_duration == LOCK_14_DAYS ||
            new_lock_duration == LOCK_30_DAYS ||
            new_lock_duration == LOCK_90_DAYS ||
            new_lock_duration == LOCK_180_DAYS ||
            new_lock_duration == LOCK_365_DAYS
        );

        // Create new receipt with extended lock - unlock_at placeholder
        let new_receipt: StakeReceipt = StakeReceipt {
            owner: self.caller,
            position_id: receipt.position_id,
            amount: receipt.amount,
            unlock_at: 0u32,  // Placeholder - actual in mapping
        };

        return (new_receipt, finalize_extend_lock(
            receipt.position_id,
            self.caller,
            new_lock_duration
        ));
    }

    async function finalize_extend_lock(
        position_id: field,
        staker: address,
        new_lock_duration: u32
    ) {
        // Get position
        let position: StakePosition = Mapping::get(positions, position_id);

        // Verify ownership and active
        assert_eq(position.staker, staker);
        assert(position.is_active);

        // Calculate new unlock time
        let new_unlock_at: u32 = block.height + new_lock_duration;

        // New unlock must be later than current
        assert(new_unlock_at > position.unlock_at);

        // Update position
        let updated_position: StakePosition = StakePosition {
            staker: position.staker,
            amount: position.amount,
            staked_at: position.staked_at,
            lock_duration: new_lock_duration,
            unlock_at: new_unlock_at,
            is_active: true,
        };

        Mapping::set(positions, position_id, updated_position);
    }

    // Add more tokens to an existing stake
    async transition add_to_stake(
        receipt: StakeReceipt,
        public additional_amount: u64
    ) -> (StakeReceipt, Future) {
        // Verify ownership
        assert_eq(receipt.owner, self.caller);
        assert(additional_amount > 0u64);

        let new_amount: u64 = receipt.amount + additional_amount;

        // Create new receipt with updated amount
        let new_receipt: StakeReceipt = StakeReceipt {
            owner: self.caller,
            position_id: receipt.position_id,
            amount: new_amount,
            unlock_at: receipt.unlock_at,
        };

        return (new_receipt, finalize_add_to_stake(
            receipt.position_id,
            self.caller,
            additional_amount
        ));
    }

    async function finalize_add_to_stake(
        position_id: field,
        staker: address,
        additional_amount: u64
    ) {
        // Get position
        let position: StakePosition = Mapping::get(positions, position_id);

        // Verify ownership and active
        assert_eq(position.staker, staker);
        assert(position.is_active);

        // Update position amount
        let updated_position: StakePosition = StakePosition {
            staker: position.staker,
            amount: position.amount + additional_amount,
            staked_at: position.staked_at,
            lock_duration: position.lock_duration,
            unlock_at: position.unlock_at,
            is_active: true,
        };

        Mapping::set(positions, position_id, updated_position);

        // Update user total staked
        let current_staked: u64 = Mapping::get(user_total_staked, staker);
        Mapping::set(user_total_staked, staker, current_staked + additional_amount);

        // Update pool total
        let config: PoolConfig = Mapping::get(pool_config, 0u8);

        let updated_config: PoolConfig = PoolConfig {
            admin: config.admin,
            token_id: config.token_id,
            is_initialized: config.is_initialized,
            total_staked: config.total_staked + additional_amount as u128,
            stakers_count: config.stakers_count,
        };

        Mapping::set(pool_config, 0u8, updated_config);
    }

    // ============================================
    // INLINE HELPERS
    // ============================================

    inline is_valid_lock_period(duration: u32) -> bool {
        return duration == LOCK_7_DAYS ||
               duration == LOCK_14_DAYS ||
               duration == LOCK_30_DAYS ||
               duration == LOCK_90_DAYS ||
               duration == LOCK_180_DAYS ||
               duration == LOCK_365_DAYS;
    }

    inline get_lock_periods() -> [u32; 6] {
        return [LOCK_7_DAYS, LOCK_14_DAYS, LOCK_30_DAYS, LOCK_90_DAYS, LOCK_180_DAYS, LOCK_365_DAYS];
    }
}
