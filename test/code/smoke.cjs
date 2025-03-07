const test = require("tape");
const path = require("path");
const fse = require("fs-extra");
const {UWProskomma} = require("uw-proskomma");
const Epitelete = require("../../src/index").default;
const _ = require("lodash");


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
            t.doesNotThrow(() => new Epitelete({pk, docSetId:"DBL/eng_engWEBBE"}));
            t.throws(() => new Epitelete({}), "2 arguments");
            t.throws(() => new Epitelete({ pk, docSetId:"eBible/fra_fraLSG"}),"docSetId is not present");
        } catch (err) {
            t.error(err)
        }
    },
);

// fetchPerf tests

test(
    `fetchPerf() is defined (${testGroup})`,
    async t => {
        const docSetId = "DBL/eng_engWEBBE";
        const epitelete = new Epitelete({ pk, docSetId });
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
            const epitelete = new Epitelete({ pk, docSetId });
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
            const epitelete = new Epitelete({ pk, docSetId });
            const bookCode = "LUK";
            const doc = await epitelete.fetchPerf(bookCode);
            for (const k of ["headers", "tags", "sequences", "mainSequence"]) {
                t.ok(k in doc);
            }
        } catch (err) {
            t.error(err)
        }
        t.end()
    }
)

test(
    `fetchPerf() adds document to documents property (${testGroup})`,
    async t => {
        t.plan(2);
        const docSetId = "DBL/eng_engWEBBE";
        const epitelete = new Epitelete({ pk, docSetId });
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
        const epitelete = new Epitelete({ pk, docSetId });
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
            const epitelete = new Epitelete({ pk, docSetId });
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
            const epitelete = new Epitelete({ pk, docSetId });
            const bookCode = "LUK";
            const readOutput = await epitelete.readPerf(bookCode);
            const fetchedOutput = await epitelete.fetchPerf(bookCode);
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
        const epitelete = new Epitelete({ pk, docSetId });
        t.ok(typeof epitelete.localBookCodes === "function");
        t.end();
    }
)

test(
    `localBookCodes returns list of document keys (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete({ pk, docSetId });
            const bookCodes = ["LUK", "MRK", "3JN", "GEN"];
            for (const bookCode of bookCodes) {
                await epitelete.readPerf(bookCode);
            }
            const localBookCodes = epitelete.localBookCodes();
            t.ok(localBookCodes)
            t.deepEqual(localBookCodes, bookCodes);
        } catch (err) {
            t.error(err);
        }
        t.end()
    }
)

test(
    `bookHeaders returns USFM headers for available book codes (${testGroup})`,
    async t => {
        debugger;
        try {
            const expectedMinHeaderCount = `5`;
            const expectedBookCount = 81;
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete({ pk, docSetId });

            const bookHeaders = epitelete.bookHeaders();
            const bookCodes = Object.keys(bookHeaders);
            const bookCount = bookCodes.length;

            t.ok(bookCodes)
            t.equal(bookCount, expectedBookCount, 'expected ' + expectedBookCount + ' books');
            for (const bookCode of bookCodes) {
                const headers = bookHeaders[bookCode];
                const headerCount = Object.keys(headers).length;
                t.ok(headerCount >= expectedMinHeaderCount, bookCode + ' expected at least ' + expectedMinHeaderCount + ' fields');
            }
        } catch (err) {
            t.error(err);
        }
        t.end()
    }
)

test(
    `clearPerf() is defined (${testGroup})`,
    async t => {
        const docSetId = "DBL/eng_engWEBBE";
        const epitelete = new Epitelete({ pk, docSetId });
        t.ok(typeof epitelete.clearPerf === "function");
        t.end();
    }
)

test(
    `clearPerf clears list of document keys (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete({ pk, docSetId });
            const bookCode = "LUK";
            await epitelete.readPerf(bookCode);
            t.ok("LUK" in epitelete.documents, "Can not clearPerf because no document was added.");
            epitelete.clearPerf()
            t.same(epitelete.documents, {});
            t.same(epitelete.history.stack, {});
            t.same(epitelete.history.cursor, {});
        } catch (err) {
            t.error(err);
        }
        t.end()
    }
)

