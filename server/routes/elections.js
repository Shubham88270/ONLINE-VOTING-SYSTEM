const express  = require('express');
const { body } = require('express-validator');
const ctrl     = require('../controllers/electionController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const electionRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Election title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),

  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description max 500 characters'),

  body('endDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('Invalid date format')
    .custom((val) => {
      if (val && new Date(val) <= new Date())
        throw new Error('End date must be in the future');
      return true;
    }),
];

const candidateRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Candidate name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),

  body('description')
    .optional()
    .isLength({ max: 300 }).withMessage('Description max 300 characters'),
];

router.get('/',    ctrl.getElections);
router.get('/:id', ctrl.getElection);

router.post('/',
  protect, adminOnly,
  electionRules, validate,
  ctrl.createElection);

router.post('/:id/candidates',
  protect, adminOnly,
  candidateRules, validate,
  ctrl.addCandidate);

router.patch('/:id/toggle', protect, adminOnly, ctrl.toggleElection);
router.delete('/:id',       protect, adminOnly, ctrl.deleteElection);

module.exports = router;
