const usersModel = require("../models/usersModel");
const jwtMiddleware = require("../middlewares/jwtMiddleware");


// make a username from email/displayName
function generateUsername({ email, displayName }) {
  const base = (email ? email.split("@")[0] : displayName || "user")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20);

  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}_${suffix}`;
}

/**
 * Expects req.user from Passport:
 * { provider, providerUserId, email, firstName, lastName, displayName }
 */
module.exports.oauthCallback = async (req, res) => {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3001";

  try {
    if (!req.user) {
      return res.redirect(`${clientUrl}/login.html#oauthError=missing_user`);
    }

    const { provider, providerUserId, email, firstName, lastName, displayName } = req.user;

    // If no email, fail (common for Microsoft if not configured)
    if (!email) {
      return res.redirect(`${clientUrl}/login.html#oauthError=no_email`);
    }

    // check existing oauth link (Prisma version recommended)
    const linked = await usersModel.findOauthAccount({ provider, providerUserId });

    if (linked?.userId) {
      const roleRow = await usersModel.getUserRoleByIdPrisma({ userId: linked.userId });

      res.locals.userId = linked.userId;
      res.locals.role = roleRow?.role || "member";

      return jwtMiddleware.generateToken(req, res, () => {
        const token = res.locals.token;
        return res.redirect(
          `${clientUrl}/oauthCallback.html#token=${encodeURIComponent(token)}&role=${encodeURIComponent(res.locals.role)}`
        );
      });
    }

    // if user exists by email, link
    const existing = await usersModel.findUserByEmailPrisma({ email });

    if (existing?.userId) {
      await usersModel.linkOauthAccount({
        provider,
        providerUserId,
        userId: existing.userId,
        email,
      });

      res.locals.userId = existing.userId;
      res.locals.role = existing.role || "member";

      return jwtMiddleware.generateToken(req, res, () => {
        const token = res.locals.token;
        return res.redirect(
          `${clientUrl}/oauthCallback.html#token=${encodeURIComponent(token)}&role=${encodeURIComponent(res.locals.role)}`
        );
      });
    }

    // else create user then link
    const username = generateUsername({ email, displayName });

    const created = await usersModel.createOauthUserPrisma({
      username,
      firstName,
      lastName,
      email,
    });

    await usersModel.linkOauthAccount({
      provider,
      providerUserId,
      userId: created.userId,
      email,
    });

    res.locals.userId = created.userId;
    res.locals.role = created.role || "member";

    return jwtMiddleware.generateToken(req, res, () => {
      const token = res.locals.token;
      return res.redirect(
        `${clientUrl}/oauthCallback.html#token=${encodeURIComponent(token)}&role=${encodeURIComponent(res.locals.role)}`
      );
    });
  } catch (err) {
    console.error("OAuth callback error:", err);
    return res.redirect(`${clientUrl}/login.html#oauthError=server`);
  }
};
