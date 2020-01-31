function assertTrue(condition, msg) {
    if(!condition) {
        throw msg;
    }
}

function assertFalse(condition, msg) {
    assertTrue(!condition, msg);
}