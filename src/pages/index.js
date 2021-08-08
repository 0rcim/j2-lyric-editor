Page(
	{
		mixins: [require("../mixin/themeChanged")],
		changeTheme () {
			getApp().themeChanged(
				this.data.theme === "dark" ? "light" : "dark"
			);
		}
	}
);