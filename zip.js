import { zip } from 'zip-a-folder';

class TestMe {

    static async main() {
        await zip('./dist', 'dist.zip');
    }
}

TestMe.main();