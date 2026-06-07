import HttpService from "#server/services/HttpService.ts";
import container from "./container";

const http = container.proxy<HttpService>(HttpService)

export default http
