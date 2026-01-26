/**
 * InviteManager - Manages invites to private (invite-only) polls
 *
 * Features:
 * - Form to send invites (address, expiration, can_vote)
 * - List of issued invites (from local tracking)
 * - Invite count display from on-chain mapping
 */

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Mail,
  Send,
  Users,
  Clock,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useContract } from "@/hooks/useContract";
import { useBlockHeight } from "@/hooks/useAleoPolls";
import { useNetwork } from "@/contexts/NetworkContext";
import { truncateAddress } from "@/lib/contract";
import { toast } from "sonner";
import { showTransactionSuccessToast, showTransactionErrorToast } from "@/lib/transaction-feedback";
import type { PollTicket } from "@/types/poll";

// Local storage key for tracking sent invites
const getInviteStorageKey = (pollId: number) => `poll-invites-${pollId}`;

// Local invite record (stored in localStorage)
interface LocalInvite {
  address: string;
  canVote: boolean;
  expiresBlock: number;
  txHash: string;
  sentAt: number;
}

// Expiration presets in blocks (assuming ~1 block per second)
const EXPIRATION_PRESETS = [
  { label: "1,000 blocks (~16 min)", value: 1000 },
  { label: "5,000 blocks (~1.4 hours)", value: 5000 },
  { label: "10,000 blocks (~2.8 hours)", value: 10000 },
  { label: "50,000 blocks (~14 hours)", value: 50000 },
  { label: "100,000 blocks (~1 day)", value: 100000 },
  { label: "Custom", value: -1 },
];

interface InviteManagerProps {
  pollId: number;
  isPrivate: boolean;
}

