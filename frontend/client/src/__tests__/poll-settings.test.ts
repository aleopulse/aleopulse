import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PollSettings, PollInvite, PollTicket } from '@/types/poll';
import { POLL_VISIBILITY } from '@/types/poll';

/**
 * Unit tests for poll settings parsing and filtering logic
 * These test the pure functions that power the private poll features
 */

// ============================================================================
// Poll Settings Parsing Tests
// ============================================================================

describe('PollSettings Parsing', () => {
  /**
   * Parses a poll_settings mapping value from Leo format to PollSettings object
   * This mirrors the parsing logic in useContract.ts getPollSettings
   */
  function parsePollSettings(value: string): PollSettings | null {
    if (!value) return null;

    const match = value.match(/\{([^}]+)\}/);
    if (!match) return null;

    const content = match[1];
    const fields: Record<string, string> = {};

    const pairs = content.split(",").map((p) => p.trim());
    for (const pair of pairs) {
      const colonIndex = pair.indexOf(":");
      if (colonIndex > -1) {
        const key = pair.slice(0, colonIndex).trim();
        const val = pair.slice(colonIndex + 1).trim();
        if (key && val) {
          fields[key] = val;
        }
      }
    }

    return {
      privacy_mode: parseInt(fields.privacy_mode?.replace("u8", "") || "0", 10),
      show_results_live: fields.show_results_live === "true",
      require_receipt: fields.require_receipt === "true",
      visibility: parseInt(fields.visibility?.replace("u8", "") || "0", 10),
    };
  }

  it('should parse public poll settings correctly', () => {
    const rawValue = '{ privacy_mode: 0u8, show_results_live: true, require_receipt: false, visibility: 0u8 }';
    const result = parsePollSettings(rawValue);

    expect(result).toEqual({
      privacy_mode: 0,
      show_results_live: true,
      require_receipt: false,
      visibility: POLL_VISIBILITY.PUBLIC,
    });
  });

  it('should parse private poll settings correctly', () => {
    const rawValue = '{ privacy_mode: 1u8, show_results_live: false, require_receipt: true, visibility: 1u8 }';
    const result = parsePollSettings(rawValue);

    expect(result).toEqual({
      privacy_mode: 1,
      show_results_live: false,
      require_receipt: true,
      visibility: POLL_VISIBILITY.PRIVATE,
    });
  });

  it('should handle empty value', () => {
    expect(parsePollSettings('')).toBeNull();
    expect(parsePollSettings(null as any)).toBeNull();
  });

  it('should handle malformed value', () => {
    expect(parsePollSettings('invalid')).toBeNull();
    expect(parsePollSettings('{ incomplete')).toBeNull();
  });

  it('should handle missing fields with defaults', () => {
    const rawValue = '{ privacy_mode: 2u8 }';
    const result = parsePollSettings(rawValue);

    expect(result).toEqual({
      privacy_mode: 2,
      show_results_live: false,
      require_receipt: false,
      visibility: 0,
    });
  });
});

// ============================================================================
// Poll Invite Record Parsing Tests
// ============================================================================

describe('PollInvite Record Parsing', () => {
  /**
   * Parses a PollInvite record from wallet format
   * This mirrors the parsing logic in useContract.ts getUserPollInvites
   */
  function parsePollInviteRecord(record: any, defaultOwner: string): PollInvite | null {
    try {
      const data = record.data || record;

      // Check if this looks like a PollInvite (has expires_block)
      if (data.expires_block === undefined) return null;

      return {
        owner: data.owner || defaultOwner,
        poll_id: parseInt(String(data.poll_id).replace("u64", ""), 10),
        can_vote: data.can_vote === true || data.can_vote === "true",
        expires_block: parseInt(String(data.expires_block).replace("u32", ""), 10),
      };
    } catch {
      return null;
    }
  }

  it('should parse valid PollInvite record', () => {
    const record = {
      recordName: 'PollInvite',
      data: {
        owner: 'aleo1test123',
        poll_id: '42u64',
        can_vote: true,
        expires_block: '100000u32',
      },
    };

    const result = parsePollInviteRecord(record, 'aleo1default');

    expect(result).toEqual({
      owner: 'aleo1test123',
      poll_id: 42,
      can_vote: true,
      expires_block: 100000,
    });
  });

  it('should handle string boolean values', () => {
    const record = {
      data: {
        poll_id: '10u64',
        can_vote: 'true',
        expires_block: '50000u32',
      },
    };

    const result = parsePollInviteRecord(record, 'aleo1owner');

    expect(result?.can_vote).toBe(true);
  });

  it('should handle false can_vote', () => {
    const record = {
      data: {
        poll_id: '10u64',
        can_vote: false,
        expires_block: '50000u32',
      },
    };

    const result = parsePollInviteRecord(record, 'aleo1owner');

    expect(result?.can_vote).toBe(false);
  });

  it('should use default owner when not provided', () => {
    const record = {
      data: {
        poll_id: '10u64',
        can_vote: true,
        expires_block: '50000u32',
      },
    };

    const result = parsePollInviteRecord(record, 'aleo1default');

    expect(result?.owner).toBe('aleo1default');
  });

  it('should return null for non-PollInvite records', () => {
    const record = {
      recordName: 'VoteReceipt',
      data: {
        poll_id: '10u64',
        option_index: '0u8',
      },
    };

    expect(parsePollInviteRecord(record, 'aleo1test')).toBeNull();
  });
});

