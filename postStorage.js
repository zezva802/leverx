const fs = require('fs');
const path = require('path');

const postsFile = path.join(__dirname, 'posts.json');

function readPosts() {
    if (!fs.existsSync(postsFile)) return [];
    const data = fs.readFileSync(postsFile, 'utf8');
    return data ? JSON.parse(data) : [];
}

function writePosts(posts) {
    const writeStream = fs.createWriteStream(postsFile);
    writeStream.write(JSON.stringify(posts, null, 2));
    writeStream.end();
}

module.exports = { readPosts, writePosts };
