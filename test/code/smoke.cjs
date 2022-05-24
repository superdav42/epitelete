const test = require("tape");
const path = require("path");
const fse = require("fs-extra");
const {UWProskomma} = require("uw-proskomma");
const {doRender} = require("proskomma-render-perf");
const perf2html = require("../../src/perf2html").default;
const Epitelete = require("../../src/index").default;

const testGroup = "Smoke";

const pk = new UWProskomma();
// const succinctJson = fse.readJsonSync(path.resolve(path.join(__dirname, "..", "test_data", "fra_lsg_succinct.json")));
const succinctJson = fse.readJsonSync(path.resolve(path.join(__dirname, "..", "test_data", "eng_engWEBBE_succinct.json")));
pk.loadSuccinctDocSet(succinctJson);

test(
    `Instantiate Epitelete (${testGroup})`,
    async function (t) {
        try {
            t.plan(3);
            t.doesNotThrow(() => new Epitelete(pk, "DBL/eng_engWEBBE"));
            t.throws(() => new Epitelete(pk), "2 arguments");
            t.throws(() => new Epitelete(pk, "eBible/fra_fraLSG"),"docSetId is not present");
        } catch (err) {
            console.log(err);
        }
    },
);

// fetchPerf tests

test(
    `fetchPerf() is defined (${testGroup})`,
    async t => {
        const docSetId = "DBL/eng_engWEBBE";
        const epitelete = new Epitelete(pk, docSetId);
        t.ok(typeof epitelete.fetchPerf === "function");
        t.end();
    }
)

test(
    `fetchPerf should not fetch wrong bookCode (${testGroup})`,
    async t => {
        t.plan(1);
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete(pk, docSetId);
            const bookCode = "LU";
            await epitelete.fetchPerf(bookCode);
            t.fail("fetchPerf with bad bookCode should throw but didn't");
        } catch (err) {
            t.pass("fetchPerf throws on bad bookCode");
        }
    }
)

test(
    `fetchPerf() returns config output (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete(pk, docSetId);
            const bookCode = "LUK";
            const output = await epitelete.fetchPerf(bookCode);
            t.ok("docSets" in output);
            t.ok(docSetId in output.docSets);
            t.ok("documents" in output.docSets[docSetId]);
            t.ok(bookCode in output.docSets[docSetId].documents);
            const doc = output.docSets[docSetId].documents[bookCode];
            for (const k of ["headers", "tags", "sequences", "mainSequence"]) {
                t.ok(k in doc);
            }
            // Make HTML - move to subclass!
            /*
            const ret = {
                docSetId,
                mainSequenceId: output.docSets[docSetId].documents[bookCode].mainSequence,
                headers: output.docSets[docSetId].documents[bookCode].headers,
                sequenceHtml: {},
            };
            Object.keys(output.docSets[docSetId].documents[bookCode].sequences)
                .forEach(seqId => { ret.sequenceHtml[seqId] = perf2html(output, seqId) });
                */
            // console.log(JSON.stringify(ret, null, 2));
        } catch (err) {
            t.error(err)
            console.log(err);
        }
        t.end()
    }
)

test(
    `fetchPerf() adds document to documents property (${testGroup})`,
    async t => {
        t.plan(2);
        const docSetId = "DBL/eng_engWEBBE";
        const epitelete = new Epitelete(pk, docSetId);
        const bookCode = "MRK";
        t.notOk(bookCode in epitelete.documents);
        await epitelete.fetchPerf(bookCode);
        t.ok(bookCode in epitelete.documents)
    }
)

test(
    `readPerf() is defined (${testGroup})`,
    async t => {
        const docSetId = "DBL/eng_engWEBBE";
        const epitelete = new Epitelete(pk, docSetId);
        t.ok(typeof epitelete.readPerf === "function");
        t.end();
    }
)

test(
    `readPerf should not read wrong bookCode (${testGroup})`,
    async t => {
        t.plan(1);
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete(pk, docSetId);
            const bookCode = "LU";
            await epitelete.readPerf(bookCode);
            t.fail("readPerf with bad bookCode should throw but didn't");
        } catch (err) {
            t.pass("readPerf throws on bad bookCode");
        }
    }
)

test(
    `readPerf returns same as fetchPerf (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete(pk, docSetId);
            const bookCode = "LUK";
            const readOutput = await epitelete.readPerf(bookCode);
            const fetchedOutput = await epitelete.fetchPerf(bookCode);
            console.log('fetchedOutput',fetchedOutput);
            const docSets = fetchedOutput?.docSets;
            console.log('docSets',docSets);
            const docSetKeys = Object.keys(docSets);
            const docSet0 = docSets[docSetKeys[0]];
            const documents = docSet0?.documents;
            console.log('documents:',documents);
            const documentKeys = Object.keys(documents);
            const document0 = documents[documentKeys[0]];
            console.log('document0:',document0);
            const sequences = document0.sequences;
            console.log('sequences:',sequences);
            const sequencesKeys = Object.keys(sequences);
            const sequence0 = sequences[sequencesKeys[0]];
            console.log('sequence0:',sequence0);
            const blocks = sequence0?.blocks;
            const block1 = blocks[1];
            console.log('block1:',block1);
            const content = block1?.content;
            console.log('content:',content);
            t.deepEqual(readOutput,fetchedOutput);
        } catch (err) {
            t.error(err);
        }
        t.end()
    }
)