// ============================================================================
// Poll Ticket Record Parsing Tests
// ============================================================================

describe('PollTicket Record Parsing', () => {
  /**
   * Parses a PollTicket record from wallet format
   * This mirrors the parsing logic in useContract.ts getPollTickets
   */
  function parsePollTicketRecord(record: any, defaultOwner: string): PollTicket | null {
    try {
      const data = record.data || record;

      // PollTicket has poll_id but NO can_vote or expires_block
      if (data.can_vote !== undefined || data.expires_block !== undefined) return null;
      if (data.poll_id === undefined) return null;

      return {
        owner: data.owner || defaultOwner,
        poll_id: parseInt(String(data.poll_id).replace("u64", ""), 10),
      };
    } catch {
      return null;
    }
  }

  it('should parse valid PollTicket record', () => {
    const record = {
      recordName: 'PollTicket',
      data: {
        owner: 'aleo1creator',
        poll_id: '5u64',
      },
    };

    const result = parsePollTicketRecord(record, 'aleo1default');

    expect(result).toEqual({
      owner: 'aleo1creator',
      poll_id: 5,
    });
  });

  it('should return null for PollInvite records', () => {
    const record = {
      data: {
        poll_id: '10u64',
        can_vote: true,
        expires_block: '50000u32',
      },
    };

    expect(parsePollTicketRecord(record, 'aleo1test')).toBeNull();
  });

  it('should return null for records without poll_id', () => {
    const record = {
      data: {
        owner: 'aleo1test',
      },
    };

    expect(parsePollTicketRecord(record, 'aleo1test')).toBeNull();
  });
});

// ============================================================================
// Dashboard Filtering Logic Tests
// ============================================================================

