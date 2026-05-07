const { validationResult } = require('express-validator');
const Election  = require('../models/Election');
const Candidate = require('../models/Candidate');
const { logAudit } = require('../utils/audit');

const autoExpire = async () => {
  await Election.updateMany({ endDate: { $lt: new Date() }, isActive: true }, { $set: { isActive: false } });
};

exports.getElections = async (req, res) => {
  try {
    await autoExpire();
    const elections = await Election.find().populate('candidates');
    res.json(elections);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getElection = async (req, res) => {
  try {
    await autoExpire();
    const election = await Election.findById(req.params.id).populate('candidates');
    if (!election) return res.status(404).json({ message: 'Election not found' });
    res.json(election);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createElection = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  try {
    const { title, description, startDate, endDate } = req.body;
    const election = await Election.create({ title, description, startDate: startDate || Date.now(), endDate: endDate || null, createdBy: req.user._id });

    await logAudit('ELECTION_CREATED', {
      actorId:  req.user._id,
      actor:    'admin',
      target:   title,
      targetId: election._id,
      ip:       req.ip || '',
    });

    res.status(201).json(election);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addCandidate = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    const {
      name, description, symbol,
      rollNumber, course, year,
      email, mobile, appliedPost,
      attendance, disciplineRecord, approvalStatus,
      plans, goals, slogan,
      photo, collegeId, signature,
    } = req.body;

    if (!name) return res.status(400).json({ message: 'Candidate name required' });

    const candidate = await Candidate.create({
      name, description, symbol,
      rollNumber, course, year,
      email, mobile, appliedPost,
      attendance, disciplineRecord: disciplineRecord || 'Good',
      approvalStatus: approvalStatus || 'Pending',
      plans, goals, slogan,
      photo, collegeId, signature,
      election: election._id,
    });

    election.candidates.push(candidate._id);
    await election.save();
    res.status(201).json(candidate);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.toggleElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    election.isActive = !election.isActive;
    await election.save();
    res.json(election);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    await Candidate.deleteMany({ election: election._id });
    await election.deleteOne();
    res.json({ message: 'Election deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
