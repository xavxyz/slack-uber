Users.allow({
    insert : function (userId) {
        return (userId);
    },
    update : function (userId) {
        return userId;
    },
    remove : function (userId, doc) {
        return doc.owner === userId;
    }
});