describe('Dashboard Poll Filtering', () => {
  interface MockPoll {
    id: number;
    creator: string;
    isActive: boolean;
  }

  /**
   * Check if user has a valid (non-expired) invite for a poll
   */
  function hasValidInvite(
    pollId: number,
    userInvites: PollInvite[],
    currentBlock: number | null
  ): boolean {
    const invite = userInvites.find((inv) => inv.poll_id === pollId);
    if (!invite) return false;
    if (currentBlock && invite.expires_block <= currentBlock) return false;
    return true;
  }

  /**
   * Check if a poll is private based on settings
   */
  function isPollPrivate(
    pollId: number,
    pollSettingsMap: Map<number, PollSettings>
  ): boolean {
    const settings = pollSettingsMap.get(pollId);
    return settings?.visibility === POLL_VISIBILITY.PRIVATE;
  }

  /**
   * Check if user can access a poll
   */
  function canAccessPoll(
    poll: MockPoll,
    userAddress: string | undefined,
    pollSettingsMap: Map<number, PollSettings>,
    userInvites: PollInvite[],
    currentBlock: number | null
  ): boolean {
    const isPrivate = isPollPrivate(poll.id, pollSettingsMap);
    if (!isPrivate) return true;

    // Private poll: check if creator or has valid invite
    const isCreator = userAddress && poll.creator.toLowerCase() === userAddress.toLowerCase();
    if (isCreator) return true;

    return hasValidInvite(poll.id, userInvites, currentBlock);
  }

  describe('hasValidInvite', () => {
    const invites: PollInvite[] = [
      { owner: 'aleo1user', poll_id: 1, can_vote: true, expires_block: 100000 },
      { owner: 'aleo1user', poll_id: 2, can_vote: true, expires_block: 50000 },
    ];

    it('should return true for valid non-expired invite', () => {
      expect(hasValidInvite(1, invites, 90000)).toBe(true);
    });

    it('should return false for expired invite', () => {
      expect(hasValidInvite(2, invites, 60000)).toBe(false);
    });

    it('should return false for non-existent invite', () => {
      expect(hasValidInvite(999, invites, 90000)).toBe(false);
    });

    it('should return true when currentBlock is null', () => {
      expect(hasValidInvite(1, invites, null)).toBe(true);
    });
  });

  describe('isPollPrivate', () => {
    const settingsMap = new Map<number, PollSettings>([
      [1, { privacy_mode: 0, show_results_live: true, require_receipt: false, visibility: POLL_VISIBILITY.PUBLIC }],
      [2, { privacy_mode: 0, show_results_live: true, require_receipt: false, visibility: POLL_VISIBILITY.PRIVATE }],
    ]);

    it('should return false for public poll', () => {
      expect(isPollPrivate(1, settingsMap)).toBe(false);
    });

    it('should return true for private poll', () => {
      expect(isPollPrivate(2, settingsMap)).toBe(true);
    });

    it('should return false for unknown poll', () => {
      expect(isPollPrivate(999, settingsMap)).toBe(false);
    });
  });

  describe('canAccessPoll', () => {
    const settingsMap = new Map<number, PollSettings>([
      [1, { privacy_mode: 0, show_results_live: true, require_receipt: false, visibility: POLL_VISIBILITY.PUBLIC }],
      [2, { privacy_mode: 0, show_results_live: true, require_receipt: false, visibility: POLL_VISIBILITY.PRIVATE }],
      [3, { privacy_mode: 0, show_results_live: true, require_receipt: false, visibility: POLL_VISIBILITY.PRIVATE }],
    ]);

    const polls: MockPoll[] = [
      { id: 1, creator: 'aleo1creator', isActive: true },
      { id: 2, creator: 'aleo1creator', isActive: true },
      { id: 3, creator: 'aleo1other', isActive: true },
    ];

    const invites: PollInvite[] = [
      { owner: 'aleo1user', poll_id: 3, can_vote: true, expires_block: 100000 },
    ];

    it('should allow access to public poll', () => {
      expect(canAccessPoll(polls[0], 'aleo1user', settingsMap, [], 90000)).toBe(true);
    });

    it('should allow creator access to their private poll', () => {
      expect(canAccessPoll(polls[1], 'aleo1creator', settingsMap, [], 90000)).toBe(true);
    });

    it('should deny access to private poll without invite', () => {
      expect(canAccessPoll(polls[1], 'aleo1user', settingsMap, [], 90000)).toBe(false);
    });

    it('should allow access to private poll with valid invite', () => {
      expect(canAccessPoll(polls[2], 'aleo1user', settingsMap, invites, 90000)).toBe(true);
    });

    it('should deny access when invite is expired', () => {
      expect(canAccessPoll(polls[2], 'aleo1user', settingsMap, invites, 150000)).toBe(false);
    });

    it('should allow access when not connected (public polls only)', () => {
      expect(canAccessPoll(polls[0], undefined, settingsMap, [], null)).toBe(true);
      expect(canAccessPoll(polls[1], undefined, settingsMap, [], null)).toBe(false);
    });
  });
});

// ============================================================================
// Address Validation Tests
// ============================================================================

describe('Aleo Address Validation', () => {
  /**
   * Validates Aleo address format
   * Used in InviteManager component
   */
  function isValidAleoAddress(address: string): boolean {
    return /^aleo1[a-z0-9]{58}$/.test(address);
  }

  it('should accept valid Aleo address', () => {
    const validAddress = 'aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc';
    expect(isValidAleoAddress(validAddress)).toBe(true);
  });

  it('should reject address without aleo1 prefix', () => {
    expect(isValidAleoAddress('test1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc')).toBe(false);
  });

  it('should reject address with wrong length', () => {
    expect(isValidAleoAddress('aleo1short')).toBe(false);
    expect(isValidAleoAddress('aleo1' + 'q'.repeat(100))).toBe(false);
  });

  it('should reject address with uppercase letters', () => {
    expect(isValidAleoAddress('aleo1QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ3ljyzc')).toBe(false);
  });

  it('should reject empty string', () => {
    expect(isValidAleoAddress('')).toBe(false);
  });
});
