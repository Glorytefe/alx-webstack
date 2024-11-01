const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { requireAuthAsync } = require('../middleware/requireAuth');
const { requireAdmin } = require('../middleware/requireAdmin');

router.get('/', postController.getPosts);
router.get('/search', postController.searchPosts);
router.post('/', requireAuthAsync, postController.createPost);
router.get('/:id', requireAuthAsync, postController.getPostById);
router.patch('/:id', requireAuthAsync, postController.updatePost);
router.delete('/:id', requireAuthAsync, postController.deletePost);
router.post('/:id/comments', requireAuthAsync, postController.addCommentToPost);
router.delete('/:postId/comments/:commentId', requireAdmin, postController.deleteCommentFromPost);

module.exports = router;
