function attachUser(req, res, next) {
    res.locals.currentUser = req.session.user || null;
    next();
}

// One-shot flash message rendered as a toast on the next page load, then cleared.
function attachFlash(req, res, next) {
    res.locals.flash = req.session.flash || null;
    delete req.session.flash;
    next();
}

function setFlash(req, message, type) {
    req.session.flash = { message, type: type || 'default' };
}

function requireLogin(req, res, next) {
    if (!req.session.user) {
        req.session.returnTo = req.originalUrl;
        return res.redirect('/login');
    }
    next();
}

module.exports = { attachUser, attachFlash, setFlash, requireLogin };
