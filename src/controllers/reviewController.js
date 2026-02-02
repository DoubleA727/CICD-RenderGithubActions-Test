const reviewModel = require("../models/reviewModel");

// get review by rid
module.exports.getReviewById = function(req, res){
    const reviewId = req.query.reviewId;
    if(!reviewId){
        return res.status(400).json({ success: false, message: "No reviewId provided" });
    }

    reviewModel.findReviewById({ reviewId: reviewId }, function(err, result){
        if(err){
            console.error(err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if(result.rows.length === 0){
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        // Make sure reviewId is included in the returned object
        const reviewRow = result.rows[0];
        // console.log("REIVEW ROW: ", reviewRow)
        const review = {
            reviewId: reviewRow.reviewId,
            userId: reviewRow.userId,
            username: reviewRow.username,
            userfirstname: reviewRow.userfirstname,
            userlastname: reviewRow.userlastname,
            merchId: reviewRow.merchId,
            merchname: reviewRow.merchname,
            merchimage: reviewRow.merchimage,
            rating: reviewRow.rating,
            comments: reviewRow.comments,
            createdAt: reviewRow.createdAt,
            updatedAt: reviewRow.updatedAt
        };

        return res.status(200).json({ success: true, review: review });
    });
};

// GET reviews by userId
module.exports.getReviewsByUserId = function(req, res){
    let userId = req.query.userId;

    if(!userId){
        return res.status(400).json({
            success: false,
            message: "Invalid Login Session"
        });
    }

    let data = { userId: userId };

    reviewModel.getReviewsByUserId(data, function(error, results){
        if(error){
            console.error(error);
            return res.status(500).json(error);
        } else if(results.rows.length === 0){
            return res.status(200).json({
                success: false,
                message: "You dont have any reviews yet."
            });
        } else {
            return res.status(200).json({
                success: true,
                reviews: results
            });
        }
    });
};

// GET reviews by merchId
module.exports.getReviewsByMerchId = function(req, res) {
    const merchId = req.query.merchId;

    if (!merchId) {
        return res.status(400).json({ message: "merchId is required" });
    }

    // Directly call model
    reviewModel.getReviewsByMerchId({ merchId: merchId }, function(error, results) {
        if (error) {
            console.error(error);
            return res.status(500).json(error);
        }
        return res.status(200).json({ merch: results });
    });
};

// GET
module.exports.getEarliestMerch = function(req, res){
    reviewModel.getEarliestMerch(function(error, results){
        if(error){
            console.error(error);
            return res.status(500).json(error);
        }
        else{
            return res.status(200).json({
                merch: results
            })
        }
    })
}

//GET FROM USERMERCH
module.exports.getUserMerchByUID = function(req, res) {
    const userId = parseInt(req.query.userId);
    // console.log(userId)
    let data ={
        userId: userId
    }

    reviewModel.getUserMerchByUID(data, function(error, results) {
        if (error) {
            console.error(error);
            return res.status(500).json(error);
        } else {
            return res.status(200).json({
                userMerch: results
            });
        }
    });
};

//MIDDLEWARES FOR POST
module.exports.checkUserMerchOwnership = function(req, res, next){
    let userId = req.body.userId;
    let merchId = req.query.merchId;

    if(!userId){
        return res.status(400).json({
            success: false,
            message: "Invalid Login Session, please Re-Login"
        })
    }

    if(!merchId){
        return res.status(400).json({
            success: false,
            message: "Invalid merchId, please reload the page."
        })
    }

    let data = {
        userId: userId,
        merchId: merchId
    }

    reviewModel.checkUserMerchOwnership(data, function(error, results){
        // console.log("usermerch")
        // console.log(results)
        if(error){
            console.error(error);
            return res.status(500).json(error);
        }
        else if(results.rows.length === 0){
            return res.status(403).json({
                success: false,
                message: "You must own this merchandise before you can review it. Please purchase the item first."
            });
        }
        else{
            next();
        }
    });
}

module.exports.getReviewsByMerchIdAndUserId = function(req, res, next){
    let userId = req.body.userId
    let merchId = req.query.merchId;

    if(!userId){
        return res.status(400).json({
            message: "Invalid Login Session, please Re-Login"
        })
    }

    if(!merchId){
        return res.status(500).json({
            message: "Invalid merchId, please reload the page."
        })
    }

    let data = {
        userId: userId,
        merchId: merchId
    }

    reviewModel.getReviewsByMerchIdAndUserId(data, function(error, results){
        // console.log(results);
        if(error){
            console.error(error);
            return res.status(500).json(error);
        }
        else if(results.rows.length > 0){
            return res.status(409).json({
                message: "You alreadly have a review for this merch!"
            })
        }
        else{
            next();
        }
    })
}

//POST
module.exports.postReview = function(req, res){
    let userId = req.body.userId;
    let merchId = req.query.merchId;
    let rating = req.body.rating;
    let comments = req.body.comments;

    if(!userId){
        return res.status(500).json({
            message: "Invalid Login Session, Please Re-Login"
        })
    }
    
    if(!merchId){
        return res.status(500).json({
            message: "Invalid merchId, please reload the page."
        })
    }

    if(!rating || !comments){
        return res.status(500).json({
            message: "Rating or Comments empty."
        })
    }

    let data = {
        userId: userId,
        merchId: merchId,
        rating: rating,
        comments: comments
    }

    reviewModel.postReview(data, function(error, results){
        if(error){
            console.error(error);
            return res.status(500).json(error);
        }
        else{
            // console.log("posting", results)
            return res.status(200).json({
                success: true,
                review: results
            })
        }
    })
}

// PUT /reviews/edit
module.exports.editReview = function(req, res){
    const reviewId = req.query.reviewId;
    const rating = req.body.rating;
    const comments = req.body.comments;
    // console.log(reviewId)
    // console.log(rating)
    // console.log(comments)
    if(!reviewId || !rating || !comments){
        return res.status(400).json({
            success: false,
            message: "ReviewId, rating, or comments cannot be empty."
        });
    }

    const updateData = { reviewId, rating, comments };

    reviewModel.editReview(updateData, function(error, results){
        if(error){
            console.error(error);
            return res.status(500).json(error);
        } else if(results.rows.length === 0){
            return res.status(403).json({
                success: false,
                message: "No review found to update."
            });
        } else {
            return res.status(200).json({
                success: true,
                updatedReview: results.rows[0]
            });
        }
    });
};

//DELETE
module.exports.deleteReview = function(req, res){
    let userId = req.body.userId;
    let merchId = req.query.merchId;

    if(!userId){
        return res.status(400).json({
            success: false,
            message: "Invalid Login Session, please Re-Login"
        });
    }

    if(!merchId){
        return res.status(400).json({
            success: false,
            message: "Invalid merchId, please reload the page."
        });
    }

    let data = {
        userId: userId,
        merchId: merchId
    };

    reviewModel.deleteReview(data, function(error, results){
        if(error){
            console.error(error);
            return res.status(500).json(error);
        } else if(results.rowCount === 0){
            return res.status(404).json({
                success: false,
                message: "Review not found or already deleted."
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "Review deleted successfully."
            });
        }
    });
};

//REVIEW COMMENTS
//get comments by reviewId
module.exports.getReviewCommentsByReviewId = function(req, res){
    let reviewId = req.query.reviewId;
    // console.log("FETCHING COMMENTS FOR REVIEW ID: ", reviewId);
    if(!reviewId){
        return res.status(400).json({
            message: "Invalid reviewId, please reload the page."
        });
    }

    let data = {
        reviewId: parseInt(reviewId)
    }

    reviewModel.getReviewCommentsByReviewId(data, function(error, results){
        if(error){
            console.error(error);
            return res.status(500).json("Error fetching comments: " + error);
        }
        else {
            // console.log("RESULT FROM GET COMMENT MODEL: ", results.rows);

            const formattedComments = results.rows.map(function(c) {
                let imagePath = null;

                if (c.imageUrl) {
                    try {
                        const imgObj = JSON.parse(c.imageUrl); // parse the JSON string
                        if (imgObj && imgObj.path) {
                            imagePath = imgObj.path; // get only the Cloudinary URL
                        }
                    } catch (err) {
                        console.error("Failed to parse imageUrl JSON:", err);
                        imagePath = null;
                    }
                }

                return {
                    ...c,
                    imageUrl: imagePath
                };
            });

            return res.status(200).json({
                comments: formattedComments
            });
        }
    });
}

//post comment to review
module.exports.postReviewComment = function(req, res){
    let reviewId = req.body.reviewId;
    let userId = req.body.userId;
    let comment = req.body.comment;
    let image = req.file || null;
    // console.log("POSTING COMMENT: ", req.body);

    if(!comment){
        return res.status(400).json({
            message: "Comment cannot be empty."
        });
    }

    if(!reviewId){
        return res.status(400).json({
            message: "Invalid reviewId, please reload the page."
        });
    }

    if(!userId){
        return res.status(400).json({
            message: "Invalid Login Session, please Re-Login"
        });
    }

    let data = {
        reviewId: reviewId,
        userId: userId,
        comment: comment,
        image: image
    }

    reviewModel.postReviewComment(data, function(error, results){
        if(error){
            console.error(error);
            return res.status(500).json("Error posting comment: " + error);
        }
        else{
            // console.log("Posted comment: ", results.rows[0]);
            return res.status(200).json({
                success: true,
                comment: results.rows[0]
            });
        }
    });
}

//edit review comment
module.exports.editReviewComment = function(req, res){
    let reviewId = req.query.reviewId;
    let commentId = req.body.commentId;
    let comment = req.body.comment;

    if(!comment){
        return res.status(400).json({
            message: "Comment cannot be empty."
        });
    }

    if(!reviewId){
        return res.status(400).json({
            message: "Invalid reviewId, please reload the page."
        });
    }

    // if(!userId){
    //     return res.status(400).json({
    //         message: "Invalid Login Session, please Re-Login"
    //     });
    // }

    let data = {
        reviewId: reviewId,
        commentId: commentId,
        comment: comment
    }
    console.log("data to edit comment: ", data);
    reviewModel.editReviewComment(data, function(error, results){
        if(error){
            console.error(error);
            return res.status(500).json("Error editing comment: " + error);
        }
        else{
            return res.status(200).json({
                success: true,
                comment: results.rows[0]
            });
        }
    });
}

//delete review comment
module.exports.deleteReviewComment = function(req, res){
    let commentId = req.body.commentId;
    let userId = req.body.userId;
    let reviewId = req.query.reviewId;

    if(!reviewId){
        return res.status(400).json({
            message: "Invalid reviewId, please reload the page."
        });
    }

    if(!commentId){
        return res.status(400).json({
            message: "Invalid commentId, please reload the page."
        });
    }
    
    if(!userId){
        return res.status(400).json({
            message: "Invalid Login Session, please Re-Login"
        });
    }

    let data = {
        commentId: commentId,
        userId: userId
    }

    reviewModel.deleteReviewComment(data, function(error, results){
        if(error){
            console.error(error);
            return res.status(500).json("Error deleting comment: " + error);
        }
        else{
            return res.status(200).json({
                success: true,
                message: "Comment deleted successfully."
            });
        }
    });
}