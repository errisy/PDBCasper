//this project uses CasperJS to grab PDB data.

//http://www.rcsb.org/pdb/results/results.do?gotopage=2&qrid=1A6FF44D&tabtoshow=Current


module pdb {

    let casper: Casper = require('casper');
    let fs: FileSystem = require('fs');

    class CasperWorker {
        public links: string[];
        public workload: (url: string, next: () => void, terminate: () => void) => void;
        public callback: () => void;
        constructor(links: string[], workload: (url: string, next: () => void, terminate: () => void) => void, callback: () => void) {
            this.links = links.map(value => value);
            this.workload = workload;
            this.callback = callback;
        }
        public run = () => {
            let that = this;
            if (this.links.length > 0) {
                let link = this.links.shift();
                console.log('run: ' + link);
                this.workload(link, that.run, that.callback);
            }
            else {
                this.callback();
            }
        }

    }

    //casper.viewport(1280, 960);
    var links: string[] = [];
    function getFileName(link: string): string {
        let lastIndex = link.lastIndexOf('\/');
        if (lastIndex > -1) return link.substr(lastIndex + 1);
        return link;
    }

    casper = casper.create({
        viewportSize: {
            width: 1280,
            height: 960
        },
        pageSettings: {
            userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.97 Safari/537.11",
            webSecurityEnabled: false
        }
    });


    for (let i: number = 1; i < 20; i++) {
        links.push('http://www.rcsb.org/pdb/results/results.do?gotopage=' + i + '&qrid=2B8420E2&tabtoshow=Current');
    }

    function start() {
        casper.start('http://www.rcsb.org/pdb/home/home.do', res => {
            console.log('rcsb loaded.');
        });
        casper.run(() => {
            iteratePages();
        });
    }
    function iteratePages() {
        let worker = new CasperWorker(links, readPage, () => {
            casper.exit();
        });
        worker.run();
    }
    function readPage(link: string, next: () => void, terminate: () => void): void {
        console.log('open page: ' + link);
        let PDBs: string[];
        casper.thenOpen(link, (res) => {
            console.log('a.thumb ? ', casper.exists('div.col-lg-9>h3>a'));
            casper.waitForSelector('div.col-lg-9>h3>a', () => {
                PDBs = casper.getElementsAttribute('div.col-lg-9>h3>a', 'href').map(idref => idref.substring(idref.length -4));
                console.log('PDB ids: ' + PDBs.join());
                //download picture
                PDBs.forEach(pdbID => {
                    casper.download('http://www.rcsb.org/pdb/images/' + pdbID + '_bio_r_500.jpg', './pdb/' + pdbID + '.jpg');
                    casper.download('http://files.rcsb.org/download/' + pdbID + '.pdb', './pdb/' + pdbID + '.pdb');
                });
            });
        });
        casper.run(() => {
            //let worker = new CasperWorker(links, downloadPicture, (links.length = 16) ? next : terminate);
            //worker.run();
            next();
        });
    }
    start();
}