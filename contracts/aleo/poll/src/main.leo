// The Poll program - privacy-preserving polls and surveys for LeoPulse
// Supports configurable privacy: anonymous, semi-private, and identified voting

program leopulse_poll.aleo {
    // ============================================
    // CONSTANTS
    // ============================================

    // Privacy modes (for vote choices)
    const PRIVACY_ANONYMOUS: u8 = 0u8;
    const PRIVACY_SEMI_PRIVATE: u8 = 1u8;
    const PRIVACY_IDENTIFIED: u8 = 2u8;

    // Poll visibility modes
    const VISIBILITY_PUBLIC: u8 = 0u8;
    const VISIBILITY_PRIVATE: u8 = 1u8;

    // Poll status
    const STATUS_ACTIVE: u8 = 0u8;
    const STATUS_CLOSED: u8 = 1u8;
    const STATUS_CLAIMING: u8 = 2u8;
    const STATUS_FINALIZED: u8 = 3u8;

    // Distribution modes
    const DIST_PULL: u8 = 0u8;
    const DIST_PUSH: u8 = 1u8;

    // Platform fee: 2% (200 basis points)
    const DEFAULT_FEE_BPS: u64 = 200u64;
    const MAX_FEE_BPS: u64 = 1000u64;
    const BPS_DENOMINATOR: u64 = 10000u64;

    const MAX_OPTIONS: u8 = 4u8;  // Reduced to fit parameter limits

    // ============================================
    // DATA STRUCTURES
    // ============================================

    struct PollSettings {
        privacy_mode: u8,
        show_results_live: bool,
        require_receipt: bool,
        visibility: u8,  // 0 = public, 1 = private (invite-only)
    }

    // Core poll information - use u32 for block heights
    struct PollInfo {
        id: u64,
        creator: address,
        title: field,
        description: field,
        option_count: u8,
        reward_per_vote: u64,
        reward_pool: u64,
        max_voters: u64,
        distribution_mode: u8,
        status: u8,
        token_id: field,
        end_block: u32,
        closed_at: u32,
    }

    struct PollOption {
        poll_id: u64,
        index: u8,
        text: field,
    }

    struct PlatformConfig {
        admin: address,
        treasury: address,
        fee_bps: u64,
        claim_period_blocks: u32,
        total_fees_collected: u128,
    }

    // Input struct for poll creation to reduce parameters
    struct CreatePollInput {
        title: field,
        description: field,
        option_0: field,
        option_1: field,
        option_2: field,
        option_3: field,
        option_count: u8,
        privacy_mode: u8,
        show_results_live: bool,
        reward_per_vote: u64,
        max_voters: u64,
        duration_blocks: u32,
        fund_amount: u64,
        token_id: field,
        visibility: u8,  // 0 = public, 1 = private
    }

    // ============================================
    // RECORDS (Private State)
    // ============================================

    record VoteReceipt {
        owner: address,
        poll_id: u64,
        option_index: u8,
        voted_at: u32,
    }

    record RewardTicket {
        owner: address,
        poll_id: u64,
        amount: u64,
        token_id: field,
    }

    record PollTicket {
        owner: address,
        poll_id: u64,
        is_active: bool,
    }

    // Invite record for private polls
    record PollInvite {
        owner: address,
        poll_id: u64,
        can_vote: bool,
        expires_block: u32,
    }

    // ============================================
    // MAPPINGS (Public State)
    // ============================================

    mapping platform_config: u8 => PlatformConfig;
    mapping poll_count: u8 => u64;
    mapping polls: u64 => PollInfo;
    mapping poll_settings: u64 => PollSettings;
    mapping poll_options: field => PollOption;
    mapping vote_counts: field => u64;
    mapping total_voters: u64 => u64;
    mapping has_voted: field => bool;
    mapping public_votes: field => u8;
    mapping has_claimed: field => bool;
    // Track which polls are private (visibility = 1)
    mapping private_polls: u64 => bool;
    // Track invite count per poll (for management)
    mapping invite_counts: u64 => u64;

    // ============================================
    // CONSTRUCTOR
    // ============================================

    @noupgrade
    async constructor() {}

    // ============================================
    // ADMIN TRANSITIONS
    // ============================================

    async transition initialize(
        public admin: address,
        public treasury: address,
        public fee_bps: u64,
        public claim_period_blocks: u32
    ) -> Future {
        assert(fee_bps <= MAX_FEE_BPS);
        return finalize_initialize(admin, treasury, fee_bps, claim_period_blocks);
    }

    async function finalize_initialize(
        admin: address,
        treasury: address,
        fee_bps: u64,
        claim_period_blocks: u32
    ) {
        assert(!Mapping::contains(platform_config, 0u8));

        let config: PlatformConfig = PlatformConfig {
            admin: admin,
            treasury: treasury,
            fee_bps: fee_bps,
            claim_period_blocks: claim_period_blocks,
            total_fees_collected: 0u128,
        };

        Mapping::set(platform_config, 0u8, config);
        Mapping::set(poll_count, 0u8, 0u64);
    }

    async transition set_platform_fee(public new_fee_bps: u64) -> Future {
        assert(new_fee_bps <= MAX_FEE_BPS);
        return finalize_set_platform_fee(new_fee_bps, self.caller);
    }

    async function finalize_set_platform_fee(new_fee_bps: u64, caller: address) {
        let config: PlatformConfig = Mapping::get(platform_config, 0u8);
        assert_eq(caller, config.admin);

        let updated_config: PlatformConfig = PlatformConfig {
            admin: config.admin,
            treasury: config.treasury,
            fee_bps: new_fee_bps,
            claim_period_blocks: config.claim_period_blocks,
            total_fees_collected: config.total_fees_collected,
        };

        Mapping::set(platform_config, 0u8, updated_config);
    }

    async transition transfer_admin(public new_admin: address) -> Future {
        return finalize_transfer_admin(new_admin, self.caller);
    }

    async function finalize_transfer_admin(new_admin: address, caller: address) {
        let config: PlatformConfig = Mapping::get(platform_config, 0u8);
        assert_eq(caller, config.admin);

        let updated_config: PlatformConfig = PlatformConfig {
            admin: new_admin,
            treasury: config.treasury,
            fee_bps: config.fee_bps,
            claim_period_blocks: config.claim_period_blocks,
            total_fees_collected: config.total_fees_collected,
        };

        Mapping::set(platform_config, 0u8, updated_config);
    }

    // ============================================
    // POLL CREATION
    // ============================================

    async transition create_poll(
        public input: CreatePollInput
    ) -> (PollTicket, Future) {
        assert(input.option_count > 0u8);
        assert(input.option_count <= MAX_OPTIONS);
        assert(input.privacy_mode <= PRIVACY_IDENTIFIED);
        assert(input.visibility <= VISIBILITY_PRIVATE);

        let ticket: PollTicket = PollTicket {
            owner: self.caller,
            poll_id: 0u64,
            is_active: true,
        };

        return (ticket, finalize_create_poll(self.caller, input));
    }

    async function finalize_create_poll(
        creator: address,
        input: CreatePollInput
    ) {
        let config: PlatformConfig = Mapping::get(platform_config, 0u8);

        let fee: u64 = (input.fund_amount * config.fee_bps) / BPS_DENOMINATOR;
        let net_amount: u64 = input.fund_amount - fee;

        let poll_id: u64 = Mapping::get(poll_count, 0u8);

        let poll_info: PollInfo = PollInfo {
            id: poll_id,
            creator: creator,
            title: input.title,
            description: input.description,
            option_count: input.option_count,
            reward_per_vote: input.reward_per_vote,
            reward_pool: net_amount,
            max_voters: input.max_voters,
            distribution_mode: DIST_PULL,
            status: STATUS_ACTIVE,
            token_id: input.token_id,
            end_block: block.height + input.duration_blocks,
            closed_at: 0u32,
        };

        let settings: PollSettings = PollSettings {
            privacy_mode: input.privacy_mode,
            show_results_live: input.show_results_live,
            require_receipt: true,
            visibility: input.visibility,
        };

        Mapping::set(polls, poll_id, poll_info);
        Mapping::set(poll_settings, poll_id, settings);
        Mapping::set(total_voters, poll_id, 0u64);

        // Mark as private if visibility is set to private
        if input.visibility == VISIBILITY_PRIVATE {
            Mapping::set(private_polls, poll_id, true);
            Mapping::set(invite_counts, poll_id, 0u64);
        }

        // Store options
        if input.option_count > 0u8 {
            let key_0: field = BHP256::hash_to_field(poll_id as field + 0field);
            Mapping::set(poll_options, key_0, PollOption { poll_id: poll_id, index: 0u8, text: input.option_0 });
            Mapping::set(vote_counts, key_0, 0u64);
        }
        if input.option_count > 1u8 {
            let key_1: field = BHP256::hash_to_field(poll_id as field + 1field);
            Mapping::set(poll_options, key_1, PollOption { poll_id: poll_id, index: 1u8, text: input.option_1 });
            Mapping::set(vote_counts, key_1, 0u64);
        }
        if input.option_count > 2u8 {
            let key_2: field = BHP256::hash_to_field(poll_id as field + 2field);
            Mapping::set(poll_options, key_2, PollOption { poll_id: poll_id, index: 2u8, text: input.option_2 });
            Mapping::set(vote_counts, key_2, 0u64);
        }
        if input.option_count > 3u8 {
            let key_3: field = BHP256::hash_to_field(poll_id as field + 3field);
            Mapping::set(poll_options, key_3, PollOption { poll_id: poll_id, index: 3u8, text: input.option_3 });
            Mapping::set(vote_counts, key_3, 0u64);
        }

        Mapping::set(poll_count, 0u8, poll_id + 1u64);

        let updated_config: PlatformConfig = PlatformConfig {
            admin: config.admin,
            treasury: config.treasury,
            fee_bps: config.fee_bps,
            claim_period_blocks: config.claim_period_blocks,
            total_fees_collected: config.total_fees_collected + fee as u128,
        };
        Mapping::set(platform_config, 0u8, updated_config);
    }

    // ============================================
    // VOTING
    // ============================================

    async transition vote(
        public poll_id: u64,
        public option_index: u8
    ) -> (VoteReceipt, Future) {
        // Note: voted_at will be set in finalize via mapping, receipt gets 0 as placeholder
        let receipt: VoteReceipt = VoteReceipt {
            owner: self.caller,
            poll_id: poll_id,
            option_index: option_index,
            voted_at: 0u32,  // Placeholder - actual block recorded in mapping
        };

        return (receipt, finalize_vote(poll_id, option_index, self.caller));
    }

    async function finalize_vote(
        poll_id: u64,
        option_index: u8,
        voter: address
    ) {
        let poll_info: PollInfo = Mapping::get(polls, poll_id);
        let settings: PollSettings = Mapping::get(poll_settings, poll_id);

        assert_eq(poll_info.status, STATUS_ACTIVE);
        assert(block.height <= poll_info.end_block);
        assert(option_index < poll_info.option_count);

        let current_voters: u64 = Mapping::get(total_voters, poll_id);
        if poll_info.max_voters > 0u64 {
            assert(current_voters < poll_info.max_voters);
        }

        let voter_key: field = BHP256::hash_to_field(poll_id as field + voter as field);
        assert(!Mapping::contains(has_voted, voter_key));

        Mapping::set(has_voted, voter_key, true);

        let option_key: field = BHP256::hash_to_field(poll_id as field + option_index as field);
        let current_count: u64 = Mapping::get_or_use(vote_counts, option_key, 0u64);
        Mapping::set(vote_counts, option_key, current_count + 1u64);

        Mapping::set(total_voters, poll_id, current_voters + 1u64);

        if settings.privacy_mode == PRIVACY_IDENTIFIED {
            Mapping::set(public_votes, voter_key, option_index);
        }
    }

    // ============================================
    // PRIVATE POLL INVITATIONS
    // ============================================

    // Issue an invite to a private poll (creator only)
    // Uses PollTicket to prove ownership
    transition invite_to_poll(
        ticket: PollTicket,
        invitee: address,
        can_vote: bool,
        expires_block: u32
    ) -> (PollInvite, PollTicket) {
        // Verify ticket is active (implicit ownership via record consumption)
        assert(ticket.is_active);

        // Create invite for the invitee
        let invite: PollInvite = PollInvite {
            owner: invitee,
            poll_id: ticket.poll_id,
            can_vote: can_vote,
            expires_block: expires_block,
        };

        // Return new ticket to creator (so they can issue more invites)
        let new_ticket: PollTicket = PollTicket {
            owner: ticket.owner,
            poll_id: ticket.poll_id,
            is_active: ticket.is_active,
        };

        return (invite, new_ticket);
    }

    // Vote on a private poll using an invite record
    async transition vote_private(
        invite: PollInvite,
        public option_index: u8
    ) -> (VoteReceipt, Future) {
        // Verify invite allows voting
        assert(invite.can_vote);

        // Create receipt for the voter
        let receipt: VoteReceipt = VoteReceipt {
            owner: invite.owner,
            poll_id: invite.poll_id,
            option_index: option_index,
            voted_at: 0u32,  // Placeholder - actual block recorded in mapping
        };

        return (receipt, finalize_vote_private(invite.poll_id, option_index, invite.owner, invite.expires_block));
    }

    async function finalize_vote_private(
        poll_id: u64,
        option_index: u8,
        voter: address,
        expires_block: u32
    ) {
        let poll_info: PollInfo = Mapping::get(polls, poll_id);
        let settings: PollSettings = Mapping::get(poll_settings, poll_id);

        // Verify poll is private
        assert_eq(settings.visibility, VISIBILITY_PRIVATE);

        // Verify poll is active
        assert_eq(poll_info.status, STATUS_ACTIVE);
        assert(block.height <= poll_info.end_block);

        // Verify invite hasn't expired
        assert(block.height <= expires_block);

        // Verify valid option
        assert(option_index < poll_info.option_count);

        // Check max voters if set
        let current_voters: u64 = Mapping::get(total_voters, poll_id);
        if poll_info.max_voters > 0u64 {
            assert(current_voters < poll_info.max_voters);
        }

        // Check not already voted
        let voter_key: field = BHP256::hash_to_field(poll_id as field + voter as field);
        assert(!Mapping::contains(has_voted, voter_key));

        // Record vote
        Mapping::set(has_voted, voter_key, true);

        let option_key: field = BHP256::hash_to_field(poll_id as field + option_index as field);
        let current_count: u64 = Mapping::get_or_use(vote_counts, option_key, 0u64);
        Mapping::set(vote_counts, option_key, current_count + 1u64);

        Mapping::set(total_voters, poll_id, current_voters + 1u64);

        // Handle identified privacy mode
        if settings.privacy_mode == PRIVACY_IDENTIFIED {
            Mapping::set(public_votes, voter_key, option_index);
        }
    }

    // ============================================
    // POLL LIFECYCLE MANAGEMENT
    // ============================================

    async transition start_claims(
        ticket: PollTicket,
        public distribution_mode: u8
    ) -> (PollTicket, Future) {
        assert(ticket.is_active);
        assert(distribution_mode <= DIST_PUSH);

        let new_ticket: PollTicket = PollTicket {
            owner: ticket.owner,
            poll_id: ticket.poll_id,
            is_active: ticket.is_active,
        };

        return (new_ticket, finalize_start_claims(ticket.poll_id, distribution_mode, self.caller));
    }

    async function finalize_start_claims(
        poll_id: u64,
        distribution_mode: u8,
        caller: address
    ) {
        let poll_info: PollInfo = Mapping::get(polls, poll_id);

        assert_eq(caller, poll_info.creator);
        assert_eq(poll_info.status, STATUS_ACTIVE);

        let updated_poll: PollInfo = PollInfo {
            id: poll_info.id,
            creator: poll_info.creator,
            title: poll_info.title,
            description: poll_info.description,
            option_count: poll_info.option_count,
            reward_per_vote: poll_info.reward_per_vote,
            reward_pool: poll_info.reward_pool,
            max_voters: poll_info.max_voters,
            distribution_mode: distribution_mode,
            status: STATUS_CLAIMING,
            token_id: poll_info.token_id,
            end_block: poll_info.end_block,
            closed_at: block.height,
        };

        Mapping::set(polls, poll_id, updated_poll);
    }

    async transition close_poll(ticket: PollTicket) -> (PollTicket, Future) {
        assert(ticket.is_active);

        let new_ticket: PollTicket = PollTicket {
            owner: ticket.owner,
            poll_id: ticket.poll_id,
            is_active: false,
        };

        return (new_ticket, finalize_close_poll(ticket.poll_id, self.caller));
    }

    async function finalize_close_poll(poll_id: u64, caller: address) {
        let poll_info: PollInfo = Mapping::get(polls, poll_id);

        assert_eq(caller, poll_info.creator);
        assert_eq(poll_info.status, STATUS_CLAIMING);

        let updated_poll: PollInfo = PollInfo {
            id: poll_info.id,
            creator: poll_info.creator,
            title: poll_info.title,
            description: poll_info.description,
            option_count: poll_info.option_count,
            reward_per_vote: poll_info.reward_per_vote,
            reward_pool: poll_info.reward_pool,
            max_voters: poll_info.max_voters,
            distribution_mode: poll_info.distribution_mode,
            status: STATUS_CLOSED,
            token_id: poll_info.token_id,
            end_block: poll_info.end_block,
            closed_at: poll_info.closed_at,
        };

        Mapping::set(polls, poll_id, updated_poll);
    }

    async transition finalize_poll(public poll_id: u64) -> Future {
        return finalize_finalize_poll(poll_id, self.caller);
    }

    async function finalize_finalize_poll(poll_id: u64, caller: address) {
        let poll_info: PollInfo = Mapping::get(polls, poll_id);
        let config: PlatformConfig = Mapping::get(platform_config, 0u8);

        assert(caller == poll_info.creator || caller == config.admin);
        assert_eq(poll_info.status, STATUS_CLOSED);
        assert(block.height >= poll_info.closed_at + config.claim_period_blocks);

        let updated_poll: PollInfo = PollInfo {
            id: poll_info.id,
            creator: poll_info.creator,
            title: poll_info.title,
            description: poll_info.description,
            option_count: poll_info.option_count,
            reward_per_vote: poll_info.reward_per_vote,
            reward_pool: 0u64,
            max_voters: poll_info.max_voters,
            distribution_mode: poll_info.distribution_mode,
            status: STATUS_FINALIZED,
            token_id: poll_info.token_id,
            end_block: poll_info.end_block,
            closed_at: poll_info.closed_at,
        };

        Mapping::set(polls, poll_id, updated_poll);
    }

    // ============================================
    // REWARD CLAIMING
    // ============================================

    async transition claim_reward(
        receipt: VoteReceipt
    ) -> (RewardTicket, Future) {
        let reward_ticket: RewardTicket = RewardTicket {
            owner: receipt.owner,
            poll_id: receipt.poll_id,
            amount: 0u64,
            token_id: 0field,
        };

        return (reward_ticket, finalize_claim_reward(receipt.poll_id, self.caller));
    }

    async function finalize_claim_reward(poll_id: u64, claimer: address) {
        let poll_info: PollInfo = Mapping::get(polls, poll_id);

        assert_eq(poll_info.status, STATUS_CLAIMING);
        assert_eq(poll_info.distribution_mode, DIST_PULL);

        let voter_key: field = BHP256::hash_to_field(poll_id as field + claimer as field);
        assert(Mapping::get(has_voted, voter_key));
        assert(!Mapping::contains(has_claimed, voter_key));

        Mapping::set(has_claimed, voter_key, true);
    }

    // ============================================
    // INLINE HELPERS
    // ============================================

    inline get_default_fee_bps() -> u64 {
        return DEFAULT_FEE_BPS;
    }

    inline get_max_options() -> u8 {
        return MAX_OPTIONS;
    }
}
