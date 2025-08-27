// Placeholder auto-sort logic: picks a category based on a hash of title
// Enforces cap (20 per category) and sets miniFinal flag when a category fills.


const Submission = require('../models/submission');


const CATEGORIES = ['Design','Technology','Marketing','Innovation','creative'];
const CAP = 20;


function hashStringToIndex(s){
let h = 0;
for(let i=0;i<s.length;i++){ h = (h<<5) - h + s.charCodeAt(i); h |= 0; }
return Math.abs(h) % CATEGORIES.length;
}


async function autoAssignAndEnforce(submission){
// Choose a category deterministically (placeholder)
const idx = hashStringToIndex(submission.title || submission._id.toString());
const assigned = CATEGORIES[idx];


// Count current assigned submissions in that category
const count = await Submission.countDocuments({ assignedCategory: assigned });


if(count >= CAP){
// Category full: find alternate category with space (simple first-fit)
for(const cat of CATEGORIES){
const c = await Submission.countDocuments({ assignedCategory: cat });
if(c < CAP){
submission.assignedCategory = cat;
break;
}
}
// If all full, assign original (still accept but miniFinal flags will be set)
if(!submission.assignedCategory) submission.assignedCategory = assigned;
} else {
submission.assignedCategory = assigned;
}


await submission.save();


// After saving, check if category reached CAP and set miniFinal on all entries in that category
const newCount = await Submission.countDocuments({ assignedCategory: submission.assignedCategory });
if(newCount >= CAP){
await Submission.updateMany(
{ assignedCategory: submission.assignedCategory },
{ $set: { miniFinal: true } }
);
}


return submission;
}


module.exports = { autoAssignAndEnforce, CATEGORIES, CAP };