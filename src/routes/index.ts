import { Router } from "express";

interface IRoute {
	path: string;
	route: Router;
}
const router = Router();

const allRoutes: IRoute[] = [];
allRoutes.forEach(({ path, route }) => {
	router.use(path, route);
});
export default router;
