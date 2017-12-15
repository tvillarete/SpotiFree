var ThemeManager = {
    currentTheme: localStorage.theme ? localStorage.theme : 'apple-music',

    toggleTheme: () => {
        var body = $('body');
        body.toggleClass('apple-music');
        if (body.hasClass('apple-music')) {
            ThemeManager.currentTheme = 'apple-music';
        } else {
            ThemeManager.currentTheme = 'spotifree';
        }
        localStorage.theme = ThemeManager.currentTheme;
        ThemeManager.setCurrentTheme();
    },

    setCurrentTheme: () => {
        $('body').addClass(ThemeManager.currentTheme);
    },
}