test(
    `test the unchanged PERF (round trip) writePerf (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete({ pk, docSetId });
            const bookCode = "LUK";
            await epitelete.readPerf(bookCode);
            const documents = epitelete.documents;
            const lukeDoc = documents[bookCode];
            const sequences = lukeDoc?.sequences;
            const sequenceId3 = Object.keys(sequences)[3];
            const sequence3 = sequences[sequenceId3];
            const newDoc = await epitelete.writePerf(bookCode, sequenceId3, sequence3);
            t.deepEqual(newDoc,lukeDoc, "expect to be unchanged");
        } catch (err) {
            t.error(err);
            console.log(err);
        }
        t.end()
    }
)

test(
    `test the changed PERF (round trip) writePerf (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete({ pk, docSetId });
            const bookCode = "LUK";
            await epitelete.readPerf(bookCode);
            const documents = epitelete.documents;
            const _doc = _.cloneDeep(documents[bookCode]);
            const lukeDoc = _.cloneDeep(_doc);
            // console.log("Luke:",JSON.stringify(lukeDoc, null, 4));
            const sequences = lukeDoc?.sequences;
            const sequenceId3 = Object.keys(sequences)[3];
            const sequence3 = sequences[sequenceId3];
            let newBlocks = [];
            sequence3.blocks = newBlocks;
            const newDoc = await epitelete.writePerf(bookCode,
                sequenceId3,
                sequence3
            );
            t.notDeepEqual(newDoc,_doc, "expect to be changed");
            t.deepEqual(newDoc.sequences[sequenceId3].blocks,
                newBlocks,
                "expected new blocks to be one less than original"
            );
        } catch (err) {
            t.error(err);
        }
        t.end()
    }
)

test(
    `test the undoStack with writePerf dose not exceed MAX_UNDO (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete({pk, docSetId});
            const bookCode = "LUK";
            await epitelete.readPerf(bookCode);
            const documents = epitelete.documents;
            const _doc = _.cloneDeep(documents[bookCode]);
            const lukeDoc = _.cloneDeep(_doc);
            // console.log("Luke:",JSON.stringify(lukeDoc, null, 4));
            const sequences = lukeDoc?.sequences;
            const sequenceId3 = Object.keys(sequences)[3];
            const sequence3 = sequences[sequenceId3];
            let newBlocks = [];
            sequence3.blocks = newBlocks;
            for(let i=0; i<epitelete.STACK_LIMIT+1; i++){
                const newDoc = await epitelete.writePerf(bookCode,
                    sequenceId3,
                    sequence3
                );
            }
            t.equal(epitelete.history.stack[bookCode].length, epitelete.STACK_LIMIT, 'should be equal to STACK_LIMIT')
        } catch (err) {
            t.error(err);
        }
        t.end()
    }
)

test(
    `test writePerf with wrong bookCode (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete({ pk, docSetId });
            const bookCode = "LUK";
            const bookCode1 = "LK"
            await epitelete.readPerf(bookCode);
            const documents = epitelete.documents;
            const lukeDoc = documents[bookCode];
            const sequences = lukeDoc?.sequences;
            t.ok(sequences);
            const sequenceId3 = Object.keys(sequences)[3];
            const sequence3 = sequences[sequenceId3];
            const newDoc = await epitelete.writePerf(bookCode1, sequenceId3, sequence3);
            t.fail('Did not throw!');
        } catch (err) {
            if(err.toString() !== 'document not found: LK'){
                t.fail(err)
            }
            else{
                t.pass('Success')
            }
        }
        t.end()
    }
)

