const crypto = require('crypto');

// ── Single Block ──────────────────────────────────────────
class Block {
  constructor(index, timestamp, voteData, previousHash = '') {
    this.index        = index;
    this.timestamp    = timestamp;
    this.voteData     = voteData;   // { userId, electionId, candidateId }
    this.previousHash = previousHash;
    this.nonce        = 0;
    this.hash         = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.index +
        this.timestamp +
        this.previousHash +
        JSON.stringify(this.voteData) +
        this.nonce
      )
      .digest('hex');
  }

  // Proof of Work — mine block with difficulty
  mineBlock(difficulty) {
    const target = '0'.repeat(difficulty);
    while (!this.hash.startsWith(target)) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

// ── Blockchain ────────────────────────────────────────────
class VoteChain {
  constructor() {
    this.difficulty = 2;          // PoW difficulty (2 leading zeros)
    this.chain      = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block(0, new Date().toISOString(), { type: 'GENESIS' }, '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  // Add a new vote block
  addVote(userId, electionId, candidateId) {
    const block = new Block(
      this.chain.length,
      new Date().toISOString(),
      { userId, electionId, candidateId, type: 'VOTE' },
      this.getLatestBlock().hash
    );
    block.mineBlock(this.difficulty);
    this.chain.push(block);
    return block;
  }

  // Verify entire chain integrity
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current  = this.chain[i];
      const previous = this.chain[i - 1];

      // Hash mismatch — tampered
      if (current.hash !== current.calculateHash()) return false;

      // Previous hash link broken
      if (current.previousHash !== previous.hash) return false;
    }
    return true;
  }

  // Get all votes for a specific election
  getVotesForElection(electionId) {
    return this.chain
      .filter((b) => b.voteData?.electionId === electionId)
      .map((b) => b.voteData);
  }

  // Check if user already voted in election (from chain)
  hasUserVoted(userId, electionId) {
    return this.chain.some(
      (b) =>
        b.voteData?.userId    === userId &&
        b.voteData?.electionId === electionId
    );
  }

  // Full chain summary
  getChainSummary() {
    return this.chain.map((b) => ({
      index:        b.index,
      hash:         b.hash,
      previousHash: b.previousHash,
      timestamp:    b.timestamp,
      nonce:        b.nonce,
      voteData:     b.voteData,
    }));
  }
}

// Singleton — ek hi chain poore server ke liye
const voteChain = new VoteChain();
module.exports = voteChain;
