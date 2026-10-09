import { flag } from "@flag";

const homeV1 = flag.HOME_V1("Shown Homepage V1", "Nothing for Homepage V1");
const homeV2 = flag.HOME_V2("Shown Homepage V2", "Nothing for Homepage V2");
const fetcher = flag.HOME_V1(
	(a = "whenOn") => {},
	(b = "whenOff") => {},
);
console.log(homeV1, homeV2, fetcher);