test(
    `test writePerf with wrong sequenceId (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete({ pk, docSetId });
            const bookCode = "LUK";
            await epitelete.readPerf(bookCode);
            const documents = epitelete.documents;
            const lukeDoc = documents[bookCode];
            const sequences = lukeDoc?.sequences;
            const sequenceId3 = Object.keys(sequences)[3];
            const sequence3 = sequences[sequenceId3];
            const newDoc = await epitelete.writePerf(bookCode, sequenceId3+'12', sequence3);
            t.fail('Expected error')
        } catch (err) {
            if(!err.toString().includes('not found')) {
                t.fail('unexpected error')
            }
            else{
                t.pass('Success')
            }
        }
        t.end()
    }
)

test(
    `test writePerf for ProskommaJsonValidator with wrong sequence (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete({ pk, docSetId });
            const bookCode = "LUK";
            await epitelete.readPerf(bookCode);
            const documents = epitelete.documents;
            const lukeDoc = documents[bookCode];
            const sequences = lukeDoc?.sequences;
            const sequenceId3 = Object.keys(sequences)[3];
            const sequence3 = sequences[sequenceId3];
            const newDoc = await epitelete.writePerf(bookCode, sequenceId3, sequence3+'12');
            t.fail('Expected error')
        } catch (err) {
            if (!err.toString().includes('is not valid')) {
                t.fail('unexpected error')
            }
            else{
                t.pass('Success')
            }
        }
        t.end()
    }
)

test(
    `test can't Undo with empty document (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete({pk, docSetId});
            const bookCode = "LUK";
            const canUndo = epitelete.canUndo(bookCode);
            t.notOk(canUndo);
        }catch (err){
            t.error(err);
        }
        t.end();
    }
)

test(
    `test can't Undo with unchanged document (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete({pk, docSetId});
            const bookCode = "LUK";
            await epitelete.readPerf(bookCode)
            const canUndo = epitelete.canUndo(bookCode);
            t.notOk(canUndo);
        }catch (err){
            t.error(err);
        }
        t.end();
    }

)

test(
    `test can Undo with changed document (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete({pk, docSetId});
            const bookCode = "LUK";
            await epitelete.readPerf(bookCode);
            const documents = epitelete.documents;
            const _doc = _.cloneDeep(documents[bookCode]);
            const lukeDoc = _.cloneDeep(_doc);
            // console.log("Luke:",JSON.stringify(lukeDoc, null, 4));
            const sequences = lukeDoc?.sequences;
            const sequenceId3 = Object.keys(sequences)[3];
            const sequence3 = sequences[sequenceId3];
            let newBlocks = [];
            sequence3.blocks = newBlocks;
            const newDoc = await epitelete.writePerf(bookCode,
                sequenceId3,
                sequence3
            );
            const canUndo = epitelete.canUndo(bookCode);
            t.ok(canUndo);
            t.equal(epitelete.history.cursor[bookCode], 1, 'expected the history.cursor to be 1')
        }catch (err){
            t.error(err);
        }
        t.end();
    }

)

test(
    `test can't redo with empty document (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete({pk, docSetId});
            const bookCode = "LUK";
            const canRedo = epitelete.canRedo(bookCode);
            t.notOk(canRedo);
        }catch (err){
            t.error(err);
        }
        t.end();
    }

)

test(
    `test can't redo with unchanged document (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete({pk, docSetId});
            const bookCode = "LUK";
            await epitelete.readPerf(bookCode)
            const canRedo = epitelete.canRedo(bookCode);
            t.notOk(canRedo);
        }catch (err){
            t.error(err);
        }
        t.end();
    }

)

test(
    `test can't redo with changed document (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete({pk, docSetId});
            const bookCode = "LUK";
            await epitelete.readPerf(bookCode)
            const documents = epitelete.documents;
            const _doc = _.cloneDeep(documents[bookCode]);
            const lukeDoc = _.cloneDeep(_doc);
            // console.log("Luke:",JSON.stringify(lukeDoc, null, 4));
            const sequences = lukeDoc?.sequences;
            const sequenceId3 = Object.keys(sequences)[3];
            const sequence3 = sequences[sequenceId3];
            let newBlocks = [];
            sequence3.blocks = newBlocks;
            const newDoc = await epitelete.writePerf(bookCode,
                sequenceId3,
                sequence3
            );
            const canRedo = epitelete.canRedo(bookCode);
            t.notOk(canRedo);
        }catch (err){
            t.error(err);
        }
        t.end();
    }

)

