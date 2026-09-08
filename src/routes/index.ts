import { Router } from "express";
import authRoute from "../modules/auth/auth.route";
import userRoute from "../modules/user/user.route";
import organizationRoute from "../modules/organization/organization.route";
import organizationInvitationRoute from "../modules/organization/organizationInvitation.route";
import teamRoute from "../modules/team/team/team.route";
import projectRoute from "../modules/project/project.route";
import sprintRoute from "../modules/sprint/sprint.route";
import taskRoute from "../modules/task/task.route";

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
    path: "/users",
    route: userRoute,
  },
  {
    path: "/organizations",
    route: organizationRoute,
  },
  {
    path: "/organizations",
    route: organizationInvitationRoute,
  },

  {
    path: "/organizations",

    route: teamRoute,
  },

  {
  path: "/organizations",
  route: projectRoute,
},

{
  path: "/organizations",
  route: sprintRoute,
},
{
  path: "/organizations",
  route: taskRoute,
},


];
allRoutes.forEach(({ path, route }) => {
	router.use(path, route);
});
export default router;
