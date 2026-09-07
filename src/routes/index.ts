import { Router } from "express";
import authRoute from "../modules/auth/auth.route";
import userRoute from "../modules/user/user.route";
import organizationRoute from "../modules/organization/organization.route";
import organizationInvitationRoute from "../modules/organization/organizationInvitation.route";

interface IRoute {
	path: string;
	route: Router;
}
const router = Router();

const allRoutes: IRoute[] = [
	  {
    path: "/auth",
    route: authRoute,
  },
  {
	path:"/users",
	route:userRoute
  },
  {
	path:"/organizations",
	route:organizationRoute
  },
    {
    path: "/organizations",
    route: organizationInvitationRoute,
  },





];
allRoutes.forEach(({ path, route }) => {
	router.use(path, route);
});
export default router;
