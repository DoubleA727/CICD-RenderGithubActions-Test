const express = require('express');
const router = express.Router();

const reviewController = require('../controllers/reviewController');
const uploadReviewCommentImage = require("../middlewares/cloudinaryReviewCommentMulter");

// 1) GET /reviews BY MERCH ID
router.get('/', reviewController.getReviewsByMerchId);
// 1.5) GET /reviews/UM (usermerch)
router.get('/UM', reviewController.getUserMerchByUID);
// 1.75 GET /reviews/user BY USER ID
router.get('/user', reviewController.getReviewsByUserId);
// 1.9 GET /reviews/get BY REVIEW ID
router.get('/get', reviewController.getReviewById);
// 2) POST /reviews
router.post('/', 
    reviewController.checkUserMerchOwnership,
    reviewController.getReviewsByMerchIdAndUserId, 
    reviewController.postReview
);
// 3) PUT /reviews/edit
router.put('/edit',
    reviewController.editReview
);
// 4) DELETE /reviews
router.delete('/', reviewController.deleteReview);

//REVIEW COMMENTS
// 1) GET /reviews/comments
router.get('/comments', reviewController.getReviewCommentsByReviewId);
// 2) POST /reviews/comments
router.post('/comments', uploadReviewCommentImage.single("image"), reviewController.postReviewComment);
// 3) PUT /reviews/comments
router.put('/comments', reviewController.editReviewComment);
// 4) DELETE /reviews/comments
router.delete('/comments', reviewController.deleteReviewComment);
module.exports = router;