test(
    `localBookCodes() is defined (${testGroup})`,
    async t => {
        const docSetId = "DBL/eng_engWEBBE";
        const epitelete = new Epitelete(pk, docSetId);
        t.ok(typeof epitelete.localBookCodes === "function");
        t.end();
    }
)

test(
    `localBookCodes returns list of document keys (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete(pk, docSetId);
            const bookCodes = ["LUK", "MRK", "3JN", "GEN"];
            for (const bookCode of bookCodes) {
                await epitelete.readPerf(bookCode);
            }
            const localBookCodes = epitelete.localBookCodes();
            t.ok(localBookCodes)
            t.deepEqual(localBookCodes, bookCodes);
        } catch (err) {
            t.error(err);
            console.log(err);
        }
        t.end()
    }
)

test(
    `bookHeaders returns object of available book codes (${testGroup})`,
    async t => {
        debugger;
        try {
            const expectedMinHeaderCount = `5`;
            const expectedBookCount = 81;
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete(pk, docSetId);

            const bookHeaders = epitelete.bookHeaders();
            // console.log('bookHeaders returns:', JSON.stringify(bookHeaders, null,2));
            const bookCodes = Object.keys(bookHeaders);
            // console.log('available book codes:', bookCodes);
            const bookCount = bookCodes.length;
            // console.log('number of books:', bookCount);

            t.ok(bookCodes)
            t.equal(bookCount, expectedBookCount, 'expected ' + expectedBookCount + ' books');
            for (const bookCode of bookCodes) {
                const headers = bookHeaders[bookCode];
                const headerCount = Object.keys(headers).length;
                t.ok(headerCount >= expectedMinHeaderCount, bookCode + ' expected at least ' + expectedMinHeaderCount + ' fields');
            }
        } catch (err) {
            t.error(err);
            console.log(err);
        }
        t.end()
    }
)

test(
    `clearPerf() is defined (${testGroup})`,
    async t => {
        const docSetId = "DBL/eng_engWEBBE";
        const epitelete = new Epitelete(pk, docSetId);
        t.ok(typeof epitelete.clearPerf === "function");
        t.end();
    }
)

test(
    `clearPerf clears list of document keys (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete(pk, docSetId);
            const bookCode = "LUK";
            await epitelete.readPerf(bookCode);
            t.ok("LUK" in epitelete.documents, "Can not clearPerf because no document was added.");
            epitelete.clearPerf()
            t.same(epitelete.documents, {});
        } catch (err) {
            t.error(err);
            console.log(err);
        }
        t.end()
    }
)