import {
  OutputSchema as RepoEvent,
  isCommit,
} from './lexicon/types/com/atproto/sync/subscribeRepos'
import { FirehoseSubscriptionBase, Operations } from './util/subscription'

export class FirehoseSubscription extends FirehoseSubscriptionBase {
  async handleEvent(evt: RepoEvent) {
    if (!isCommit(evt)) return

    const ops = await Operations.list(evt)

    // --- YOUR LOGIC STARTS HERE ---
    const postsToCreate = ops.posts.creates
      .filter((create) => {
        const text = create.record.text.toLowerCase()
        // Filters for keyword and ensures it's an original post (not a reply)
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
    // --- YOUR LOGIC ENDS HERE ---

    if (postsToCreate.length > 0) {
      await this.db
        .insertInto('post')
        .values(postsToCreate)
        .onConflict((oc) => oc.doNothing())
        .execute()
    }
  }
}
