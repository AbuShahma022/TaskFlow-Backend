import { Router } from "express";
import authRoute from "../modules/auth/auth.route";

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





];
allRoutes.forEach(({ path, route }) => {
	router.use(path, route);
});
export default router;
