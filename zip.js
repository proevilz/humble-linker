import { zip } from 'zip-a-folder';

class TestMe {

    static async main() {
        await zip('./dist', 'dist.zip');
        console.log('zip generated')
    }
}

TestMe.main();