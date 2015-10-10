Router.route('/', {
    name: 'uber',
    path: '/uber',
    action: function() {
        this.render('auth');
    }
});

