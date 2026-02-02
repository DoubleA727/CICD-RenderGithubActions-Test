const prisma = require("../services/prismaClient");

/* ============================================================
   INCREMENT CLICKS
   - Increases the click count when a user views a CCA.
   - Used by analytics to track popularity.
============================================================ */
module.exports.incrementClick = async (ccaId) => {
  return prisma.CCA.update({
    where: { ccaId },
    data: { clicks: { increment: 1 } }, // Atomic DB increment
  });
};

/* ============================================================
   FETCH ALL ACTIVE CCAs
   - Only returns CCAs that are active (isActive = true)
   - Sorted by popularity first, then alphabetically
   - Used on the main CCA listing page
============================================================ */
module.exports.fetchAllCCA = async () => {
  return prisma.CCA.findMany({
    where: { isActive: true },
    select: {
      ccaId: true,
      name: true,
      description: true,
      category: true,
      imageUrl: true,
      clicks: true,
    },
    orderBy: [
      { clicks: "desc" }, // Most popular first
      { name: "asc" },    // Tie-breaker alphabetical
    ],
  });
};

/* ============================================================
   FETCH STATS FOR ADMIN DASHBOARD
   - Supports:
       * category filtering
       * showing disabled CCAs
       * multiple sorting modes
   - Returned data powers:
       * KPIs
       * bar chart
       * pie chart
       * leaderboard table
============================================================ */
module.exports.fetchStats = async (category, sort) => {
  const where = {};

  // ------------------- CATEGORY FILTERING -------------------
  if (category === "disabled") {
    where.isActive = false; // Show only disabled CCAs
  } else {
    where.isActive = true;

    if (category !== "all") {
      where.category = category;
    }
  }

  // ------------------- SORTING LOGIC -----------------------
  let orderBy;

  switch (sort) {
    case "clicks_desc":
      orderBy = [{ clicks: "desc" }, { name: "asc" }];
      break;

    case "clicks_asc":
      orderBy = [{ clicks: "asc" }, { name: "asc" }];
      break;

    case "name_asc":
      orderBy = [{ name: "asc" }];
      break;

    case "name_desc":
      orderBy = [{ name: "desc" }];
      break;

    default:
      // Default sorting = most popular first
      orderBy = [{ clicks: "desc" }, { name: "asc" }];
  }

  return prisma.CCA.findMany({
    where,
    select: {
      ccaId: true,
      name: true,
      category: true,
      clicks: true,
      isActive: true,
    },
    orderBy,
  });
};

/* ============================================================
   GET RECOMMENDATIONS
   - Returns CCAs from the SAME CATEGORY
   - Excludes the selected CCA
   - Sorted by popularity
   - Limited to 3 recommendations
============================================================ */
module.exports.getRecommendations = async (ccaId) => {
  // Step 1: Get category of selected CCA
  const selected = await prisma.CCA.findUnique({
    where: { ccaId },
    select: { category: true },
  });

  if (!selected) return [];

  // Step 2: Return top CCAs in same category (except itself)
  return prisma.CCA.findMany({
    where: {
      category: selected.category,
      ccaId: { not: ccaId }, // exclude itself
    },
    select: {
      ccaId: true,
      name: true,
      category: true,
      imageUrl: true,
      clicks: true,
      description: true,
    },
    orderBy: { clicks: "desc" },
    take: 3,
  });
};

/* ============================================================
   DISABLE CCA (Soft Delete)
   - Sets isActive = false
   - ALSO disables linked merch items
   - Ensures users cannot see or buy disabled CCA merch
============================================================ */
module.exports.disableCCA = async (id) => {
  // Disable all merch belonging to this CCA
  await prisma.merch.updateMany({
    where: { ccaId: id },
    data: { isActive: false },
  });

  // Disable the CCA itself
  return prisma.CCA.update({
    where: { ccaId: id },
    data: { isActive: false },
  });
};

/* ============================================================
   GET A SINGLE CCA BY ID
   - Used for admin edit modal & user quick-view modal
============================================================ */
module.exports.getCCAById = async (id) => {
  return prisma.CCA.findUnique({
    where: { ccaId: id },
    select: {
      ccaId: true,
      name: true,
      description: true,
      imageUrl: true,
      category: true,
      clicks: true,
      isActive: true,
    },
  });
};

/* ============================================================
   UPDATE CCA DETAILS
   - Supports editing name, category, description, image
   - Used by admin dashboard
============================================================ */
module.exports.updateCCA = async (data) => {
  const { id, name, category, description, imageUrl } = data;

  return prisma.CCA.update({
    where: { ccaId: id },
    data: {
      name,
      category,
      description,
      imageUrl,
    },
    select: {
      ccaId: true,
      name: true,
      description: true,
      imageUrl: true,
      category: true,
      clicks: true,
      isActive: true,
    },
  });
};

/* ============================================================
   CREATE NEW CCA
   - Used in admin dashboard (Add CCA popup)
   - Automatically sets:
       * clicks = 0
       * isActive = true
============================================================ */
module.exports.createCCA = async (data) => {
  return prisma.CCA.create({
    data: {
      name: data.name,
      category: data.category,
      description: data.description || "",
      imageUrl: data.imageUrl || "",
      clicks: 0,
      isActive: true,
    },
  });
};

/* ============================================================
   ENABLE CCA (Reverse Disable)
   - Re-activates both CCA & its merch items
   - Used by admin dashboard
============================================================ */
module.exports.enableCCA = async (id) => {
  // Enable merch linked to this CCA
  await prisma.merch.updateMany({
    where: { ccaId: id },
    data: { isActive: true },
  });

  // Enable the CCA itself
  return prisma.CCA.update({
    where: { ccaId: id },
    data: { isActive: true },
  });
};
