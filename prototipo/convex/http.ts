// HTTP routes: Convex Auth endpoints (Google sign-in callback, token keys).
import { httpRouter } from 'convex/server';
import { auth } from './auth';

const http = httpRouter();

auth.addHttpRoutes(http);

export default http;
