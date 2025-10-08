import * as client from "openid-client";
import { Strategy as ReplitStrategy, type VerifyFunction } from "openid-client/passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { PostgresStorage } from "./PostgresStorage";

// Storage instance to be initialized in setupStorage
export let storage: PostgresStorage;
export function setupStorage(dbUrl: string) {
  storage = new PostgresStorage(dbUrl);
}

// Check if required environment variables exist
const hasReplitAuth = process.env.REPLIT_DOMAINS && process.env.REPL_ID;
const hasGoogleAuth = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

if (!hasReplitAuth && !hasGoogleAuth) {
  throw new Error("At least one authentication provider must be configured (Replit or Google)");
}

// Replit Auth Configuration
const getOidcConfig = memoize(
  async () => {
    if (!hasReplitAuth) return null;
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession(dbUrl: string) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: dbUrl,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

// Helper functions for user management
function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
  user.provider = 'replit';
}

function updateGoogleUserSession(user: any, profile: any, accessToken: string, refreshToken?: string) {
  user.claims = {
    sub: profile.id,
    email: profile.emails?.[0]?.value,
    first_name: profile.name?.givenName,
    last_name: profile.name?.familyName,
    profile_image_url: profile.photos?.[0]?.value,
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  };
  user.access_token = accessToken;
  user.refresh_token = refreshToken;
  user.expires_at = user.claims.exp;
  user.provider = 'google';
}

async function upsertUser(claims: any) {
  await storage.upsertUser({
    id: claims["sub"].toString(), // Convert to string to ensure consistency
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
    password: "", // Provide a default or handle as needed
    role: "user" // Provide a default or handle as needed
  });
}

export async function setupAuth(app: Express, dbUrl: string) {
  app.set("trust proxy", 1);
  app.use(getSession(dbUrl));
  app.use(passport.initialize());
  app.use(passport.session());

  // Setup Replit Auth if configured
  if (hasReplitAuth) {
    const config = await getOidcConfig();
    
    const replitVerify: VerifyFunction = async (
      tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
      verified: passport.AuthenticateCallback
    ) => {
      const user = {};
      updateUserSession(user, tokens);
      await upsertUser(tokens.claims());
      verified(null, user);
    };

    for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
      const strategy = new ReplitStrategy(
        {
          name: `replitauth:${domain}`,
          config: config!,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/replit/callback`,
        },
        replitVerify,
      );
      passport.use(strategy);
    }
  }

  // Setup Google Auth if configured
  if (hasGoogleAuth) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/api/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const user = {};
        updateGoogleUserSession(user, profile, accessToken, refreshToken);
        await upsertUser((user as any).claims);
        return done(null, user);
      } catch (error) {
        return done(error, undefined);
      }
    }));
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Auth routes
  
  // Replit Auth routes
  if (hasReplitAuth) {
    app.get("/api/login/replit", (req, res, next) => {
      passport.authenticate(`replitauth:${req.hostname}`, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    });

    app.get("/api/replit/callback", (req, res, next) => {
      passport.authenticate(`replitauth:${req.hostname}`, {
        successReturnToOrRedirect: "/",
        failureRedirect: "/api/login",
      })(req, res, next);
    });
  }

  // Google Auth routes
  if (hasGoogleAuth) {
    app.get("/api/login/google", 
      passport.authenticate("google", { scope: ["profile", "email"] })
    );

    app.get("/api/google/callback",
      passport.authenticate("google", { failureRedirect: "/api/login" }),
      (req, res) => {
        res.redirect("/");
      }
    );
  }

  // Generic login route - redirect to available provider
  app.get("/api/login", (req, res) => {
    if (hasGoogleAuth) {
      res.redirect("/api/login/google");
    } else if (hasReplitAuth) {
      res.redirect("/api/login/replit");
    } else {
      res.status(500).json({ message: "No authentication provider configured" });
    }
  });

  // Logout route
  app.get("/api/logout", async (req, res) => {
    const user = req.user as any;
    
    req.logout(() => {
      if (user?.provider === 'replit' && hasReplitAuth) {
        // Redirect to Replit logout
        getOidcConfig().then(config => {
          if (config) {
            res.redirect(
              client.buildEndSessionUrl(config, {
                client_id: process.env.REPL_ID!,
                post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
              }).href
            );
          } else {
            res.redirect("/");
          }
        });
      } else {
        // For Google or no provider, just redirect to home
        res.redirect("/");
      }
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // For Google auth users, check if token has expired
  if (user.provider === 'google') {
    const now = Math.floor(Date.now() / 1000);
    if (user.expires_at && now > user.expires_at) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return next();
  }

  // For Replit auth users, handle token refresh
  if (user.provider === 'replit') {
    if (!user.expires_at) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const now = Math.floor(Date.now() / 1000);
    if (now <= user.expires_at) {
      return next();
    }

    const refreshToken = user.refresh_token;
    if (!refreshToken) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      const config = await getOidcConfig();
      if (config) {
        const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
        updateUserSession(user, tokenResponse);
        return next();
      } else {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
    } catch (error) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
  }

  return next();
};