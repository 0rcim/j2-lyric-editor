import LyricLines from "./LyricLines";

import TextFileParser from "./TextFileParser";

module.exports = new LyricLines(
	// new TextFileParser("Last November strikes me like a gone train\nYou took my hand in the pouring rain\nKept looking back at me\nThis November feels a little different\nThe rain is still pouring, went straight down the drain\nWalking home alone with a bottle of champaign\nquarter after 10\nI won't be needing your hand\nThe only thing left to erase\nIs the tattoo above my heart\nThe last trace\nIt's perfectly faked\n1.5 mm under your skin\nIs that how deep our love has gotten to you?\nYou wear my heart right beneath your right sleeve\nIs that how you're planning to remember me?\nCuz I don't appreciate it like you do\nCuz I don't appreciate it like you do\n1.5 mm under my skin\nThis is where I plan to remove you\n\nLast summer felt like a waking dream\nOur love left a scar way too extreme\nWas it perfect as it seemed\nNow Everything's turned into hallucination\nCan it be a celebration\nHere's to my funny-looking tattoo\nWalking home alone with a bottle of champaign\nquarter after 10\nI won't be needing your hand\nThe only thing left to erase\nIs the tattoo above my heart\nThe last trace\nI wish it was fake\n1.5 mm under your skin\nIs that how deep our love has gotten to you?\nYou wear my heart right beneath your right sleeve\nIs that how you're planning to remember me?\nCuz I don't appreciate it like you do\nCuz I don't appreciate it like you do\n1.5 mm under my skin\nThis is where I plan to remove you\n\n1.5 mm under your skin\n\n1.5 mm under my skin\nYou wear my heart right beneath your right sleeve\nIs that how you're planning to remember me?\n\nCuz I don't appreciate it like you do\n1.5 mm under my skin\nThis is where I plan to remove you")
	new TextFileParser("Last November strikes me like a gone train\nYou took my hand in the pouring rain\nKept looking back at me")
	.getParsedLine(),
	{
		createDate: new Date(),
		songName: "1.5mm"
	}
);