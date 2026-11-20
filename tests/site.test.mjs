import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import path from "node:path";

const dir=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(dir,"..");
const load=relative=>readFileSync(path.join(root,relative),"utf8");
const html=load("index.html");
const main=load("script.js");
const motion=load("experience.js");
const css=load("experience.css");

test("Archive includes required static files and ordered styles",()=>{
 for(const file of ["index.html","styles.css","experience.css","script.js","experience.js","favicon.svg","templates/mono/index.html","templates/signal/index.html"]){
  assert.ok(existsSync(path.join(root,file)),file+" must exist");
 }
 assert.match(html, /<link rel="stylesheet" href="\.\/styles\.css">\s*<link rel="stylesheet" href="\.\/experience\.css">/);
 assert.match(html, /<script src="\.\/script\.js" defer><\/script>\s*<script src="\.\/experience\.js" defer><\/script>/);
});

test("Archive anchors map to unique real sections",()=>{
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
 const links=[...html.matchAll(/\bhref="#([^"]+)"/g)].map(x=>x[1]);
 assert.equal(new Set(ids).size,ids.length,"Duplicate IDs");
 for(const id of links)assert.ok(ids.includes(id),"Missing target for #"+id);
});

test("Immersive scenes are scroll driven, not scroll intercepted",()=>{
 assert.match(html,/id="lab-bridge"/);
 assert.match(html,/id="archive-stage"/);
 assert.match(html,/class="lab-ribbon"/);
 assert.match(motion,/requestAnimationFrame\(onScrollFrame\)/);
 assert.match(motion,/IntersectionObserver/);
 assert.match(motion,/prefers-reduced-motion/);
 assert.match(motion,/visibilitychange/);
 assert.doesNotMatch(motion,/preventDefault\(\)/);
 assert.doesNotMatch(motion,/(?:gsap|three|jquery)\./i);
});

test("Interactive links, dialogs and project brief remain intact",()=>{
 assert.match(html,/id="brief-form"/);
 assert.match(html,/id="teams-dialog"/);
 assert.match(html,/id="cafe-dialog"/);
 assert.match(main,/showModal/);
 assert.match(main,/copyText/);
 assert.match(html,/templates\/mono\//);
 assert.match(html,/templates\/signal\//);
});

test("Cinema layer CSS blocks are balanced and respect reduced motion",()=>{
 const cleaned=css.replace(/\/\*[\s\S]*?\*\//g,"");
 let depth=0;
 for(const char of cleaned){if(char==="{")depth++;if(char==="}")depth--;assert.ok(depth>=0,"Unexpected closing brace");}
 assert.equal(depth,0);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/@media\(hover:none\),\(pointer:coarse\)/);
});
