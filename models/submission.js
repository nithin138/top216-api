const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const submissionSchema = new Schema(
{
title: { type: String, required: true },
description: { type: String },
author: { type: String, required: true },
category: { type: String, enum: ['Design','Technology','Marketing','Innovation','creative'], required: true },
assignedCategory: { type: String, enum: ['Design','Technology','Marketing','Innovation','creative'], index: true },
miniFinal: { type: Boolean, default: false },
status: { type: String, enum: ['submitted','shortlisted','winner','runnerup'], default: 'submitted' },
createdAt: { type: Date, default: Date.now }
},
{ timestamps: true }
);


module.exports = mongoose.model('Submission', submissionSchema);