test(
    `test can redo with changed document (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete({pk, docSetId});
            const bookCode = "LUK";
            await epitelete.readPerf(bookCode)
            const documents = epitelete.documents;
            const _doc = _.cloneDeep(documents[bookCode]);
            const lukeDoc = _.cloneDeep(_doc);
            // console.log("Luke:",JSON.stringify(lukeDoc, null, 4));
            const sequences = lukeDoc?.sequences;
            const sequenceId3 = Object.keys(sequences)[3];
            const sequence3 = sequences[sequenceId3];
            let newBlocks = [];
            sequence3.blocks = newBlocks;
            const newDoc = await epitelete.writePerf(bookCode,
                sequenceId3,
                sequence3
            );
            const canRedo = epitelete.canRedo(bookCode);
            t.notOk(canRedo);
        }catch (err){
            t.error(err);
        }
        t.end();
    }

)

test(
    `test can redo after undo (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete({pk, docSetId});
            const bookCode = "LUK";
            await epitelete.readPerf(bookCode)
            const documents = epitelete.documents;
            const _doc = _.cloneDeep(documents[bookCode]);
            const lukeDoc = _.cloneDeep(_doc);
            // console.log("Luke:",JSON.stringify(lukeDoc, null, 4));
            const sequences = lukeDoc?.sequences;
            const sequenceId3 = Object.keys(sequences)[3];
            const sequence3 = sequences[sequenceId3];
            let newBlocks = [];
            sequence3.blocks = newBlocks;
            const newDoc = await epitelete.writePerf(bookCode,
                sequenceId3,
                sequence3
            );
            epitelete.undoPerf(bookCode);
            const canRedo = epitelete.canRedo(bookCode);
            t.ok(canRedo);
        }catch (err){
            t.error(err);
        }
        t.end();
    }

)

test(
    `test shouldn't be undoPerf with unchanged document (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete({pk, docSetId});
            const bookCode = "LUK";
            await epitelete.readPerf(bookCode)
            const undoPerf = epitelete.undoPerf(bookCode);
            t.notOk(undoPerf);
        }catch (err){
            t.error(err);
        }
        t.end();
    }

)

test(
    `test can undoPerf with changed document (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete({pk, docSetId});
            const bookCode = "LUK";
            await epitelete.readPerf(bookCode)
            const documents = epitelete.documents;
            const _doc = _.cloneDeep(documents[bookCode]);
            const lukeDoc = _.cloneDeep(_doc);
            // console.log("Luke:",JSON.stringify(lukeDoc, null, 4));
            const sequences = lukeDoc?.sequences;
            const sequenceId3 = Object.keys(sequences)[3];
            const sequence3 = sequences[sequenceId3];
            let newBlocks = [];
            sequence3.blocks = newBlocks;
            const newDoc = await epitelete.writePerf(bookCode,
                sequenceId3,
                sequence3
            );
            const undoPerf = epitelete.undoPerf(bookCode);
            t.ok(undoPerf);
            t.deepEqual(undoPerf, _doc, 'expect undoPerf should return the original doc')
        }catch (err){
            t.error(err);
        }
        t.end();
    }

)


