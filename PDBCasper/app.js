//this project uses CasperJS to grab PDB data.
//http://www.rcsb.org/pdb/results/results.do?gotopage=2&qrid=1A6FF44D&tabtoshow=Current
var pdb;
(function (pdb) {
    var casper = require('casper');
    var fs = require('fs');
    var CasperWorker = (function () {
        function CasperWorker(links, workload, callback) {
            var _this = this;
            this.run = function () {
                var that = _this;
                if (_this.links.length > 0) {
                    var link = _this.links.shift();
                    console.log('run: ' + link);
                    _this.workload(link, that.run, that.callback);
                }
                else {
                    _this.callback();
                }
            };
            this.links = links.map(function (value) { return value; });
            this.workload = workload;
            this.callback = callback;
        }
        return CasperWorker;
    }());
    //casper.viewport(1280, 960);
    var links = [];
    function getFileName(link) {
        var lastIndex = link.lastIndexOf('\/');
        if (lastIndex > -1)
            return link.substr(lastIndex + 1);
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
    for (var i = 1; i < 20; i++) {
        links.push('http://www.rcsb.org/pdb/results/results.do?gotopage=' + i + '&qrid=2B8420E2&tabtoshow=Current');
    }
    function start() {
        casper.start('http://www.rcsb.org/pdb/home/home.do', function (res) {
            console.log('rcsb loaded.');
        });
        casper.run(function () {
            iteratePages();
        });
    }
    function iteratePages() {
        var worker = new CasperWorker(links, readPage, function () {
            casper.exit();
        });
        worker.run();
    }
    function readPage(link, next, terminate) {
        console.log('open page: ' + link);
        var PDBs;
        casper.thenOpen(link, function (res) {
            console.log('a.thumb ? ', casper.exists('div.col-lg-9>h3>a'));
            casper.waitForSelector('div.col-lg-9>h3>a', function () {
                PDBs = casper.getElementsAttribute('div.col-lg-9>h3>a', 'href').map(function (idref) { return idref.substring(idref.length - 4); });
                console.log('PDB ids: ' + PDBs.join());
                //download picture
                PDBs.forEach(function (pdbID) {
                    casper.download('http://www.rcsb.org/pdb/images/' + pdbID + '_bio_r_500.jpg', './pdb/' + pdbID + '.jpg');
                    casper.download('http://files.rcsb.org/download/' + pdbID + '.pdb', './pdb/' + pdbID + '.pdb');
                });
            });
        });
        casper.run(function () {
            //let worker = new CasperWorker(links, downloadPicture, (links.length = 16) ? next : terminate);
            //worker.run();
            next();
        });
    }
    start();
})(pdb || (pdb = {}));
//# sourceMappingURL=app.js.map