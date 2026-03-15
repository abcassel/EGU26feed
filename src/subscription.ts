// Inside src/subscription.ts
const postsToCreate = ops.posts.creates
  .filter((create) => {
    const text = create.record.text.toLowerCase()
    // 1. Check for keyword
    // 2. Ensure it's not a reply (optional but recommended for clean feeds)
    return text.includes('egu26') && !create.record.reply
  })
  .map((create) => {
    return {
      uri: create.uri,
      cid: create.cid,
      replyParent: create.record.reply?.parent.uri ?? null,
      replyRoot: create.record.reply?.root.uri ?? null,
      indexedAt: new Date().toISOString(),
    }
  })