export function InviteManager({ pollId, isPrivate }: InviteManagerProps) {
  const { inviteToPoll, getPollTickets, loading } = useContract();
  const { data: currentBlock } = useBlockHeight();
  const { config } = useNetwork();

  // Form state
  const [inviteeAddress, setInviteeAddress] = useState("");
  const [canVote, setCanVote] = useState(true);
  const [expirationPreset, setExpirationPreset] = useState("10000");
  const [customExpiration, setCustomExpiration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Poll ticket state (required for inviting)
  const [pollTickets, setPollTickets] = useState<PollTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  // Local invite tracking
  const [sentInvites, setSentInvites] = useState<LocalInvite[]>([]);

  // Collapsible state
  const [isInviteListOpen, setIsInviteListOpen] = useState(false);

  // Load poll tickets on mount
  useEffect(() => {
    async function loadTickets() {
      setLoadingTickets(true);
      try {
        const tickets = await getPollTickets();
        setPollTickets(tickets);
      } catch (error) {
        console.error("Failed to load poll tickets:", error);
      } finally {
        setLoadingTickets(false);
      }
    }
    loadTickets();
  }, [getPollTickets]);

  // Load sent invites from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(getInviteStorageKey(pollId));
    if (stored) {
      try {
        setSentInvites(JSON.parse(stored));
      } catch {
        setSentInvites([]);
      }
    }
  }, [pollId]);

  // Save invites to localStorage
  const saveInvites = useCallback(
    (invites: LocalInvite[]) => {
      setSentInvites(invites);
      localStorage.setItem(getInviteStorageKey(pollId), JSON.stringify(invites));
    },
    [pollId]
  );

  // Get the poll ticket for this poll
  const pollTicket = pollTickets.find((t) => t.poll_id === pollId);

  // Calculate expiration block
  const getExpirationBlock = (): number => {
    const preset = parseInt(expirationPreset);
    if (preset === -1) {
      // Custom value
      return (currentBlock || 0) + (parseInt(customExpiration) || 10000);
    }
    return (currentBlock || 0) + preset;
  };

  // Validate Aleo address format
  const isValidAddress = (addr: string): boolean => {
    return /^aleo1[a-z0-9]{58}$/.test(addr);
  };

  // Handle invite submission
  const handleSendInvite = async () => {
    if (!inviteeAddress.trim()) {
      toast.error("Please enter an address");
      return;
    }

    if (!isValidAddress(inviteeAddress.trim())) {
      toast.error("Invalid Aleo address format");
      return;
    }

    if (!pollTicket) {
      toast.error("No poll ticket found. You may not be the creator of this poll.");
      return;
    }

    setIsSubmitting(true);

    try {
      const expiresBlock = getExpirationBlock();

      // Format the PollTicket record for the transaction
      // Note: The actual record format depends on how the wallet returns records
      const pollTicketData = JSON.stringify({
        owner: pollTicket.owner,
        poll_id: `${pollTicket.poll_id}u64`,
      });

      const result = await inviteToPoll(
        pollTicketData,
        inviteeAddress.trim(),
        canVote,
        expiresBlock
      );

      // Save invite locally
      const newInvite: LocalInvite = {
        address: inviteeAddress.trim(),
        canVote,
        expiresBlock,
        txHash: result.hash,
        sentAt: Date.now(),
      };
      saveInvites([...sentInvites, newInvite]);

      showTransactionSuccessToast(
        result.hash,
        "Invite Sent!",
        `Invited ${truncateAddress(inviteeAddress)} to the poll.`,
        config.explorerUrl
      );

      // Reset form
      setInviteeAddress("");
      setCanVote(true);
      setIsInviteListOpen(true); // Open list to show new invite
    } catch (error) {
      console.error("Failed to send invite:", error);
      showTransactionErrorToast(
        "Failed to send invite",
        error instanceof Error ? error : "Transaction failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy address to clipboard
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied!");
  };

  // Get invite status
  const getInviteStatus = (invite: LocalInvite): "pending" | "active" | "expired" => {
    if (!currentBlock) return "pending";
    if (invite.expiresBlock <= currentBlock) return "expired";
    return "active";
  };

  // Don't render if not a private poll
  if (!isPrivate) {
    return null;
  }

  // Loading state
  if (loadingTickets) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading invite manager...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No poll ticket (user is not the creator)
  if (!pollTicket) {
    return (
      <Card className="border-yellow-500/50 bg-yellow-500/10">
        <CardContent className="flex items-center gap-3 py-6">
          <AlertCircle className="w-5 h-5 text-yellow-500" />
          <div>
            <p className="text-yellow-600 dark:text-yellow-400 font-medium">
              Cannot manage invites
            </p>
            <p className="text-sm text-muted-foreground">
              No poll ticket found. Only the poll creator can issue invites.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Invite Form */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" /> Manage Invites
          </CardTitle>
          <CardDescription>
            Invite participants to this private poll
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Info Banner */}
          <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground">
              Invites are private records sent to the participant's wallet. They need a valid
              invite record to vote on this poll.
            </p>
          </div>

          {/* Address Input */}
          <div className="space-y-2">
            <Label htmlFor="invitee-address">Participant Address *</Label>
            <Input
              id="invitee-address"
              placeholder="aleo1..."
              value={inviteeAddress}
              onChange={(e) => setInviteeAddress(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          {/* Expiration Selection */}
          <div className="space-y-2">
            <Label>Invite Expiration</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select value={expirationPreset} onValueChange={setExpirationPreset}>
                <SelectTrigger>
                  <SelectValue placeholder="Select expiration" />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRATION_PRESETS.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value.toString()}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {expirationPreset === "-1" && (
                <Input
                  type="number"
                  placeholder="Blocks from now"
                  value={customExpiration}
                  onChange={(e) => setCustomExpiration(e.target.value)}
                  min="1"
                />
              )}
            </div>
            {currentBlock && (
              <p className="text-xs text-muted-foreground">
                Current block: {currentBlock.toLocaleString()} | Expires at block:{" "}
                {getExpirationBlock().toLocaleString()}
              </p>
            )}
          </div>

          {/* Can Vote Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="can-vote"
              checked={canVote}
              onCheckedChange={(checked) => setCanVote(checked === true)}
            />
            <Label htmlFor="can-vote" className="cursor-pointer">
              Can vote on poll (uncheck for view-only access)
            </Label>
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendInvite}
            disabled={isSubmitting || loading || !inviteeAddress.trim()}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending Invite...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" /> Send Invite
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Sent Invites List */}
      {sentInvites.length > 0 && (
        <Collapsible open={isInviteListOpen} onOpenChange={setIsInviteListOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" /> Sent Invites ({sentInvites.length})
                  </span>
                  {isInviteListOpen ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Address</TableHead>
                      <TableHead>Can Vote</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sentInvites.map((invite, index) => {
                      const status = getInviteStatus(invite);
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">
                            {truncateAddress(invite.address)}
                          </TableCell>
                          <TableCell>
                            {invite.canVote ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <span className="text-muted-foreground">View only</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1 text-sm">
                              <Clock className="w-3 h-3" />
                              Block {invite.expiresBlock.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                status === "active"
                                  ? "text-green-500 border-green-500/50"
                                  : status === "expired"
                                  ? "text-red-500 border-red-500/50"
                                  : "text-yellow-500 border-yellow-500/50"
                              }
                            >
                              {status === "active"
                                ? "Active"
                                : status === "expired"
                                ? "Expired"
                                : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyAddress(invite.address)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  window.open(
                                    `${config.explorerUrl}/transaction/${invite.txHash}`,
                                    "_blank"
                                  )
                                }
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  );
}

export default InviteManager;
