const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const replyController = require('../controllers/reply.controller');
const router = express.Router();

// Public GET route
router.get('/:id', replyController.getReplyById);

// All routes below require authentication
router.use(protect);

router.post('/', replyController.createReply);
router.delete('/:id', replyController.deleteReply);

module.exports = router;