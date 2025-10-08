#!/usr/bin/env node
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import path from 'path'
import fs from 'fs'

dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') })

const uri = process.env.RMS_MONGODB_URI || process.env.MONGODB_URI || process.env.MONGO_URI
if (!uri) {
  console.error('No MongoDB URI found in environment (RMS_MONGODB_URI). Exiting.')
  process.exit(1)
}

import Book from '../models/Book.js'

function normalizeIsbn(isbn){
  if(!isbn) return ''
  return String(isbn).replace(/[^0-9A-Za-z]/g,'').toLowerCase()
}

function normalizeTitle(t){
  if(!t) return ''
  return String(t).replace(/\s+/g,' ').trim().toLowerCase()
}

function scoreDocument(doc){
  // count of non-empty meaningful fields
  const fields = ['isbn','title','author','publication','edition','cover_image','slNo']
  let score = 0
  for(const f of fields){
    if(doc[f] !== undefined && doc[f] !== null && String(doc[f]).trim() !== '') score++
  }
  // prefer larger quantity/available
  if(typeof doc.quantity === 'number') score += Math.min(doc.quantity, 5)
  return score
}

async function main(){
  console.log('Connecting to', uri.replace(/^(mongodb.*:\/\/)(.*)$/,'$1****'))
  await mongoose.connect(uri, { maxPoolSize: 10 })
  console.log('Connected to Mongo')

  const dryRun = process.argv.includes('--dry-run') || process.argv.includes('-d')

  const books = await Book.find({}).lean()
  console.log(`Loaded ${books.length} books from DB`)

  const groups = new Map()
  for(const b of books){
    const isbnKey = normalizeIsbn(b.isbn)
    let key
    if(isbnKey){
      key = `isbn:${isbnKey}`
    } else {
      const t = normalizeTitle(b.title)
      const s = b.slNo || ''
      key = `title:${t}|slNo:${s}`
    }
    if(!groups.has(key)) groups.set(key, [])
    groups.get(key).push(b)
  }

  let duplicateGroups = 0
  let totalRemoved = 0
  const toRemoveIds = []

  for(const [key, arr] of groups){
    if(arr.length <= 1) continue
    duplicateGroups++
    // choose keeper: highest score, if tie then latest createdAt
    arr.sort((a,b)=>{
      const sa = scoreDocument(a)
      const sb = scoreDocument(b)
      if(sa !== sb) return sb - sa
      const ta = new Date(a.createdAt || a.addedOn || 0).getTime()
      const tb = new Date(b.createdAt || b.addedOn || 0).getTime()
      return tb - ta
    })
    const keeper = arr[0]
    const dupes = arr.slice(1)
    console.log(`Group ${key} -> keep ${keeper._id} (${keeper.title || ''}) remove ${dupes.length} docs`)
    for(const d of dupes){
      toRemoveIds.push(d._id)
    }
    totalRemoved += dupes.length
  }

  console.log(`Found ${duplicateGroups} duplicate groups, total duplicate docs: ${totalRemoved}`)

  if(toRemoveIds.length === 0){
    console.log('No duplicates to remove. Exiting.')
    await mongoose.disconnect()
    return process.exit(0)
  }

  if(dryRun){
    console.log('Dry-run mode: no deletions executed. Use --no-dry or omit --dry-run to actually delete.')
    console.log('Example ids to remove:', toRemoveIds.slice(0,20))
    await mongoose.disconnect()
    return process.exit(0)
  }

  // Safety: write backup of duplicate IDs to file
  const outPath = path.join(process.cwd(), 'backend', 'data', `duplicateBookIds-${Date.now()}.json`)
  fs.writeFileSync(outPath, JSON.stringify({ removed: toRemoveIds, count: toRemoveIds.length }, null, 2))
  console.log('Wrote backup of ids to', outPath)

  // perform deletion
  const res = await Book.deleteMany({ _id: { $in: toRemoveIds } })
  console.log(`Deleted ${res.deletedCount} duplicate documents`)

  await mongoose.disconnect()
  console.log('Done.')
  process.exit(0)
}

main().catch(err=>{
  console.error('Script error', err)
  process.exit(2)
})
