/**
 * Centralized transaction feedback utilities
 * Provides consistent toast notifications for all transaction types
 */

import { toast } from "sonner";

/**
 * Known Aleo/Leo error codes and their user-friendly messages
 */
const ALEO_ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  // Poll contract errors (will be defined when contracts are deployed)
  not_authorized: {
    title: "Not Authorized",
    description: "You don't have permission to perform this action.",
  },
  poll_not_active: {
    title: "Poll Not Active",
    description: "This poll is no longer accepting votes.",
  },
  already_voted: {
    title: "Already Voted",
    description: "You have already voted on this poll.",
  },
  invalid_option: {
    title: "Invalid Option",
    description: "The selected option is not valid for this poll.",
  },
  poll_ended: {
    title: "Poll Ended",
    description: "This poll has ended and is no longer accepting votes.",
  },
  insufficient_funds: {
    title: "Insufficient Funds",
    description: "You don't have enough credits to complete this transaction.",
  },
  max_voters_reached: {
    title: "Maximum Voters Reached",
    description: "This poll has reached its maximum number of voters.",
  },
  already_claimed: {
    title: "Already Claimed",
    description: "You have already claimed your reward from this poll.",
  },
};

/**
 * Parse an Aleo transaction error and return a user-friendly message
 */
export function parseTransactionError(error: Error | string): { title: string; description: string } {
  const errorString = typeof error === "string" ? error : error.message;

  // Check for known Aleo/Leo error codes
  for (const [errorCode, message] of Object.entries(ALEO_ERROR_MESSAGES)) {
    if (errorString.toLowerCase().includes(errorCode)) {
      return message;
    }
  }

  // Check for common error patterns
  if (errorString.includes("INSUFFICIENT_BALANCE") || errorString.includes("insufficient balance")) {
    return {
      title: "Insufficient Balance",
      description: "You don't have enough tokens to complete this transaction.",
    };
  }

  if (errorString.includes("rejected") || errorString.includes("User rejected")) {
    return {
      title: "Transaction Rejected",
      description: "You cancelled the transaction.",
    };
  }

  if (errorString.includes("timeout") || errorString.includes("Timeout")) {
    return {
      title: "Transaction Timeout",
      description: "The transaction took too long. Please try again.",
    };
  }

  // Default: return a generic error with the original message
  return {
    title: "Transaction Failed",
    description: errorString.length > 200 ? `${errorString.slice(0, 200)}...` : errorString,
  };
}

/**
 * Show a success toast for completed transactions
 * Includes a "View TX" action button linking to the Aleo block explorer
 */
export function showTransactionSuccessToast(
  hash: string,
  message: string,
  description: string,
  explorerUrl: string,
  sponsored?: boolean
): void {
  // Note: Gas sponsorship is Coming Soon! - sponsored flag preserved for future integration
  const finalDescription = sponsored
    ? `${description} (Gas Sponsored)`
    : description;

  toast.success(message, {
    description: finalDescription,
    action: {
      label: "View TX",
      onClick: () => window.open(`${explorerUrl}/transaction/${hash}`, "_blank"),
    },
  });
}

/**
 * Show an error toast for failed transactions
 * Parses known Aleo/Leo errors and shows user-friendly messages
 */
export function showTransactionErrorToast(
  message: string,
  error: Error | string
): void {
  const parsed = parseTransactionError(error);

  toast.error(parsed.title, {
    description: parsed.description,
  });
}
