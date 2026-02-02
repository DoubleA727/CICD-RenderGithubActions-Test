const express = require("express");
const router = express.Router();
const ccaController = require("../controllers/ccaController");

router.get("/", ccaController.getAllCCA);
router.post("/:id/click", ccaController.trackClick);
router.get("/admin/stats",ccaController.getCCAStats);
router.get("/recommend/:id", ccaController.getCCARecommendations);
router.delete("/admin/:id", ccaController.deleteCCA);
router.get("/admin/:id", ccaController.getCCAById);      
router.put("/admin/:id", ccaController.updateCCA); 
router.post("/admin", ccaController.createCCA);
router.put("/admin/enable/:id", ccaController.enableCCA);

    



module.exports = router;