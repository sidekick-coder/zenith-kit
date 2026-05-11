import { AuthorizationMiddleware, AuthorizePermission  } from "@sidekick-coder/zenith-kit/server";

/** @deprecated use @sidekick-coder/zenith-kit/server's AuthMiddleware instead */
const authorizationMiddleware = new AuthorizationMiddleware()

export { AuthorizePermission, AuthorizationMiddleware }

export default authorizationMiddleware;
