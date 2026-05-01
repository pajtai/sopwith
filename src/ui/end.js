// End-of-game message — port of src/swend.c's `dispendmessage`.

import { SCR_WDTH } from "../sim/constants.js";
import { state } from "../sim/state.js";
import { OBENDSTATUS } from "../sim/types.js";
import { swcolor, swposcur, swputs } from "../sim/text.js";

export function dispendmessage() {
	if (!state.consoleplayer) return;
	if (state.consoleplayer.ob_endsts === OBENDSTATUS.PLAYING) return;
	swcolor(0x82);
	swposcur((SCR_WDTH >> 4) - 4, 12);
	swputs("THE END");
}
