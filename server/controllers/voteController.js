const Candidate = require('../models/Candidate');
const Election  = require('../models/Election');
const User      = require('../models/User');
const Vote      = require('../models/Vote');
const voteChain = require('../blockchain/VoteChain');

// POST /api/votes — cast vote
exports.castVote = async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;
    if (!electionId || !candidateId)
      return res.status(400).json({ message: 'electionId and candidateId required' });

    const election = await Election.findById(electionId);
    if (!election)        return res.status(404).json({ message: 'Election not found' });
    if (!election.isActive) return res.status(400).json({ message: 'Election is not active' });

    // DB level duplicate check
    const user = await User.findById(req.user._id);
    if (user.votedElections.includes(electionId))
      return res.status(400).json({ message: 'You have already voted in this election' });

    // Blockchain level duplicate check
    if (voteChain.hasUserVoted(String(req.user._id), String(electionId)))
      return res.status(400).json({ message: 'Blockchain: Vote already recorded' });

    const candidate = await Candidate.findOne({ _id: candidateId, election: electionId });
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    // Save to Vote collection
    await Vote.create({ userId: req.user._id, candidateId, electionId });

    // Update candidate vote count
    candidate.votes += 1;
    await candidate.save();

    // Update user votedElections
    user.votedElections.push(electionId);
    await user.save();

    // Record on blockchain
    const block = voteChain.addVote(String(req.user._id), String(electionId), String(candidateId));

    // Emit real-time update via Socket.io
    const io = req.app.get('io');
    if (io) {
      const updatedElection = await Election.findById(electionId).populate('candidates');
      io.to(electionId).emit('voteUpdate', { electionId, candidates: updatedElection.candidates });
    }

    res.json({
      message: 'Vote cast successfully',
      candidate,
      blockchain: { blockIndex: block.index, blockHash: block.hash, chainValid: voteChain.isChainValid() },
    });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'You have already voted in this election' });
    res.status(500).json({ message: err.message });
  }
};

// GET /api/votes/results/:electionId
exports.getResults = async (req, res) => {
  try {
    const election = await Election.findById(req.params.electionId).populate('candidates');
    if (!election) return res.status(404).json({ message: 'Election not found' });

    const totalVotes = election.candidates.reduce((sum, c) => sum + c.votes, 0);
    const results = election.candidates
      .map((c) => ({
        _id: c._id, name: c.name, description: c.description,
        votes: c.votes,
        percentage: totalVotes > 0 ? ((c.votes / totalVotes) * 100).toFixed(1) : '0.0',
      }))
      .sort((a, b) => b.votes - a.votes);

    const winner = totalVotes > 0 ? results[0] : null;

    res.json({ election: { _id: election._id, title: election.title, isActive: election.isActive }, totalVotes, results, winner });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/votes/blockchain
exports.getBlockchain = async (req, res) => {
  res.json({ isValid: voteChain.isChainValid(), totalBlocks: voteChain.chain.length, chain: voteChain.getChainSummary() });
};
