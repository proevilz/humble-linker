import replace from 'replace-in-file'
const options = {
    files: './dist/*.html',
    from: /\/assets/g,
    to: './assets',
};
try {
    const results = await replace(options)
    console.log('Replacement results:', results);
}
catch (error) {
    console.error('Error occurred:', error);
}