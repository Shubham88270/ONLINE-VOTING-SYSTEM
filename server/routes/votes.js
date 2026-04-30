const express  = require('express');
const { body } = require('express-validator');
const ctrl     = require('../controllers/voteController');
const { protect } = require('../middleware/auth');
const validate    = require('../middleware/validate');
const rateLimiter = require('../middleware/rateLimiter');

const router = express.Router();

const voteRules = [
  body('electionId')
    .notEmpty().withMessage('Election ID is required')
    .isMongoId().withMessage('Invalid election ID'),

  body('candidateId')
    .notEmpty().withMessage('Candidate ID is required')
    .isMongoId().withMessage('Invalid candidate ID'),
];

// Rate limit: 10 votes per hour (prevent spam)
router.post('/',
  protect,
  rateLimiter(10, 60 * 60 * 1000),
  voteRules, validate,
  ctrl.castVote);

router.get('/results/:electionId', ctrl.getResults);
router.get('/blockchain',          protect, ctrl.getBlockchain);

module.exports = router;
