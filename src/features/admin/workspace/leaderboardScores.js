// Match AskKh's all-time score: add each author's loaded post scores.
export function rankContributors(posts) {
  const users = new Map();
  for (const post of posts) {
    if (!post || post.ownerId == null) continue;
    const id = String(post.ownerId);
    if (!users.has(id)) {
      users.set(id, {
        id: post.ownerId,
        name: post.ownerDisplayName || `User #${post.ownerId}`,
        points: 0,
      });
    }
    if (Number.isFinite(post.score)) {
      users.get(id).points += post.score;
    }
  }
  const ranked = Array.from(users.values());
  ranked.sort((a, b) => b.points - a.points || String(a.id).localeCompare(String(b.id), undefined, { numeric: true }));
  let rank = 0;
  for (let index = 0; index < ranked.length; index++) {
    if (index === 0 || ranked[index].points !== ranked[index - 1].points) {
      rank = index + 1;
    }
    ranked[index].rank = rank;
  }
  return ranked;
}