test(
    `test shouldn't be redoPerf with unchanged document (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete({pk, docSetId});
            const bookCode = "LUK";
            await epitelete.readPerf(bookCode)
            const redoPerf = epitelete.redoPerf(bookCode);
            t.notOk(redoPerf);
        }catch (err){
            t.error(err);
        }
        t.end();
    }

)

test(
    `test can't redoPerf with changed document (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete({pk, docSetId});
            const bookCode = "LUK";
            await epitelete.readPerf(bookCode)
            const documents = epitelete.documents;
            const _doc = _.cloneDeep(documents[bookCode]);
            const lukeDoc = _.cloneDeep(_doc);
            // console.log("Luke:",JSON.stringify(lukeDoc, null, 4));
            const sequences = lukeDoc?.sequences;
            const sequenceId3 = Object.keys(sequences)[3];
            const sequence3 = sequences[sequenceId3];
            let newBlocks = [];
            sequence3.blocks = newBlocks;
            const newDoc = await epitelete.writePerf(bookCode,
                sequenceId3,
                sequence3
            );
            const redoPerf = epitelete.redoPerf(bookCode);
            t.notOk(redoPerf);
        }catch (err){
            t.error(err);
        }
        t.end();
    }

)

test(
    `test can redoPerf after undoPerf (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete({pk, docSetId});
            const bookCode = "LUK";
            await epitelete.readPerf(bookCode)
            const documents = epitelete.documents;
            const _doc = _.cloneDeep(documents[bookCode]);
            const lukeDoc = _.cloneDeep(_doc);
            // console.log("Luke:",JSON.stringify(lukeDoc, null, 4));
            const sequences = lukeDoc?.sequences;
            const sequenceId3 = Object.keys(sequences)[3];
            const sequence3 = sequences[sequenceId3];
            let newBlocks = [];
            sequence3.blocks = newBlocks;
            const newDoc = await epitelete.writePerf(bookCode,
                sequenceId3,
                sequence3
            );
            epitelete.undoPerf(bookCode);
            const redoPerf = epitelete.redoPerf(bookCode);
            t.ok(redoPerf);
        }catch (err){
            t.error(err);
        }
        t.end();
    }

)

test(
    `test instantiate Epitelete in standalonte mode (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eBible/fra_fraLSG";
            const epitelete = new Epitelete({ docSetId });
            const bookCode = "JON";
            t.ok(epitelete.backend === "standalone");
            try {
                await epitelete.fetchPerf(bookCode);
                t.fail("standalone instance should not fetchPerf");
            } catch (err) {
                t.pass("standalone instance fails at readPerf");
            }
            const perfJSON = fse.readJsonSync(path.resolve(path.join(__dirname, "..", "test_data", "fra_lsg_jon_document.json")));
            await epitelete.sideloadPerf(bookCode, perfJSON);
            const savedDoc = await epitelete.readPerf(bookCode);
            t.deepEqual(savedDoc, perfJSON, "perfJSON is saved in memory");
        } catch (err) {
            t.fail(err);
        }
        t.end()
    }
)

test(
    `test checkPERF shows no warnings (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete({pk, docSetId});
            const bookCode = "LUK";
            await epitelete.readPerf(bookCode);
            const documents = epitelete.documents;
            const sequences = documents[bookCode]?.sequences;
            const mainSequenceId = Object.keys(sequences)[0];
            const mainSequence = sequences[mainSequenceId];
            const warnings = await epitelete.checkPerfSequence(mainSequence);
            console.log(warnings);
            t.deepEqual(warnings, [])
        } catch (err) {
            t.error(err);
        }
        t.end()
    }
)


test(
    `test checkPERF shows some warnings (${testGroup})`,
    async t => {
        try {
            const docSetId = "DBL/eng_engWEBBE";
            const epitelete = new Epitelete({pk, docSetId});
            const bookCode = "LUK";
            await epitelete.readPerf(bookCode);
            const documents = epitelete.documents;
            const sequences = documents[bookCode]?.sequences;
            const mainSequenceId = Object.keys(sequences)[0];
            const mainSequence = sequences[mainSequenceId];
            // console.log("Luke:",JSON.stringify(mainSequence, null, 4));
            // Insert an out of order verse marker.
            mainSequence.blocks[3].content.push({
                type: 'verses',
                number: 2,
            })
            const warnings = await epitelete.checkPerfSequence(mainSequence);
            console.log(warnings);
            t.deepEqual(warnings, [ 'Verse 2 is out of order, expected 11', 'Verse 11 is out of order, expected 3' ])
        } catch (err) {
            t.error(err);
        }
    }
)
